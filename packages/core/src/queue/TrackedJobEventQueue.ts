import { InjectQueue } from '@nestjs/bullmq';
import { Job, Queue } from 'bullmq';
import { DateTime } from 'luxon';

import { JobEvent, JobState } from '@omedym/nestjs-dmq-repository-postgres';

import { Providers } from '../providers';
import { IMessage, IUnknownMessage } from '../message';


export type TrackedJobEventData = TrackedJobEventDataFull | TrackedJobEventDataCompact;

export type TrackedJobEventDataFull = {
  queueId: string;
  tenantId: string;
  jobId: string;
  data: IMessage | IUnknownMessage;
  state: JobState,
  statePrev: JobState;
  metadata: {
    attemptsMade?: number;
    delay?: number;
    failedReason?: string;
    progress?: number | object;
    runAt?: string;
    stackTrace?: string[];
  },
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export type TrackedJobEventDataCompact = {
  queueId: string;
  tenantId: string;
  jobId: string;
  metadata: {
    delay?: number;
    failedReason?: string;
    runAt?: string;
  },
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

/**
 * This queue receives events generated from TrackedProcessors and is
 * used to enqueue updates for the persistent datastore.
 */
export class TrackedJobEventQueue {

  defaultOptions = {
    attempts: 5,
    backoff: { type: 'exponential', delay: 500 },
    removeOnComplete: true,
  }

  constructor(@InjectQueue(Providers.TrackedJobEventQueue) public queue: Queue) { }

  async trackActive(job: Job, prev: string) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, prev),
      createdAt: DateTime.fromMillis(job.timestamp),
      updatedAt: DateTime.fromMillis(job.processedOn!),
    };

    this.queue.add(JobEvent.workerJobActive, event, { ...this.defaultOptions });
  }

  async trackCompleted(job: Job, prev: string) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, prev),
      result: job.returnvalue,
      createdAt: DateTime.fromMillis(job.finishedOn!),
    };

    this.queue.add(JobEvent.workerJobCompleted, event, { ...this.defaultOptions });
  }

  async trackDelayed(queueId: string, jobId: string, delay: number) {
    const event = {
      queueId,
      jobId,
      metadata: {
        delay: delay,
        // runAt: DateTime.fromMillis(delay).toISO(),
        statePrev: JobState.active,
      },
      createdAt: DateTime.now(),
    };

    this.queue.add(JobEvent.queueJobDelayed, event, { ...this.defaultOptions });
  }

  async trackFailed(job: Job, error: Error, prev: string) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, prev),
      createdAt: DateTime.fromMillis(job.finishedOn!),
    };

    this.queue.add(JobEvent.workerJobFailed, event, { ...this.defaultOptions });
  }

  async trackProgress(job: Job, progress: number | object ) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, 'active'),
      createdAt: DateTime.fromMillis(job.processedOn!),
    };

    this.queue.add(JobEvent.workerJobProgress, event, { ...this.defaultOptions });
  }

  async trackStalled(job: Job, prev: string ) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, prev),
      createdAt: DateTime.fromMillis(job.processedOn!),
    };

    this.queue.add(JobEvent.workerJobStalled, event, { ...this.defaultOptions });
  }

  async buildTrackEventFromWorkerEvent(job: Job, prev?: string): Promise<TrackedJobEventData> {
    const progress = this.recalcProgress(job.progress);
    const event: TrackedJobEventData = {
      queueId: job.queueName,
      tenantId: job.data.tenantid || 'SYSTEM',
      jobId: job.id!,
      data: job.data,
      state: await job.getState() as JobState,
      statePrev: prev ? prev as JobState : JobState.unknown,
      metadata: {
        attemptsMade: job.attemptsMade,
        ...( job.failedReason ? { failedReason: job.failedReason } : {} ),
        ...( progress ? { progress } : {} ),
        ...( job.stacktrace.length > 0 ? { stacktrace: job.stacktrace } : {} ),
      },
    };

    return event;
  }

  /**
     * If numeric progress is provided we ensure that it is factored into a percentile
     * friendly range between 0.0 and 1.0. Otherwise return an object or undefined.
     */
  recalcProgress(progress?: number | object) {
    if(typeof(progress) === 'object') return progress;

    if(typeof(progress) !== 'number') return undefined;

    if(progress === 0.0) return undefined;

    if(progress > 0.0 && progress <= 1.0)
      return progress;

    if(progress > 1.0 && progress <= 100.0)
      return progress / 100.0;

    if(progress > 100.0)
      return { value: progress };

    return undefined;
  }
}
