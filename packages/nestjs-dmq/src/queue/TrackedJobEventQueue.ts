import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { Job, Queue } from 'bullmq';
import { DateTime } from 'luxon';

import { JobEvent, JobState } from '@omedym/nestjs-dmq-repository';

import { Providers } from '../providers';
import { TrackedJobEventData } from './TrackedJobEventData.type';


/**
 * This queue receives events generated from TrackedProcessors and is
 * used to enqueue updates for the persistent datastore.
 */
@Injectable()
export class TrackedJobEventQueue {

  defaultOptions = {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: true,
    priority: 100,
    delay: 500,
  }

  highPriorityOptions = {
    ...this.defaultOptions,
    priority: 1,
    delay: 0,
  }

  constructor(
    @InjectQueue(Providers.TrackedJobEventQueue) public queue: Queue,
  ) { }

  async trackActive(job: Job, prev: string) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, prev),
      createdAt: DateTime.fromMillis(job.timestamp),
      updatedAt: DateTime.fromMillis(job.processedOn!),
    };

    this.queue.add(JobEvent.workerJobActive, event, { jobId: createId(), ...this.highPriorityOptions });
  }

  async trackCompleted(job: Job, prev: string) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, prev),
      result: job.returnvalue,
      createdAt: DateTime.fromMillis(job.finishedOn!),
    };

    this.queue.add(JobEvent.workerJobCompleted, event, { jobId: createId(), ...this.defaultOptions });
  }

  async trackDelayed(queueId: string, jobId: string, delay: number, id: string) {
    const timestampAt = DateTime.now();
    // const createdAt = DateTime.fromMillis(+id.replace('-0', ''));

    const event = {
      queueId,
      jobId,
      metadata: {
        delay: delay,
        receivedAt: timestampAt.toISO(),
        runAt: DateTime.fromMillis(+delay).toISO(),
      },
      createdAt: timestampAt.toISO(),
    };

    this.queue.add(JobEvent.queueJobDelayed, event, { jobId: createId(), ...this.defaultOptions });
  }

  async trackFailed(job: Job, error: Error, prev: string) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, prev),
      createdAt: DateTime.fromMillis(job.finishedOn!),
    };

    this.queue.add(JobEvent.workerJobFailed, event, { jobId: createId(), ...this.defaultOptions });
  }

  async trackProgress(job: Job, progress: number | object ) {
    const event = {
      ...await this.buildTrackEventFromWorkerEvent(job, 'active'),
      createdAt: DateTime.fromMillis(job.processedOn!),
    };

    this.queue.add(JobEvent.workerJobProgress, event, { jobId: createId(), ...this.defaultOptions });
  }

  async trackStalled(jobId: string, prev: string) {
    const event = {
      jobId,
      statePrev: prev ? prev as JobState : JobState.unknown,
      createdAt: DateTime.now().toISO(),
    };

    this.queue.add(JobEvent.workerJobStalled, event, { jobId: createId(), ...this.defaultOptions });
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
        receivedAt: DateTime.now().toISO(),
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
