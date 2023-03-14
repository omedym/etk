import { InjectQueue, BullModule, Processor, OnQueueEvent, QueueEventsListener, QueueEventsHost } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createId } from '@paralleldrive/cuid2';
import { Job, Queue } from 'bullmq';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

import { TrackedProcessor } from './TrackedProcessor';

const REDIS__PORT = 6379;
const REDIS__STARTUP_MS = (1000 * 15);

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
  let testNum = 0;
  let container: StartedTestContainer;
  let app: INestApplication;
  let processor: TrackedProcessor;
  let listener: QueueListener;
  let producer: { queue: Queue };

  beforeAll(async ()  => {
    container = await new GenericContainer('redis')
      .withExposedPorts(REDIS__PORT)
      .withStartupTimeout(REDIS__STARTUP_MS)
      .start();
  });

  beforeEach(async () => {
    testNum++;
    const QUEUE_NAME = `test_${testNum}`;

    @Processor(QUEUE_NAME)
    class TestTrackedProcessor extends TrackedProcessor { }

    class TestQueue {
      constructor(@InjectQueue(QUEUE_NAME) public queue: Queue) { }
    }

    @QueueEventsListener(QUEUE_NAME)
    class TestQueueListener extends QueueListener { }

    const moduleRef = await Test.createTestingModule({
      imports: [
        BullModule.forRoot({ connection: { host: container.getHost(), port: container.getMappedPort(REDIS__PORT) },        }),
        BullModule.registerQueue({ name: QUEUE_NAME }),
      ],
      providers: [ TestQueue, TestQueueListener, TestTrackedProcessor ],
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
      const onPaused = jest.spyOn(listener, '_onPaused');
      await processor.worker.pause(true);

      expect(processor.worker.isPaused()).toBe(true);

      // TODO: Update When Paused Event Emitter Works in BullMQ //
      // This appears to never be emitted under any circumstances
      // at least as far as integration tests go in terms of trying
      // to validate this event:
      // expect(onPaused).toHaveBeenCalled();

      expect(onPaused).toHaveBeenCalledTimes(0);
    });

    it('can receive emitted event: added', async () => {
      const consoleSpy = jest.spyOn(global.console, 'info');
      const onAdded = jest.spyOn(listener, '_onAdded');

      const cuid = createId();
      await producer.queue.add(cuid+'-1', {});
      await producer.queue.add(cuid+'-2', {});

      await processor.worker.delay(4500);

      // console.info(`consoleSpy:`, JSON.stringify(consoleSpy.mock.calls, null, 2));
      console.warn(`listenerLog:`, JSON.stringify(listener.logs, null, 2));


      expect(onAdded).toHaveBeenCalledTimes(2);
      expect(listener.logs).toContain(`[001] Job 1 Added: ${cuid+'-1'}`);
      expect(listener.logs).toContain(`[002] Job 2 Added: ${cuid+'-2'}`);

      expect(consoleSpy).toHaveBeenCalledWith(`Job 1 Processing: ${cuid+'-1'}`);
      expect(consoleSpy).toHaveBeenCalledWith(`Job 2 Processing: ${cuid+'-2'}`);
    });
  });
});
