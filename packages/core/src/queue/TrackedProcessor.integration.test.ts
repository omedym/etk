import { InjectQueue, BullModule, Processor, OnQueueEvent, QueueEventsListener, QueueEventsHost } from '@nestjs/bullmq';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { createId } from '@paralleldrive/cuid2';
import { Job, Queue } from 'bullmq';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

import { TrackedProcessor } from './TrackedProcessor';

const REDIS__PORT = 6379;
const REDIS__STARTUP_MS = (1000 * 15);

class QueueListener extends QueueEventsHost {
  _onAdded(job: Job) { console.debug(`ADDED ${job.name}`) };
  _onPaused() { console.debug(`PAUSED`) };
  _onResumed() { console.debug(`RESUMED`) };

  @OnQueueEvent('added')
  onAdded(job: Job) { this._onAdded(job) }

  @OnQueueEvent('paused')
  onPaused(args: {}, id: string) { this._onPaused(); }

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
        BullModule.forRoot({
          connection: {
            host: container.getHost(),
            port: container.getMappedPort(REDIS__PORT),
          },
        }),
        BullModule.registerQueue({
          name: QUEUE_NAME,
        }),
      ],
      providers: [TestTrackedProcessor, TestQueueListener, TestQueue],
    }).compile();

    app = moduleRef.createNestApplication();
    processor = moduleRef.get<TestTrackedProcessor>(TestTrackedProcessor);
    listener = moduleRef.get<TestQueueListener>(TestQueueListener);
    producer = moduleRef.get<TestQueue>(TestQueue);

    await app.init();
    await processor.worker.waitUntilReady();
    await listener.queueEvents.waitUntilReady();
  });

  afterEach(async () => {
    await app.close();
  })

  afterAll(async () => {
    await container.stop();
  })

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
      const logSpy = jest.spyOn(global.console, 'debug');
      const onAdded = jest.spyOn(listener, '_onAdded');

      const cuid = createId();
      await producer.queue.add(cuid+'-1', {});
      await producer.queue.add(cuid+'-2', {});

      await processor.worker.delay(4500);

      console.info(`logSpy: `, JSON.stringify(logSpy.mock.calls, null, 2));

      expect(onAdded).toHaveBeenCalledTimes(2);
      expect(logSpy.mock.calls).toContainEqual([`ADDED ${cuid+'-1'}`]);
      expect(logSpy.mock.calls).toContainEqual([`ADDED ${cuid+'-2'}`]);
    });
  });
});
