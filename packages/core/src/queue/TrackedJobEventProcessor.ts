import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { DateTime } from 'luxon';

import { JobEvent, JobState, TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { Providers } from '../providers';
import { TypedWorkerHost } from './TypedWorkerHost';
import { IMessage, IUnknownMessage } from '../message';
import { ILogger } from '../telemetry';


type TrackedJobEventData = {
  tenantId: string;
  jobId: string;
  data: IMessage | IUnknownMessage;
  metadata: {
    attemptsMade?: number;
    failedReason?: string;
    progress?: number | object;
    statePrev?: JobState;
    stackTrace?: string[];
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

  trackActive(job: Job, prev: string) {
    const event = {
      ...this.buildEvent(job, prev),
      createdAt: DateTime.fromMillis(job.timestamp),
      updatedAt: DateTime.fromMillis(job.processedOn!),
    };

    this.queue.add(JobEvent.active, event, { ...this.defaultOptions });
  }

  trackCompleted(job: Job, prev: string) {
    const event = {
      ...this.buildEvent(job, prev),
      result: job.returnvalue,
      createdAt: DateTime.fromMillis(job.finishedOn!),
    };

    this.queue.add(JobEvent.completed, event, { ...this.defaultOptions });
  }

  trackFailed(job: Job, error: Error, prev: string) {
    const event = {
      ...this.buildEvent(job, prev),
      createdAt: DateTime.fromMillis(job.finishedOn!),
    };

    this.queue.add(JobEvent.failed, event, { ...this.defaultOptions });
  }

  trackProgress(job: Job, progress: number | object ) {
    const event = {
      ...this.buildEvent(job, 'active'),
      createdAt: DateTime.fromMillis(job.processedOn!),
    };

    this.queue.add(JobEvent.progress, event, { ...this.defaultOptions });
  }

  buildEvent(job: Job, prev?: string): TrackedJobEventData {
    const progress = this.recalcProgress(job.progress);
    const event: TrackedJobEventData = {
      tenantId: job.data.tenantid || 'SYSTEM',
      jobId: job.id!,
      data: job.data,
      metadata: {
        attemptsMade: job.attemptsMade,
        ...( job.failedReason ? { failedReason: job.failedReason } : {} ),
        ...( progress ? { progress } : {} ),
        ...( prev ? { statePrev: prev as JobState } : {} ),
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

/**
 * This worker processes events generated from TrackedProcessors and is
 * used to handle updates with the persistent datastore.
 */
@Injectable()
@Processor(Providers.TrackedJobEventQueue)
export class TrackedJobEventProcessor extends TypedWorkerHost<TrackedJobEventData> {

  constructor(
    readonly repository: TrackedQueueRepository,
    @Inject(Providers.ILogger) readonly logger: ILogger,
  ) {
    super();
  };

  async process(job: Job<TrackedJobEventData>): Promise<any> {
    console.warn(`Job ${job.id} Processing: ${job.data.jobId} ${job.name}`);

    switch(job.name) {
      case JobEvent.active:
        return this.onJobActive(job.data);
      case JobEvent.completed:
        return this.onJobCompleted(job.data);
      case JobEvent.failed:
        return this.onJobFailed(job.data);
      case JobEvent.progress:
        return this.onJobProgress(job.data)
      default:
        throw new Error(`Unsupported Job Event State: ${job.name}`);
    }
  }

  async onJobActive(event: TrackedJobEventData): Promise<any> {
    this.logger.info(`Job ${event.jobId} Active`, event);

    const exists = await this.repository.findJobById({
      tenantId: event.tenantId,
      jobId: event.jobId,
    });

    if (!exists) {
      const created = await this.repository.trackJob({
        tenantId: event.tenantId,
        queueGroupId: 'queueGroup',
        queueId: 'queue',
        jobId: event.jobId,
        state: 'waiting',
        dataType: 'message',
        dataId: event.data.id,
        data: event.data,
        createdAt: event.createdAt,
      });
    }

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.updatedAt,
      event: JobEvent.active,
      state: JobState.active,
      metadata: event.metadata,
    });
  }


  async onJobCompleted(event: TrackedJobEventData): Promise<any> {
    this.logger.info(`Job ${event.jobId} Completed`, event);

    const { progress, ...restOfMetadata } = event.metadata;

    /**
     * - We assumed the createdAt timestamp was derived from job.finishedOn
     * - As we're marking the job completed we automatically set any numeric progress
     *   information to 1.0. If an object based progress is being used it is up to the
     *   consumer to update this object a final time before the job completed event is
     *   published.
     */
    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.completed,
      state: JobState.completed,
      metadata: typeof(progress) !== 'object'
        ? { ...restOfMetadata, progress: 1.0 }
        : event.metadata,
    });
  }

  async onJobFailed(event: TrackedJobEventData): Promise<any> {
    this.logger.error(`Job ${event.jobId} Failed`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.failed,
      state: JobState.failed,
      metadata: event.metadata,
    });
  }

  async onJobProgress(event: TrackedJobEventData): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Progress`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.progress,
      state: JobState.active,
      metadata: event.metadata,
    });
  }
}
