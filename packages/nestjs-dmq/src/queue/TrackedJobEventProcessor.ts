import { InjectQueue, Processor, getQueueToken } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { DateTime } from 'luxon';

import {
  CreateTrackedJobParams,
  JobEvent,
  JobState,
  TrackedQueueRepository,
  UpdateTrackedJobParams,
} from '@omedym/nestjs-dmq-repository';
import { ILogger, SentryTransaction } from '@omedym/nestjs-telemetry';

import { Providers } from '../providers';
import { TypedWorkerHost } from './TypedWorkerHost';
import { DefaultClearContext, setTrackedJobEventTelemetry } from './TrackedJobTelemetry';

import type {
  TrackedJobEventContext,
  TrackedJobEventData,
  TrackedJobEventDataCompact,
  TrackedJobEventDataFull,
} from './TrackedJobEventData.type';

type JobAndLog =
  | { job: Job<any, any, string> | undefined; log: string[]; }
  | { job: undefined; log: undefined; }

/**
 * This worker processes events generated from TrackedProcessors and is
 * used to handle updates with the persistent datastore.
 */
@Injectable()
@Processor(Providers.TrackedJobEventQueue, {
  maxStalledCount: 3,
  stalledInterval: 60000,
})
export class TrackedJobEventProcessor extends TypedWorkerHost<TrackedJobEventData> {

  constructor(
    @Inject(TrackedQueueRepository) readonly repository: TrackedQueueRepository,
    @Inject(Providers.ILogger) readonly logger: ILogger,
    // Inject Queue To Get Redis Client
    @InjectQueue(Providers.TrackedJobEventQueue) readonly trackedJobEventQueue: Queue,
  ) {
    super();
  };

  @SentryTransaction({ op: 'process', startNewTrace: true, clearContextFor: DefaultClearContext })
  async process(job: Job<TrackedJobEventData>, token?: string) {
    const context: TrackedJobEventContext = {
      jobEventId: job.id,
      jobEventType: job.name,
      jobId: job.data.jobId,
      queueId: job.data.queueId,
      tenantId: (job.data as TrackedJobEventDataFull)?.tenantId,
    };

    const { jobLogger } = setTrackedJobEventTelemetry(this.logger, { job, message: context, token });

    jobLogger.debug(this.buildLogMsg(context), { context, job });

    switch(context.jobEventType) {
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
        const logMsg = this.buildLogMsg(context, `Unsupported`);
        jobLogger.debug(logMsg, { context, job });
        throw new Error(logMsg);
    }
  }

  async onWorkerJobActive(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    logger.debug(this.buildLogMsg(context), { context, event });

    const exists = await this.repository.findJobById({
      tenantId: event.tenantId,
      jobId: event.jobId,
    });

    if (!exists) {
      logger.debug(`TrackedJob jobId: ${context.jobId} does not exist, creating`, { context, event });
      await this.trackJob(logger, context, event);
    }

    const jobToUpdate = {
      createdAt: event.updatedAt,
      event: JobEvent.workerJobActive,
      state: event.state,
      statePrev: event.statePrev,
    };

    await this.updateTrackedJob(logger, context, event, jobToUpdate);
  }

  async onWorkerJobCompleted(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    /**
     * - We assumed the event.createdAt timestamp was derived from job.finishedOn
     * - As we're marking the job completed we automatically set any numeric progress
     *   information to 1.0. If an object based progress is being used it is up to the
     *   consumer to update this object a final time before the job completed event is
     *   published.
     */
    const jobToUpdate = {
      event: JobEvent.workerJobCompleted,
      state: event.state,
      statePrev: event.statePrev,
      progress: typeof(event.metadata.progress) !== 'object' ? 1.0 : undefined,
    };

    await this.updateTrackedJob(logger, context, event, jobToUpdate);
  }

  async onWorkerJobFailed(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    const jobToUpdate = {
      event: JobEvent.workerJobFailed,
      state: event.state,
      statePrev: event.statePrev,
    };

    await this.updateTrackedJob(logger, context, event, jobToUpdate);
  }

  async onWorkerJobProgress(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    const jobToUpdate = {
      event: JobEvent.workerJobProgress,
      state: event.state,
      statePrev: event.statePrev,
      progress: event.metadata.progress,
    };

    await this.updateTrackedJob(logger, context, event, jobToUpdate);
  }

  async onWorkerJobStalled(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataFull) {
    const jobToUpdate = {
      event: JobEvent.workerJobStalled,
      state: event.state,
      statePrev: event.statePrev,
    };

    await this.updateTrackedJob(logger, context, event, jobToUpdate);
  }

  async onQueueJobDelayed(logger: ILogger, context: TrackedJobEventContext, event: TrackedJobEventDataCompact) {
    logger.debug(this.buildLogMsg(context), { context, event });

    const job = await this.repository.findJobByJobId(event.jobId)
    const jobAndLog = await this.fetchJobAndLog(logger, {...context, tenantId: job.tenantId });

    const jobToUpdate = {
      event: JobEvent.queueJobDelayed,
      state: JobState.waiting,
      statePrev: JobState.active,
      jobAndLog: jobAndLog,
    };

    await this.updateTrackedJob(logger, context, event, jobToUpdate);
  }

