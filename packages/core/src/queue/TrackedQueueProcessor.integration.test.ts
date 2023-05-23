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
      ? Number(process.env.TESTCONFIG__JEST__TIMEOUT_MS) : 1000 * 10,
  },
};

const runfiles = new Runfiles(process.env);
const execAsync = promisify(exec);

const mockLogger = {
  requestLogger: jest.fn(),
  matchFilePartRegEx: jest.fn(),
  info: jest.fn(),
  // info: (x: any) => console.info(x),
  // log: jest.fn(),
  // warn: jest.fn(),
  warn: (x: any, y: any) => console.warn(x, y),
  // error: jest.fn(),
  error: (message: string, error: Error) => console.error(message, error),
  debug: jest.fn(),
  // debug: (x: any, y: any) => console.debug(x, y),
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

  onAdded(jobId: string, name: string, id: string) { this.log(`Job ${jobId} Added: ${name} id: ${id}`) };
  onCompleted(jobId: string, returnvalue: string) { this.log(`Job ${jobId} Completed: ${returnvalue}`) };
  onDelayed(jobId: string, delay: number, id: string) { this.log(`Job ${jobId} Delayed: ${DateTime.fromMillis(Number(delay)).toISO()} id: ${id}`) };
  onError(error: Error) { this.log(`Queue Error: ${error.name}, ${error.message}, ${error.cause}`) };
  onPaused() { this.log(`Queue Paused`) };
  onResumed() { this.log(`Queue Resumed`) };

  @OnQueueEvent('added')
  _onAdded(event: { jobId: string, name: string }, id: string) { this.onAdded(event.jobId, event.name, id) }

  @OnQueueEvent('completed')
  _onCompleted(event: { jobId: string, returnvalue: string, prev?: string}, id: string) {
    this.onCompleted(event.jobId, event.returnvalue);
  }

  @OnQueueEvent('delayed')
  _onDelayed(event: { jobId: string, delay: number }, id: string) { this.onDelayed(event.jobId, event.delay, id) }

  @OnQueueEvent('error')
  _onError(event: Error) { this.onError(event) }

  @OnQueueEvent('paused')
  _onPaused() { this.onPaused(); }

  @OnQueueEvent('resumed')
  _onResumed() { this.onResumed(); }
}

/** Monitor A BullMQ Queue Using BullMQ Queue Events */
class TestTrackedQueueListener extends TrackedQueueListener {
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

  override async onAdded(jobId: string, name: string) { this.log(`Job ${jobId} Added: ${name}`) };
  override async onCompleted(jobId: string, returnvalue: string) { this.log(`Job ${jobId} Completed: ${returnvalue}`) };
  override async onDelayed(jobId: string, delay: number, id: string) { this.log(`Job ${jobId} Delayed: ${DateTime.fromMillis(Number(delay)).toISO()} id: ${id}`) };
  override async onError(error: Error) { this.log(`Queue Error: ${error.name}, ${error.message}, ${error.cause}`) };
  override async onPaused() { this.log(`Queue Paused`) };
  override async onResumed() { this.log(`Queue Resumed`) };
}

type MessageJobData = { id: string; tenantid: string; data: object, type: string };
type OtherJobData = { id: string; };
type EmptyJobData = {};
type TestJobData = MessageJobData | OtherJobData | EmptyJobData;

