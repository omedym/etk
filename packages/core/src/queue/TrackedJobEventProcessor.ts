import { Processor, getQueueToken } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Job, Queue } from 'bullmq';

import { JobEvent, JobState, TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { Providers } from '../providers';
import { TypedWorkerHost } from './TypedWorkerHost';
import { ILogger } from '../telemetry';

import {
  TrackedJobEventContext,
  TrackedJobEventData,
  TrackedJobEventDataCompact,
  TrackedJobEventDataFull,
} from './TrackedJobEventData.type';
import { setTrackedJobEventTelemetry } from './TrackedJobTelemetry';

/**
 * This worker processes events generated from TrackedProcessors and is
 * used to handle updates with the persistent datastore.
 */
@Injectable()
@Processor(Providers.TrackedJobEventQueue)
export class TrackedJobEventProcessor extends TypedWorkerHost<TrackedJobEventData> {


  constructor(
    private moduleRef: ModuleRef,
    @Inject(TrackedQueueRepository) readonly repository: TrackedQueueRepository,
    @Inject(Providers.ILogger) readonly logger: ILogger,
  ) {
    super();
  };

  // @Transaction({ op: 'process', startNewTrace: true, clearContextFor: DefaultClearContext })
  async process(job: Job<TrackedJobEventData>, token?: string) {
    const context: TrackedJobEventContext = {
      jobEventId: job.id,
      jobEventType: job.name,
      jobId: job.data.jobId,
      queueId: job.data.queueId,
      tenantId: (job.data as TrackedJobEventDataFull)?.tenantId,
    };

    const { jobLogger } = setTrackedJobEventTelemetry(this.logger, { job, message: context, token });

    jobLogger.info(`Processing Job Event: ${context.jobId}-${context.jobEventId} ${job.name}`,  { context });

    switch(job.name) {
      // Worker Events
      case JobEvent.workerJobActive:
        return this.onWorkerJobActive(jobLogger, context, job.data as TrackedJobEventDataFull);
      case JobEvent.workerJobCompleted:
        return this.onWorkerJobCompleted(jobLogger, context, job.data as TrackedJobEventDataFull);
      case JobEvent.workerJobFailed:
        return this.onWorkerJobFailed(jobLogger, context, job.data as TrackedJobEventDataFull);
      case JobEvent.workerJobProgress:
        return this.onWorkerJobProgress(jobLogger, context, job.data as TrackedJobEventDataFull)
      case JobEvent.workerJobStalled:
        return this.onWorkerJobStalled(jobLogger, context, job.data as TrackedJobEventDataFull)

      // Queue Events
      case JobEvent.queueJobDelayed:
        return this.onQueueJobDelayed(jobLogger, context, job.data as TrackedJobEventDataCompact)

      default:
        const logMsg = `Unsupported Job Event State ${context.jobId}-${context.jobEventId} ${job.name}`;
        jobLogger.warn(logMsg)
        throw new Error(logMsg);
    }
  }

  async onWorkerJobActive(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    logger.debug(`Processing Job Event: ${context.jobId}-${context.jobEventId} ${context.jobEventType}`, { context, event });
    const jobAndLog = await this.fetchJobAndLog(logger, context);

    const exists = await this.repository.findJobById({
      tenantId: event.tenantId,
      jobId: event.jobId,
    });

    if (!exists) {
      const created = await this.repository.trackJob({
        tenantId: event.tenantId,
        queueGroupId: null,
        queueId: event.queueId,
        jobId: event.jobId,
        event: JobEvent.workerJobActive,
        state: 'waiting',
        dataType: 'message',
        dataId: event.data.id,
        data: event.data,
        createdAt: event.createdAt,
        metadata: event.metadata,
        log: jobAndLog.log,
      });
    }

    const updated = await this.repository.updateTrackedJob({
      jobEventId: context.jobEventId,
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.updatedAt,
      event: JobEvent.workerJobActive,
      state: event.state,
      statePrev: event.statePrev,
      metadata: {
        ...event.metadata,
        attemptsMade: jobAndLog.job?.attemptsMade,
        queueId: event.queueId,
      },
      log: jobAndLog.log,
    });
  }

  async onWorkerJobCompleted(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    logger.debug(`Processing Job Event: ${context.jobId}-${context.jobEventId} ${context.jobEventType}`, { context, event });

    const jobAndLog = await this.fetchJobAndLog(logger, context);

    const { progress, ...restOfMetadata } = event.metadata;

    /**
     * - We assumed the createdAt timestamp was derived from job.finishedOn
     * - As we're marking the job completed we automatically set any numeric progress
     *   information to 1.0. If an object based progress is being used it is up to the
     *   consumer to update this object a final time before the job completed event is
     *   published.
     */
    const updated = await this.repository.updateTrackedJob({
      jobEventId: context.jobEventId,
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobCompleted,
      state: event.state,
      statePrev: event.statePrev,
      metadata: typeof(progress) !== 'object'
        ? { ...restOfMetadata, attemptsMade: jobAndLog.job?.attemptsMade, progress: 1.0, queueId: event.queueId }
        : { ...event.metadata, attemptsMade: jobAndLog.job?.attemptsMade, queueId: event.queueId },
      log: jobAndLog.log,
    });
  }

  async onWorkerJobFailed(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    logger.debug(`Processing Job Event: ${context.jobId}-${context.jobEventId} ${context.jobEventType}`, { context, event });

    const jobAndLog = await this.fetchJobAndLog(logger, context);

    const updated = await this.repository.updateTrackedJob({
      jobEventId: context.jobEventId,
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobFailed,
      state: event.state,
      statePrev: event.statePrev,
      metadata: {
        ...event.metadata,
        attemptsMade: jobAndLog.job?.attemptsMade,
        queueId: event.queueId,
      },
      log: jobAndLog.log,
    });
  }

  async onWorkerJobProgress(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    logger.debug(`Processing Job Event: ${context.jobId}-${context.jobEventId} ${context.jobEventType}`, { context, event });

    const jobAndLog = await this.fetchJobAndLog(logger, context);

    const updated = await this.repository.updateTrackedJob({
      jobEventId: context.jobEventId,
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobProgress,
      state: event.state,
      statePrev: event.statePrev,
      metadata: {
        ...event.metadata,
        attemptsMade: jobAndLog.job?.attemptsMade,
        queueId: event.queueId,
      },
      log: jobAndLog.log,
    });
  }

  async onWorkerJobStalled(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    logger.debug(`Processing Job Event: ${context.jobId}-${context.jobEventId} ${context.jobEventType}`, { context, event });

    const jobAndLog = await this.fetchJobAndLog(logger, context);

    const updated = await this.repository.updateTrackedJob({
      jobEventId: context.jobEventId,
      tenantId: event.tenantId,
      jobId: event.jobId,
      createdAt: event.createdAt,
      event: JobEvent.workerJobStalled,
      state: event.state,
      statePrev: event.statePrev,
      metadata: {
        ...event.metadata,
        attemptsMade: jobAndLog.job?.attemptsMade,
        queueId: event.queueId,
      },
      log: jobAndLog.log,
    });
  }

  async onQueueJobDelayed(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataCompact) {
    logger.debug(`Processing Job Event: ${context.jobId}-${context.jobEventId} ${context.jobEventType}`, { context, event });

    const job = await this.repository.findJobByJobId(event.jobId)
    const jobAndLog = await this.fetchJobAndLog(logger, {...context, tenantId: job.tenantId });

    const { ...restOfMetadata } = event.metadata;

    const delayed = await this.repository.updateTrackedJob({
      jobEventId: context.jobEventId,
      tenantId: job.tenantId,
      jobId: job.jobId,
      createdAt: event.createdAt,
      event: JobEvent.queueJobDelayed,
      state: JobState.waiting,
      statePrev: JobState.active,
      metadata: {
        ...restOfMetadata,
        attemptsMade: jobAndLog.job?.attemptsMade,
        queueId: event.queueId,
      },
      log: jobAndLog.log,
    });
  }

  async fetchJobAndLog(logger: ILogger, context: TrackedJobEventContext) {
    logger.debug(`Fetching Job Log for ${context.jobId}`,  { context });

    try {
      const { queueId, jobId } = context;
      const queueToken = getQueueToken(queueId);

      logger.debug(`Connect to tracked queue: ${queueId} with queueToken: ${queueToken}`, context);
      const queue = this.moduleRef.get<Queue>(queueToken, { strict: false });

      logger.debug(`Get jobId: ${jobId}`, { context });
      const job = await queue.getJob(jobId);

      logger.debug(`Get job logs for jobId: ${jobId}`, { context });
      const jobLog = await queue.getJobLogs(jobId!);

      const jobAndLog = {
        job: job,
        log: jobLog.logs,
      }

      return jobAndLog;
    }
    catch(error: any) {
      logger.warn(error.message, error);
      return { job: undefined, log: undefined };
    }
  }
}