  async fetchJobAndLog(logger: ILogger, context: TrackedJobEventContext): Promise<JobAndLog> {
    logger.debug(`Fetching Job Log for ${context.jobId}`,  { context });

    try {
      const { queueId, jobId } = context;

      if (!queueId || !jobId) {
        logger.debug(`Skip, not enough data to fetch logs`, { context });
        return { job: undefined, log: undefined };
      }

      const queueToken = getQueueToken(queueId);

      logger.debug(`Connect to tracked queue: ${queueId} with queueToken: ${queueToken}`, context);
      const redisConnection = await this.trackedJobEventQueue.client;
      const queue = new Queue(queueId, { connection: redisConnection });

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

  private buildLogMsg(context: TrackedJobEventContext, msg: string = 'Processing'): string {
    const ctx = `jobId: ${context.jobId} jobEventId: ${context.jobEventId} jobEventType:${context.jobEventType}`;
    return `${msg} Tracked Job ${ctx}`;
  }

  private async trackJob(
    logger: ILogger,
    context: TrackedJobEventContext,
    event: TrackedJobEventDataFull,
  ) {
    const ctx = `jobId: ${context.jobId}`;

    logger.debug(`Preparing to Track Job ${ctx}`, { context, event });
    const jobAndLog = await this.fetchJobAndLog(logger, context);

    const jobToTrack: CreateTrackedJobParams = {
      tenantId: event.tenantId ?? '!!',
      queueGroupId: null,
      queueId: event.queueId,
      jobId: event.jobId,
      event: JobEvent.workerJobActive,
      state: JobState.waiting,
      dataType: 'message',
      dataId: event.data.id,
      data: event.data,
      createdAt: event.createdAt,
      metadata: event.metadata,
      log: jobAndLog.log,
    };

    logger.debug(`Creating Tracked Job ${ctx}`, { context, jobToTrack });
    const created = await this.repository.trackJob(jobToTrack);

    logger.debug(`Created Tracked Job ${ctx}`, { context, jobToTrack, created });
  }

  private async updateTrackedJob(
    logger: ILogger,
    context: TrackedJobEventContext,
    event: TrackedJobEventData,
    update: {
      createdAt?: DateTime;
      event: JobEvent,
      state: JobState,
      statePrev: JobState,
      progress?: number | object;
      jobAndLog?: JobAndLog,
    }
  ) {
    logger.debug(this.buildLogMsg(context, 'Preparing to update'), { context, event, update });

    const jobAndLog = update.jobAndLog ?? await this.fetchJobAndLog(logger, context);

    const exists = context.tenantId
      ? await this.repository.findJobById({ tenantId: context.tenantId, jobId: context.jobId })
      : await this.repository.findJobByJobId(context.jobId, false);

    if (!exists) {
      logger.debug(`TrackedJob jobId: ${context.jobId} does not exist, delaying`, { context, event });
      await this.moveToDelay(logger, context, event, jobAndLog);
      return;
    }

    const jobToUpdate: UpdateTrackedJobParams = {
      jobEventId: context.jobEventId,
      tenantId: context.tenantId ?? '!!',
      jobId: event.jobId,
      createdAt: update.createdAt ?? event.createdAt,
      event: update.event,
      state: update.state,
      statePrev: update.statePrev,
      metadata: {
        ...event.metadata,
        ...(update.progress ? { progress: update.progress } : {}),
        attemptsMade: jobAndLog.job?.attemptsMade,
        queueId: event.queueId,
      },

      log: jobAndLog.log,
    };

    logger.debug(this.buildLogMsg(context, 'Updating'), { context, event, update, jobToUpdate });
    const updated = await this.repository.updateTrackedJob({
      ...jobToUpdate,
      log: jobAndLog.log,
    });

    logger.debug(this.buildLogMsg(context, 'Updated'), { context, jobToUpdate, updated });
  }

  private async moveToDelay(
    logger: ILogger,
    context: TrackedJobEventContext,
    event: TrackedJobEventData,
    jobAndLog: JobAndLog,
  ): Promise<boolean> {
    const ctx = `jobId: ${context.jobId} jobEventId: ${context.jobEventId} jobEventType: ${context.jobEventType}`;
    const { job } = jobAndLog;

    if (!job) return false;

    if (job.attemptsMade >= 10) {
      const msg = `Cancelling processing: Error after 10 attempts ${ctx}`;
      logger.warn(msg, { context, event});
      job.moveToFailed(new Error(msg), job.token!);
      return false;
    }

    const runAt = DateTime.now().plus(5000);

    await job.moveToDelayed(runAt.toMillis(), job.token);
    await job.updateProgress({
      attemptsMade: job.attemptsMade,
      delay: runAt.minus(DateTime.now()).toMillis(),
      jobId: job.id,
      jobEventId: context.jobEventId,
      jobEventType: context.jobEventType,
      state: (await job.getState()).toString(),
      tenantId: context.tenantId,
      runAt: runAt.toISO(),
    });

    return true;
  }
}
