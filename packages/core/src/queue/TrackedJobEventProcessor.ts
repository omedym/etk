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
      case JobEvent.active:
        return this.onJobActive(job.data as TrackedJobEventDataFull);
      case JobEvent.completed:
        return this.onJobCompleted(job.data as TrackedJobEventDataFull);
      case JobEvent.failed:
        return this.onJobFailed(job.data as TrackedJobEventDataFull);
      case JobEvent.progress:
        return this.onJobProgress(job.data as TrackedJobEventDataFull)
      case JobEvent.stalled:
        return this.onJobStalled(job.data as TrackedJobEventDataFull)
      case JobEvent.delayed:
        return this.onJobDelayed(job.data as TrackedJobEventDataCompact)
      default:
        throw new Error(`Unsupported Job Event State: ${job.name}`);
    }
  }

  async onJobActive(event: TrackedJobEventDataFull): Promise<any> {
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
      state: event.state,
      metadata: event.metadata,
    });
  }


  async onJobCompleted(event: TrackedJobEventDataFull): Promise<any> {
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
      state: event.state,
      metadata: typeof(progress) !== 'object'
        ? { ...restOfMetadata, progress: 1.0 }
        : event.metadata,
    });
  }

  async onJobDelayed(event: TrackedJobEventDataCompact): Promise<any> {
    const job = await this.repository.findJobByJobId(event.jobId)

    // const queue = new Queue(job.queueId);
    // const jobLive = await queue.getJob(job.jobId);
    // const jobLogs = await queue.getJobLogs(job.jobId);

    // console.debug(`Live Job ${job.jobId}:`, JSON.stringify(jobLive, null, 2));

    const { ...restOfMetadata } = event.metadata;

    const delayed = await this.repository.updateTrackedJob({
      tenantId: job.tenantId,
      jobId: job.jobId,
      createdAt: event.createdAt,
      event: JobEvent.delayed,
      state: JobState.waiting,
      metadata: { ...restOfMetadata, statePrev: job.state }
      // log: jobLogs.count > 0 ? jobLogs.logs.join(`/n`) : undefined,
    });

  }

  async onJobFailed(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.error(`Job ${event.jobId} Failed`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.failed,
      state: event.state,
      metadata: event.metadata,
    });
  }

  async onJobProgress(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Progress`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.progress,
      state: event.state,
      metadata: event.metadata,
    });
  }

  async onJobStalled(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Stalled`, event);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.stalled,
      state: event.state,
      metadata: event.metadata,
    });
  }
}