const generateTestMessage = (data: IMessage | IUnknownMessage = {}): MessageJobData => { return {
  data,
  type: 'org.test.message',
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

  let listener: TestTrackedQueueListener;
  let processor: TrackedQueueProcessor;
  let producer: { queue: Queue };

  let delayedListener: TestTrackedQueueListener;
  let delayedProcessor: TrackedQueueProcessor;
  let delayedProducer: { queue: Queue };

  let repository: TrackedQueueRepository;

  let DATABASE_URL_POSTGRES: string;

  const env = process.env;
  process.env = { ...env };

  const insertQueueSpies = (options?: {
    queueListener?: QueueListener | TestTrackedQueueListener;
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
        onError: jest.spyOn(target.queueListener, 'onError'),
        onPaused: jest.spyOn(target.queueListener, 'onPaused'),
        onResumed: jest.spyOn(target.queueListener, 'onResumed'),
      },

      showListenerLogs: (warn: boolean = false) => (warn || TestConfig.bullMq.showLogs)
        && console.warn(JSON.stringify(target.queueListener.logs, null, 2)),
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
    abstract class AbstractTestDelayedTrackedProcessor extends TrackedQueueProcessor<TestJobData> {
      abstract onProcess(job: Job<TestJobData>, token?: string): void

      override async process(job: Job<TestJobData>, token?: string) {
        await this.onProcess(job, token);
      }
    }

    class TestDelayedTrackedProcessor extends AbstractTestDelayedTrackedProcessor {
      async onProcess(job: Job<TestJobData>, token?: string) {
        job.log(`${DateTime.now().toISO()} Processing - Starting`);
        this.logger.info(`Job ${job.id} Processing: ${job.name}`);

        if (job.attemptsMade > 2) {
          job.log(`${DateTime.now().toISO()} Processing - Complete`);
          return;
        }

        const runAt = DateTime.now().plus(Duration.fromISO('PT1S'));

        job.log(`${DateTime.now().toISO()} Processing - Delayed Until ${runAt.toISO()}`);
        this.logger.info(`Job ${job.id} Processing - Delayed Until ${runAt.toISO()}`);

        job.moveToDelayed(runAt.toMillis(), token);
        throw new DelayedError(`Job ${job.id} delayed until ${runAt.toISO()}`);
      }
    }

    class TestQueue {
      constructor(@InjectQueue(QUEUE_NAME) public queue: Queue) { }
    }

    class TestDelayedQueue {
      constructor(@InjectQueue(DELAYED_QUEUE_NAME) public queue: Queue) { }
    }

    /** The `lastEventId` setting is critical for ensuring the listener captures events that occurred before initialization */
    @QueueEventsListener(Providers.TrackedJobEventQueue, { lastEventId: '0-0', connection: redisConnectionOptions })
    class TrackedJobEventListener extends QueueListener { }
    @QueueEventsListener(QUEUE_NAME, { lastEventId: '0-0', connection: redisConnectionOptions })
    class TestQueueListener extends TestTrackedQueueListener { }
    @QueueEventsListener(DELAYED_QUEUE_NAME, { lastEventId: '0-0', connection: redisConnectionOptions })
    class TestDelayedQueueListener extends TestTrackedQueueListener { }

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
        TestDelayedQueueListener,
        { provide: Providers.ILogger, useValue: mockLogger },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    trackedJobEventListener = moduleRef.get<TrackedJobEventListener>(TrackedJobEventListener);
    trackedJobEventProcessor = moduleRef.get<TrackedJobEventProcessor>(TrackedJobEventProcessor);

    listener = moduleRef.get<TestQueueListener>(TestQueueListener);
    processor = moduleRef.get<TestTrackedProcessor>(TestTrackedProcessor);
    producer = moduleRef.get<TestQueue>(TestQueue);

    delayedListener = moduleRef.get<TestDelayedQueueListener>(TestDelayedQueueListener);
    delayedProcessor = moduleRef.get<TestDelayedTrackedProcessor>(TestDelayedTrackedProcessor);
    delayedProducer = moduleRef.get<TestDelayedQueue>(TestDelayedQueue);

    repository = moduleRef.get<TrackedQueueRepository>(TrackedQueueRepository);

    await app.init();

    await trackedJobEventListener.queueEvents.waitUntilReady();
    await trackedJobEventProcessor.worker.waitUntilReady();

    await listener.queueEvents.waitUntilReady();
    await processor.worker.waitUntilReady();

    await delayedListener.queueEvents.waitUntilReady();
    await delayedProcessor.worker.waitUntilReady();
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
      const spies = insertQueueSpies({ queueListener: listener });

      const cuid = createId();
      const jobId1 = cuid + '-1';
      const jobId2 = cuid + '-2';

      const msg1 = generateTestMessage();
      const msg2 = generateTestMessage();

      await producer.queue.add(msg1.type, msg1, { jobId: jobId1 });
      await producer.queue.add(msg2.type, msg2, { jobId: jobId2 });

      await processor.worker.delay(TestConfig.bullMq.delayMs);

      // spies.showListenerLogs();
      // console.warn(`consoleLogs:`, JSON.stringify(spies.console.info.mock.calls, null, 2));

      expect(spies.queue.onAdded).toHaveBeenCalledTimes(2);
      expect(listener.logs).toContain(`[001] Job ${jobId1} Added: ${msg1.type}`);
      expect(listener.logs).toContain(`[002] Job ${jobId2} Added: ${msg2.type}`);

      expect(spies.console.info).toHaveBeenCalledWith(expect.stringContaining(`Queue Job Added jobId: ${jobId1} name: ${msg1.type} id:`));
      expect(spies.console.info).toHaveBeenCalledWith(expect.stringContaining(`Queue Job Added jobId: ${jobId2} name: ${msg2.type} id:`));
    });

    it('can track a job being added', async () => {
      const spies = insertQueueSpies();

      const jobId = createId();
      const msg = generateTestMessage();
      producer.queue.add(msg.type, msg, { jobId: jobId });

      // await processor.worker.delay(TestConfig.bullMq.delayMs);
      await trackedJobEventProcessor.worker.delay(TestConfig.bullMq.delayMs);

      // spies.showListenerLogs();

      const result = await repository.findJobById({ tenantId: '!!', jobId });

      expect(result).toBeDefined();
      expect(result!.events!.length).toBeGreaterThan(1);
      expect(result!.events![1].state).toEqual('active');

      expect(spies.console.info).toHaveBeenCalledWith(expect.stringContaining(`Queue Job Added jobId: ${jobId} name: ${msg.type} id:`));
    });

    it('can track a job being completed', async () => {
      const spies = insertQueueSpies();

      const jobId = createId();
      producer.queue.add(jobId, generateTestMessage({ someText: 'abc', someNum: 123 }), { jobId: jobId, attempts: 5 });

      await processor.worker.delay(TestConfig.bullMq.delayMs);
      await trackedJobEventProcessor.worker.delay(TestConfig.bullMq.delayMs);

      // spies.showListenerLogs();

      const result = await repository.findJobById({ tenantId: '!!', jobId });
      // console.debug(JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result!.events!.length).toEqual(3);
      expect(result!.state).toEqual('completed');
    });

    it('can track a job being delayed and completed', async () => {
      const spies = insertQueueSpies({ queueListener: delayedListener });

      const jobId = createId();
      delayedProducer.queue.add(jobId, generateTestMessage({ someText: 'abc', someNum: 123 }), { jobId: jobId, attempts: 5 });

      await delayedProcessor.worker.delay(TestConfig.bullMq.delayMs);
      await trackedJobEventProcessor.worker.delay(TestConfig.bullMq.delayMs * 3);

      // spies.showListenerLogs();

      const result = await repository.findJobById({ tenantId: '!!', jobId });
      // console.debug(JSON.stringify(result, null, 2));

      expect(result).toBeDefined();
      expect(result!.events!.length).toEqual(7);
      expect(result!.state).toEqual('completed');
    });
  });
});
