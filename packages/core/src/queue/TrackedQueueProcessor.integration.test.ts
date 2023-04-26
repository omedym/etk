import { Runfiles } from '@bazel/runfiles';
import { InjectQueue, BullModule, Processor, OnQueueEvent, QueueEventsListener, QueueEventsHost } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createId } from '@paralleldrive/cuid2';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { DelayedError, Job, Queue } from 'bullmq';
import { DateTime, Duration } from 'luxon';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

import { RepositoryPostgresModule, TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { IMessage, IUnknownMessage } from '../message';
import { Providers } from '../providers';
import { TrackedJobEventProcessor } from './TrackedJobEventProcessor';
import { TrackedJobEventQueue } from './TrackedJobEventQueue';
import { TrackedQueueListener } from './TrackedQueueListener';
import { TrackedQueueProcessor } from './TrackedQueueProcessor';
import { ILogger } from '../telemetry';

// import sentryTestkit from 'sentry-testkit';
// const { testkit, sentryTransport } = sentryTestkit();


const TestConfig = {
  postgres: {
    port: process.env.TESTCONFIG__POSTGRES__PORT
      ? Number(process.env.TESTCONFIG__POSTGRES__PORT) : 5432,
    startupMs: process.env.TESTCONFIG__POSTGRES__STARTUP_MS
      ? Number(process.env.TESTCONFIG__POSTGRES__STARTUP_MS) : 1000 * 60,
    schema: 'tenant',
    userName: process.env.TESTCONFIG__POSTGRES__USER_NAME
      ? process.env.TESTCONFIG__POSTGRES__USER_NAME : 'postgres',
    userPassword: process.env.TESTCONFIG__POSTGRES__USER_PASSWORD
      ? process.env.TESTCONFIG__POSTGRES__USER_PASSWORD : 'postgres',
  },
  redis: {
    port: process.env.TESTCONFIG__REDIS__PORT
      ? Number(process.env.TESTCONFIG__REDIS__PORT) : 6379,
    startupMs: process.env.TESTCONFIG__REDIS__STARTUP_MS
      ? Number(process.env.TESTCONFIG__REDIS__STARTUP_MS) : 1000 * 15,
  },
  bullMq: {
    delayMs: process.env.TESTCONFIG__BULLMQ__DELAY_MS
      ? Number(process.env.TESTCONFIG__BULLMQ__DELAY_MS) : 1000 * 2,
    showLogs: process.env.TESTCONFIG__BULLMQ__SHOWLOGS
      ? Boolean(process.env.TESTCONFIG__BULLMQ__SHOWLOGS) : true,
  },
  jest: {
    timeoutMs: process.env.TESTCONFIG__JEST__TIMEOUT_MS
      ? Number(process.env.TESTCONFIG__JEST__TIMEOUT_MS) : 1000 * 15,
  },
};

const runfiles = new Runfiles(process.env);
const execAsync = promisify(exec);

const mockLogger = {
  // info: jest.fn(),
  info: (x: any) => console.info(x),
  requestLogger: jest.fn(),
  matchFilePartRegEx: jest.fn(),
  // log: jest.fn(),
  warn: jest.fn(),
  // warn: (x: any) => console.warn(x),
  error: jest.fn(),
  // debug: jest.fn(),
  debug: (x: any) => console.debug(x),
} as unknown as ILogger;

/** Monitor A BullMQ Queue Using BullMQ Queue Events */
class QueueListener extends QueueEventsHost {
  logs: string[] = [`[000] Queue Listener Start`];

  log(message: string) {
    const next = this.logs.length;
    const entry = next > 99
      ? next
      : next > 9
        ? `0${next}`
        : `00${next}`;

    this.logs.push(`[${entry}] ${message}`);
  }

  onAdded(jobId: string, name: string) { this.log(`Job ${jobId} Added: ${name}`) };
  onCompleted(jobId: string, returnvalue: string) { this.log(`Job ${jobId} Completed: ${returnvalue}`) };
  onDelayed(jobId: string, delay: number) { this.log(`Job ${jobId} Delayed: ${delay}`)}
  onPaused() { this.log(`Queue Paused`) };
  onResumed() { this.log(`Queue Resumed`) };

  @OnQueueEvent('added')
  _onAdded(event: { jobId: string, name: string }, id: string) { this.onAdded(event.jobId, event.name) }

  @OnQueueEvent('completed')
  _onCompleted(event: { jobId: string, returnvalue: string, prev?: string}, id: string) {
    this.onCompleted(event.jobId, event.returnvalue);
  }

  @OnQueueEvent('delayed')
  _onDelayed(event: { jobId: string, delay: number }, id: string) { this.onDelayed(event.jobId, event.delay) }

  @OnQueueEvent('paused')
  _onPaused() { this.onPaused(); }

  @OnQueueEvent('resumed')
  _onResumed() { this.onResumed(); }
}

type MessageJobData = { id: string; tenantid: string; data: object };
type EmptyJobData = {};
type TestJobData = MessageJobData | EmptyJobData;

const generateTestMessage = (data: IMessage | IUnknownMessage = {}): MessageJobData => { return {
  data,
  id: createId(),
  tenantid: '!!',
}};

describe('TrackedProcessor', () => {
  jest.setTimeout(TestConfig.jest.timeoutMs);

  let testNum = 0;

  let app: INestApplication;
  let postgres: StartedPostgreSqlContainer;
  let redis: StartedTestContainer;

  let trackedJobEventProcessor: TrackedJobEventProcessor;
  let trackedJobEventListener: QueueListener;
  let trackedQueues: TrackedQueueListener;

  let listener: QueueListener;
  let processor: TrackedQueueProcessor;
  let delayedProcessor: TrackedQueueProcessor;
  let producer: { queue: Queue };
  let delayedProducer: { queue: Queue };
  let repository: TrackedQueueRepository;

  let DATABASE_URL_POSTGRES: string;

  const env = process.env;
  process.env = { ...env };

  const insertQueueSpies = (options?: {
    queueListener?: QueueListener;
  }) => {
    const target = {
      queueListener: options?.queueListener || listener,
    }

    return {
      console: {
        info: jest.spyOn(mockLogger, 'info'),
      },
      queue: {
        onLog: jest.spyOn(target.queueListener, 'log'),
        onAdded: jest.spyOn(target.queueListener, 'onAdded'),
        onCompleted: jest.spyOn(target.queueListener, 'onCompleted'),
        onDelayed: jest.spyOn(target.queueListener, 'onDelayed'),
        onPaused: jest.spyOn(target.queueListener, 'onPaused'),
        onResumed: jest.spyOn(target.queueListener, 'onResumed'),
      },
      showListenerLogs: () => TestConfig.bullMq.showLogs && console.warn(`listener.logs`, JSON.stringify(listener.logs, null, 2)),
  }};

  beforeAll(async ()  => {
    const postgresDbName = `test-${DateTime.now().toISO()}`;
    const postgresDbSchema = TestConfig.postgres.schema;

    postgres = await new PostgreSqlContainer('postgres')
      .withDatabase(postgresDbName)
      .withExposedPorts(TestConfig.postgres.port)
      .withPassword(TestConfig.postgres.userPassword)
      .withReuse()
      .withStartupTimeout(TestConfig.postgres.startupMs)
      .withUsername(TestConfig.postgres.userName)
      .start();

    redis = await new GenericContainer('redis')
      .withExposedPorts(TestConfig.redis.port)
      .withStartupTimeout(TestConfig.redis.startupMs)
      .start();

    const postgresHost = postgres.getHost();
    const postgresPort = postgres.getMappedPort(TestConfig.postgres.port);

    const prismaSchemaPath = runfiles.resolveWorkspaceRelative('packages/repository-postgres/prisma');
    const prismaSchemaFile = `${prismaSchemaPath}/schema.prisma`;

    DATABASE_URL_POSTGRES = `postgresql://postgres`
    + `:postgres@${postgresHost}:${postgresPort}`
    + `/${postgresDbName}?schema=${postgresDbSchema}`;

    const PRISMA_QUERY_ENGINE_LIBRARY = `${prismaSchemaPath}`;

    const pushSchemaResult = await execAsync(
      `npx prisma db push --schema "${prismaSchemaFile}" --skip-generate`,
      { env: { ...env, DATABASE_URL_POSTGRES, PRISMA_QUERY_ENGINE_LIBRARY }},
    );

    console.warn(`execAsync.stdout: ${pushSchemaResult?.stdout}`);
  });

  beforeEach(async () => {
    jest.resetModules();

    testNum++;
    const QUEUE_NAME = `test_${testNum}`;
    const DELAYED_QUEUE_NAME = `${QUEUE_NAME}_delayed`;
    const redisConnectionOptions = {
      host: redis.getHost(),
      port: redis.getMappedPort(TestConfig.redis.port)
    };

    @Processor(QUEUE_NAME)
    class TestTrackedProcessor extends TrackedQueueProcessor<TestJobData> { }

    @Processor(DELAYED_QUEUE_NAME)
    class TestDelayedTrackedProcessor extends TrackedQueueProcessor<TestJobData> {
      override async process(job: Job<TestJobData>, token?: string) {
        this.logger.info(`Job ${job.id} Processing: ${job.name}`);

        if (job.attemptsMade > 2) return;

        const runAt = DateTime.now().plus(Duration.fromISO('PT1S'));
        job.moveToDelayed(runAt.toMillis(), token);
        throw new DelayedError();
      }
    }

    class TestQueue {
      constructor(@InjectQueue(QUEUE_NAME) public queue: Queue) { }
    }

    class TestDelayedQueue {
      constructor(@InjectQueue(DELAYED_QUEUE_NAME) public queue: Queue) { }
    }

    /** The `lastEventId` setting is critical for ensuring the listener captures events that occurred before initialization */
    @QueueEventsListener(QUEUE_NAME, { lastEventId: '0-0', connection: redisConnectionOptions })
    @QueueEventsListener(DELAYED_QUEUE_NAME, { lastEventId: '0-0', connection: redisConnectionOptions })
    @QueueEventsListener(Providers.TrackedJobEventQueue, { lastEventId: '0-0', connection: redisConnectionOptions })
    class TestQueueListener extends QueueListener { }

    @QueueEventsListener(Providers.TrackedJobEventQueue, { lastEventId: '0-0', connection: redisConnectionOptions })
    class TrackedJobEventListener extends QueueListener { }

    @QueueEventsListener(DELAYED_QUEUE_NAME, { lastEventId: '0-0', connection: redisConnectionOptions })
    @QueueEventsListener(QUEUE_NAME, { lastEventId: '0-0', connection: redisConnectionOptions })
    class TrackedQueues extends TrackedQueueListener { }

    const moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({ connection: redisConnectionOptions }),
        BullModule.registerQueue({ name: Providers.TrackedJobEventQueue }),
        BullModule.registerQueue({ name: QUEUE_NAME }),
        BullModule.registerQueue({ name: DELAYED_QUEUE_NAME }),
        RepositoryPostgresModule.forRoot({ databaseUrl: DATABASE_URL_POSTGRES, assetBucket: '' }),
      ],
      providers: [
        TestDelayedQueue,
        TestDelayedTrackedProcessor,
        TestQueue,
        TestQueueListener,
        TestTrackedProcessor,
        TrackedJobEventListener,
        TrackedJobEventProcessor,
        TrackedJobEventQueue,
        TrackedQueueRepository,
        TrackedQueues,
        { provide: Providers.ILogger, useValue: mockLogger },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    trackedJobEventProcessor = moduleRef.get<TrackedJobEventProcessor>(TrackedJobEventProcessor);
    trackedJobEventListener = moduleRef.get<TrackedJobEventListener>(TrackedJobEventListener);

    trackedQueues = moduleRef.get<TrackedQueues>(TrackedQueues);

    processor = moduleRef.get<TestTrackedProcessor>(TestTrackedProcessor);
    producer = moduleRef.get<TestQueue>(TestQueue);

    delayedProcessor = moduleRef.get<TestDelayedTrackedProcessor>(TestDelayedTrackedProcessor);
    delayedProducer = moduleRef.get<TestDelayedQueue>(TestDelayedQueue);

    listener = moduleRef.get<TestQueueListener>(TestQueueListener);
    repository = moduleRef.get<TrackedQueueRepository>(TrackedQueueRepository);

    await app.init();
    await trackedJobEventProcessor.worker.waitUntilReady();
    await trackedJobEventListener.queueEvents.waitUntilReady();
    await trackedQueues.queueEvents.waitUntilReady();
    await processor.worker.waitUntilReady();
    await delayedProcessor.worker.waitUntilReady();
    await listener.queueEvents.waitUntilReady();
  });

  afterEach(async () => {
    await app?.close();
  })

  afterAll(async () => {
    await postgres?.stop();
    await redis?.stop();
  })

  describe('event', () => {
    it('can be paused', async () => {
      await processor.pause();
      expect(processor.worker.isPaused()).toBe(true);
    });

    it('CANNOT receive event: paused', async () => {
      const spies = insertQueueSpies();
      // const onPaused = jest.spyOn(listener, '_onPaused');
      await processor.worker.pause(true);

      expect(processor.worker.isPaused()).toBe(true);

      // TODO: Update When Paused Event Emitter Works in BullMQ //
      // This appears to never be emitted under any circumstances
      // at least as far as integration tests go in terms of trying
      // to validate this event:
      //
      // spies.showListenerLogs();
      // expect(spies.queue.onPaused).toHaveBeenCalled();

      expect(spies.queue.onPaused).toHaveBeenCalledTimes(0);
    });

    it('can receive emitted event: added', async () => {
      const spies = insertQueueSpies();

      const cuid = createId();
      const jobId1 = cuid + '-1';
      const jobId2 = cuid + '-2';

      await producer.queue.add(jobId1, generateTestMessage(), { jobId: jobId1 });
      await producer.queue.add(jobId2, generateTestMessage(), { jobId: jobId2 });

      await processor.worker.delay(TestConfig.bullMq.delayMs);

      // spies.showListenerLogs();
      // console.warn(`consoleLogs:`, JSON.stringify(spies.console.info.mock.calls, null, 2));

      expect(spies.queue.onAdded).toHaveBeenCalledTimes(2);
      expect(listener.logs).toContain(`[001] Job ${jobId1} Added: ${jobId1}`);
      expect(listener.logs).toContain(`[002] Job ${jobId2} Added: ${jobId2}`);

      expect(spies.console.info).toHaveBeenCalledWith(`Job ${jobId1} Processing: ${jobId1}`);
      expect(spies.console.info).toHaveBeenCalledWith(`Job ${jobId2} Processing: ${jobId2}`);
    });

    it('can track a job being added', async () => {
      const spies = insertQueueSpies();

      const jobId = createId();
      producer.queue.add(jobId, generateTestMessage(), { jobId: jobId });

      // await processor.worker.delay(TestConfig.bullMq.delayMs);
      await trackedJobEventProcessor.worker.delay(TestConfig.bullMq.delayMs);

      // spies.showListenerLogs();

      const result = await repository.findJobById({ tenantId: '!!', jobId });

      expect(result).toBeDefined();
      expect(result!.events!.length).toBeGreaterThan(1);
      expect(result!.events![1].state).toEqual('active');

      expect(spies.console.info).toHaveBeenCalledWith(`Job ${jobId} Processing: ${jobId}`);
    });

    it('can track a job being completed', async () => {
      const spies = insertQueueSpies();
      const moreSpies = insertQueueSpies({ queueListener: trackedJobEventListener });

      const jobId = createId();
      producer.queue.add(jobId, generateTestMessage({ someText: 'abc', someNum: 123 }), { jobId: jobId, attempts: 5 });

      await processor.worker.delay(TestConfig.bullMq.delayMs);
      await trackedJobEventProcessor.worker.delay(TestConfig.bullMq.delayMs);

      // spies.showListenerLogs();
      // moreSpies.showListenerLogs();

      const result = await repository.findJobById({ tenantId: '!!', jobId });
      // console.debug(JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result!.events!.length).toEqual(3);
      expect(result!.state).toEqual('completed');
    });

    it('can track a job being delayed and completed', async () => {
      const spies = insertQueueSpies();
      const moreSpies = insertQueueSpies({ queueListener: trackedJobEventListener });

      const jobId = createId();
      delayedProducer.queue.add(jobId, generateTestMessage({ someText: 'abc', someNum: 123 }), { jobId: jobId, attempts: 5 });

      await delayedProcessor.worker.delay(TestConfig.bullMq.delayMs);
      await trackedJobEventProcessor.worker.delay(TestConfig.bullMq.delayMs * 2);

      // spies.showListenerLogs();
      // moreSpies.showListenerLogs();

      const result = await repository.findJobById({ tenantId: '!!', jobId });
      // console.debug(JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result!.events!.length).toEqual(7);
      expect(result!.state).toEqual('completed');
    });
  });
});
