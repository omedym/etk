import { InjectQueue, BullModule, Processor, OnQueueEvent, QueueEventsListener, QueueEventsHost } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createId } from '@paralleldrive/cuid2';
import { Queue } from 'bullmq';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

import { ILogger } from '../telemetry';
import { Providers } from '../providers';
import { TrackedProcessor } from './TrackedProcessor';

const TestConfig = {
  redis: {
    port: process.env.TESTCONFIG__REDIS__PORT
      ? Number(process.env.TESTCONFIG__REDIS__PORT) : 6379,
    startupMs: process.env.TESTCONFIG__REDIS__STARTUP_MS
      ? Number(process.env.TESTCONFIG__REDIS__STARTUP_MS) : 15000,
  },
  bullMq: {
    delayMs: process.env.TESTCONFIG__BULLMQ__DELAY_MS
      ? Number(process.env.TESTCONFIG__BULLMQ__DELAY_MS) : 1000,
    showLogs: process.env.TESTCONFIG__BULLMQ__SHOWLOGS
    ? Boolean(process.env.TESTCONFIG__BULLMQ__SHOWLOGS) : false,
  },
  jest: {
    timeoutMs: process.env.TESTCONFIG__JEST__TIMEOUT_MS
      ? Number(process.env.TESTCONFIG__JEST__TIMEOUT_MS) : 10000,
  },
};

const mockLogger = {
  info: jest.fn(),
  requestLogger: jest.fn(),
  matchFilePartRegEx: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
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

  _onAdded(jobId: string, name: string) { this.log(`Job ${jobId} Added: ${name}`) };
  _onCompleted(jobId: string, returnvalue: string) { this.log(`Job ${jobId} Completed: ${returnvalue}`) };
  _onDelayed(jobId: string, delay: number) { this.log(`Job ${jobId} Delayed: ${delay}`)}
  _onPaused() { this.log(`Queue Paused`) };
  _onResumed() { this.log(`Queue Resumed`) };

  @OnQueueEvent('added')
  onAdded(event: { jobId: string, name: string }, id: string) { this._onAdded(event.jobId, event.name) }

  @OnQueueEvent('completed')
  onCompleted(event: { jobId: string, returnvalue: string, prev?: string}, id: string) {
    this._onCompleted(event.jobId, event.returnvalue);
  }

  @OnQueueEvent('delayed')
  onDelayed(event: { jobId: string, delay: number }, id: string) { this._onDelayed(event.jobId, event.delay) }

  @OnQueueEvent('paused')
  onPaused() { this._onPaused(); }

  @OnQueueEvent('resumed')
  onResumed() { this._onResumed(); }
}

describe('TrackedProcessor', () => {
  jest.setTimeout(TestConfig.jest.timeoutMs);

  let testNum = 0;

  let app: INestApplication;
  let container: StartedTestContainer;
  let listener: QueueListener;
  let processor: TrackedProcessor;
  let producer: { queue: Queue };

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
        onAdded: jest.spyOn(target.queueListener, '_onAdded'),
        onCompleted: jest.spyOn(target.queueListener, '_onCompleted'),
        onDelayed: jest.spyOn(target.queueListener, '_onDelayed'),
        onPaused: jest.spyOn(target.queueListener, '_onPaused'),
        onResumed: jest.spyOn(target.queueListener, '_onResumed'),
      },
      showListenerLogs: () => TestConfig.bullMq.showLogs && console.warn(`listener.logs`, JSON.stringify(listener.logs, null, 2)),
  }};

  beforeAll(async ()  => {
    container = await new GenericContainer('redis')
      .withExposedPorts(TestConfig.redis.port)
      .withStartupTimeout(TestConfig.redis.startupMs)
      .start();
  });

  beforeEach(async () => {
    testNum++;
    const QUEUE_NAME = `test_${testNum}`;
    const redisConnectionOptions = {
      host: container.getHost(),
      port: container.getMappedPort(TestConfig.redis.port)
    };

    @Processor(QUEUE_NAME)
    class TestTrackedProcessor extends TrackedProcessor { }

    class TestQueue {
      constructor(@InjectQueue(QUEUE_NAME) public queue: Queue) { }
    }

    /** The `lastEventId` setting is critical for ensuring the listener captures events that occurred before initialization */
    @QueueEventsListener(QUEUE_NAME, { lastEventId: '0-0', connection: redisConnectionOptions })
    class TestQueueListener extends QueueListener { }

    const moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({ connection: redisConnectionOptions }),
        BullModule.registerQueue({ name: QUEUE_NAME }),
      ],
      providers: [
        TestQueue,
        TestQueueListener,
        TestTrackedProcessor,
        { provide: Providers.ILogger, useValue: mockLogger },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    processor = moduleRef.get<TestTrackedProcessor>(TestTrackedProcessor);
    listener = moduleRef.get<TestQueueListener>(TestQueueListener);
    producer = moduleRef.get<TestQueue>(TestQueue);

    await app.init();
    await processor.worker.waitUntilReady();
    await listener.queueEvents.waitUntilReady();
  });

  afterEach(async () => { await app.close(); })
  afterAll(async () => { await container.stop(); })

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
      await producer.queue.add(cuid+'-1', {});
      await producer.queue.add(cuid+'-2', {});

      await processor.worker.delay(TestConfig.bullMq.delayMs);

      spies.showListenerLogs();
      // console.warn(`consoleLogs:`, JSON.stringify(spies.console.info.mock.calls, null, 2));

      expect(spies.queue.onAdded).toHaveBeenCalledTimes(2);
      expect(listener.logs).toContain(`[001] Job 1 Added: ${cuid+'-1'}`);
      expect(listener.logs).toContain(`[002] Job 2 Added: ${cuid+'-2'}`);

      expect(spies.console.info).toHaveBeenCalledWith(`Job 1 Processing: ${cuid+'-1'}`);
      expect(spies.console.info).toHaveBeenCalledWith(`Job 2 Processing: ${cuid+'-2'}`);
    });
  });
});
