import { Queue } from 'bullmq';
import { MockProxy, mock } from 'jest-mock-extended';

import { ILogger } from '@omedym/nestjs-telemetry';

import { AbstractTaskGateway } from './TaskGateway';


describe('TaskGateway', () => {
  class TestTaskGateway extends AbstractTaskGateway {}

  let logEntries: { msg: string; data: any }[] = [];
  const logger = {
    debug: jest.fn((msg, data) => logEntries.push({ msg: `[debug] ${msg}`, data })),
    error: jest.fn((msg, data) => logEntries.push({ msg: `[error] ${msg}`, data })),
    info: jest.fn((msg, data) => logEntries.push({ msg: ` [info] ${msg}`, data })),
    warn: jest.fn((msg, data) => logEntries.push({ msg: ` [warn] ${msg}`, data })),
  } as unknown as ILogger;
  let testTaskGateway: TestTaskGateway;
  const queue: MockProxy<Queue> = mock<Queue>();

  beforeEach(() => {
    jest.resetAllMocks();
    logEntries = [];
    testTaskGateway = new TestTaskGateway(queue, logger);
  });

  describe('removeExistingRepeatableJobs', () => {
    it('should remove existing repeatable jobs', async () => {
      const jobKey = '7039b74dae164375c13912cc3ab60662-1';
      queue.getRepeatableJobs.mockResolvedValue([
        {
          key: jobKey,
          name: 'SyncActivityTask_PT60S',
          endDate: null,
          tz: null,
          pattern: null,
          every: '60000',
          next: 1723803360000,
        },
      ]);

      await testTaskGateway['removeExistingRepeatableJobs']({
        id: 'test-task-id-1',
        name: 'SyncActivityTask_PT60S',
      });

      expect(queue.removeRepeatableByKey).toHaveBeenCalledWith(jobKey);
    });

    it('should not remove jobs', async () => {
      const jobKey = '7039b74dae164375c13912cc3ab60662-1';
      queue.getRepeatableJobs.mockResolvedValue([
        {
          key: jobKey,
          name: 'SyncActivityTask_PT2M',
          endDate: null,
          tz: null,
          pattern: null,
          every: '60000',
          next: 1723803360000,
        },
      ]);

      await testTaskGateway['removeExistingRepeatableJobs']({
        id: 'test-task-id-1',
        name: 'SyncActivityTask_PT60S',
      });

      expect(queue.removeRepeatableByKey).not.toHaveBeenCalled();
    });

    it('should remove all existing repeatable jobs, if there are already multiply jobs in the queue', async () => {
      const jobKey1 = '7039b74dae164375c13912cc3ab60662-1';
      const jobKey2 = '7039b74dae164375c13912cc3ab60662-2';
      const jobKey3 = '7039b74dae164375c13912cc3ab60662-3';
      queue.getRepeatableJobs.mockResolvedValue([
        {
          key: jobKey1,
          name: 'SyncActivityTask_PT60S',
          endDate: null,
          tz: null,
          pattern: null,
          every: '60000',
          next: 1723803360000,
        },
        {
          key: jobKey2,
          name: 'SyncActivityTask_PT60S',
          endDate: null,
          tz: null,
          pattern: null,
          every: '60000',
          next: 1723803360000,
        },
        {
          key: jobKey3,
          name: 'SyncActivityTask_PT60S',
          endDate: null,
          tz: null,
          pattern: null,
          every: '60000',
          next: 1723803360000,
        },
      ]);

      await testTaskGateway['removeExistingRepeatableJobs']({
        id: 'test-task-id-1',
        name: 'SyncActivityTask_PT60S',
      });

      expect(queue.removeRepeatableByKey).toHaveBeenCalledTimes(3);
      expect(queue.removeRepeatableByKey).toHaveBeenNthCalledWith(1, jobKey1);
      expect(queue.removeRepeatableByKey).toHaveBeenNthCalledWith(2, jobKey2);
      expect(queue.removeRepeatableByKey).toHaveBeenNthCalledWith(3, jobKey3);
    });
  });
});
