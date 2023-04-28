import { Processor, getQueueToken } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job, Queue } from 'bullmq';

import { JobEvent, JobState, TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { Providers } from '../providers';
import { TypedWorkerHost } from './TypedWorkerHost';
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
    private moduleRef: ModuleRef,
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
    const jobAndLog = await this.fetchJobAndLog(event.queueId, event.tenantId, event.jobId);

    const exists = await this.repository.findJobById({
      tenantId: event.tenantId,
      jobId: event.jobId,
    });

    if (!exists) {
      const created = await this.repository.trackJob({
        tenantId: event.tenantId,
        queueGroupId: 'queueGroup',
        queueId: event.queueId,
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
      statePrev: event.statePrev,
      metadata: {
        ...event.metadata,
        log: jobAndLog.log,
        queueId: event.queueId,
      },
      log: jobAndLog.log,
    });
  }

  async onWorkerJobCompleted(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.info(`Job ${event.jobId} Completed`, event);

    const jobAndLog = await this.fetchJobAndLog(event.queueId, event.tenantId, event.jobId);

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
      statePrev: event.statePrev,
      metadata: typeof(progress) !== 'object'
        ? { ...restOfMetadata, log: jobAndLog.log, progress: 1.0, queueId: event.queueId }
        : { ...event.metadata, log: jobAndLog.log, queueId: event.queueId }
    });
  }

  async onWorkerJobFailed(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.error(`Job ${event.jobId} Failed`, event);

    const jobAndLog = await this.fetchJobAndLog(event.queueId, event.tenantId, event.jobId);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobFailed,
      state: event.state,
      statePrev: event.statePrev,
      metadata: { ...event.metadata, log: jobAndLog.log, queueId: event.queueId },
      log: jobAndLog.log,
    });
  }

  async onWorkerJobProgress(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Progress`, event);

    const jobAndLog = await this.fetchJobAndLog(event.queueId, event.tenantId, event.jobId);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobProgress,
      state: event.state,
      statePrev: event.statePrev,
      metadata: { ...event.metadata, log: jobAndLog.log, queueId: event.queueId },
      log: jobAndLog.log,
    });
  }

  async onWorkerJobStalled(event: TrackedJobEventDataFull): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Stalled`, event);

    const jobAndLog = await this.fetchJobAndLog(event.queueId, event.tenantId, event.jobId);

    const updated = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobStalled,
      state: event.state,
      statePrev: event.statePrev,
      metadata: { ...event.metadata, log: jobAndLog.log, queueId: event.queueId },
      log: jobAndLog.log,
    });
  }

  async onQueueJobDelayed(event: TrackedJobEventDataCompact): Promise<any> {
    this.logger.debug(`Job ${event.jobId} Delayed`, event);

    const job = await this.repository.findJobByJobId(event.jobId)
    const jobAndLog = await this.fetchJobAndLog(job.queueId, job.tenantId, job.jobId);

    const { ...restOfMetadata } = event.metadata;

    const delayed = await this.repository.updateTrackedJob({
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.queueJobDelayed,
      state: JobState.waiting,
      statePrev: job.state,
      metadata: {
        ...restOfMetadata,
        attemptsMade: jobAndLog.job?.attemptsMade,
        log: jobAndLog.log,
        queueId: event.queueId,
      },
      log: jobAndLog.log,
    });
  }

  async fetchJobAndLog(queueId: string, tenantId: string, jobId: string) {
    try {
      const queueToken = getQueueToken(queueId);

      this.logger.debug(`Connect to tracked queue: ${queueId} with queueToken: ${queueToken}`, { tenantId, jobId, queueId })
      const queue = this.moduleRef.get<Queue>(queueToken, { strict: false });

      this.logger.debug(`Fetch jobId: ${jobId}`, { tenantId, jobId, queueId });
      const job = await queue.getJob(jobId);

      this.logger.debug(`Fetch job logs for jobId: ${jobId}`, { tenantId, jobId, queueId });
      const jobLog = await queue.getJobLogs(jobId!);

      const jobAndLog = {
        job: job,
        log: jobLog.logs,
      }

      return jobAndLog;
    }
    catch(error: any) {
      this.logger.error(error.message, error);
      return { job: undefined, log: undefined };
    }
  }
}
