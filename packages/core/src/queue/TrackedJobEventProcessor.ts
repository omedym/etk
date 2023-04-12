import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { DateTime } from 'luxon';

import { JobState, TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

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
    stackTrace?: string[];
    statePrev?: JobState;
    failedReason?: string;
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

    this.queue.add('active', event, { ...this.defaultOptions });
  }

  trackCompleted(job: Job, prev: string) {
    const event = {
      ...this.buildEvent(job, prev),
      result: job.returnvalue,
      createdAt: DateTime.fromMillis(job.finishedOn!),
    };

    this.queue.add('completed', event, { ...this.defaultOptions });
  }

  buildEvent(job: Job, prev?: string): TrackedJobEventData {
    const event: TrackedJobEventData = {
      tenantId: job.data.tenantid || 'SYSTEM',
      jobId: job.id!,
      data: job.data,
      metadata: {
        attemptsMade: job.attemptsMade,
        ...( job.failedReason ? { failedReason: job.failedReason } : {}),
        ...( job.stacktrace.length > 0 ? { stacktrace: job.stacktrace } : {}),
        ...( prev ? { statePrev: prev as JobState } : {} ),
      },
    };

    return event;
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
      case JobState.active:
        return this.onJobActive(job.data);
      case JobState.completed:
        return this.onJobCompleted(job.data);
      default:
        throw new Error(`Unsupported Job Event State: ${job.name}`);
    }
  }

  async onJobActive(event: TrackedJobEventData): Promise<any> {
    console.warn(`Job ${event.jobId} Active: ${JSON.stringify(event)}`);

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
      state: 'active',
      metadata: event.metadata,
    });
  }

  async onJobCompleted(event: TrackedJobEventData): Promise<any> {
    console.warn(`Job ${event.jobId} Completed: ${JSON.stringify(event)}`);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      state: 'completed',
      metadata: event.metadata,
    });
  }

}
