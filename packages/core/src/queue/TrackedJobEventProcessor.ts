import { InjectQueue, Processor } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { DateTime } from 'luxon';

import { JobEvent, JobState, TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { Providers } from '../providers';
import { TypedWorkerHost } from './TypedWorkerHost';
import { IMessage, IUnknownMessage } from '../message';
import { ILogger } from '../telemetry';

import type { TrackedJobEventData, TrackedJobEventDataCompact, TrackedJobEventDataFull } from './TrackedJobEventQueue';

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
    this.logger.debug(`Job ${job.id} Processing: ${job.data.jobId} ${job.name}`);

    switch(job.name) {
      // Worker Events
      case JobEvent.workerJobActive:
        return this.onWorkerJobActive(job.data as TrackedJobEventDataFull);
      case JobEvent.workerJobCompleted:
        return this.onWorkerJobCompleted(job.data as TrackedJobEventDataFull);
      case JobEvent.workerJobFailed:
        return this.onWorkerJobFailed(job.data as TrackedJobEventDataFull);
      case JobEvent.workerJobProgress:
        return this.onWorkerJobProgress(job.data as TrackedJobEventDataFull)
      case JobEvent.workerJobStalled:
        return this.onWorkerJobStalled(job.data as TrackedJobEventDataFull)

      // Queue Events
      case JobEvent.queueJobDelayed:
        return this.onQueueJobDelayed(job.data as TrackedJobEventDataCompact)

      default:
        throw new Error(`Unsupported Job Event State: ${job.name}`);
    }
  }

  async onWorkerJobActive(event: TrackedJobEventDataFull): Promise<any> {
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
        event: JobEvent.workerJobActive,
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
      event: JobEvent.workerJobActive,
      state: event.state,
      metadata: event.metadata,
    });
  }

  async onWorkerJobCompleted(event: TrackedJobEventDataFull): Promise<any> {
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
      event: JobEvent.workerJobCompleted,
      state: event.state,
      metadata: typeof(progress) !== 'object'
        ? { ...restOfMetadata, progress: 1.0 }
        : event.metadata,
    });
  }

  async onWorkerJobFailed(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.error(`Job ${event.jobId} Failed`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobFailed,
      state: event.state,
      metadata: event.metadata,
    });
  }

  async onWorkerJobProgress(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Progress`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobProgress,
      state: event.state,
      metadata: event.metadata,
    });
  }

  async onWorkerJobStalled(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Stalled`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobStalled,
      state: event.state,
      metadata: event.metadata,
    });
  }

  async onQueueJobDelayed(event: TrackedJobEventDataCompact): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Delayed`, event);
    const { ...restOfMetadata } = event.metadata;

    const delayed = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.queueJobDelayed,
      state: JobState.waiting,
      metadata: {
        ...restOfMetadata,
      },
    });
  }
}
