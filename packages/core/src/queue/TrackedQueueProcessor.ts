import { OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { ILogger } from '../telemetry';
import { Providers } from '../providers';
import { IMessage, IMessageDefinition, IMessageQueueDefinition, IUnknownMessage } from '../message';
import { TrackedJobEventQueue } from './TrackedJobEventQueue';
import { TypedWorkerHost } from './TypedWorkerHost';
import { setTrackedJobTelemetry } from './TrackedJobTelemetry';


export interface IMessageHandlerContext<T extends IMessage | IUnknownMessage> {
  job: Job<T>;
  message: T;
  messageDefinition?: IMessageDefinition;
  messageQueueDefinition?: IMessageQueueDefinition;
  token?: string;
}

export interface IMessageRouter<T extends IMessage | IUnknownMessage> {
  route: (logger: ILogger, context: IMessageHandlerContext<T>) => Promise<any>;
}

@Injectable()
export abstract class TrackedQueueProcessor<
  T extends IMessage | IUnknownMessage = any
> extends TypedWorkerHost<T> {

  @Inject(TrackedJobEventQueue) readonly jobEventQueue: TrackedJobEventQueue;
  @Inject(Providers.ILogger) readonly logger: ILogger;

  protected processorName: string = this.constructor.name;
  protected messageRouter: IMessageRouter<T> | undefined = undefined;

  /**
   * This is the entry point that job worker instances bind to when processing an item
   * in the processor's designated queue. The default method just logs the fact the job is
   * being triggered fro processing.
   *
   * **Warning**: If you override this method you will need to handle all aspects of routing
   * different job payloads, logging, etc.
   *
   * Use the __MessageHandlerParams__ type as your basis for any individual handler methods
   * you may route to as part of addressing multiple types of job payloads. Use the job.name
   * attribute as the simplest way of specifying the payload type when adding new jobs to
   * the queue.
   */
  // @Transaction({ op: 'process', clearContextFor: DefaultClearContext })
  async process(job: Job<T>, token?: string): Promise<any> {
    const context = { job, message: job.data as T, token };
    const { jobLogger } = setTrackedJobTelemetry(this.logger, context);

    jobLogger.info(`Queue Job Processing`);

    return this.messageRouter
      ? this.messageRouter && this.messageRouter.route(jobLogger, context)
      : Promise<void>
  }

  async pause(): Promise<void> {
    this.logger.info(`Processor Paused`);
    await this.worker.pause();
  }

  @OnWorkerEvent('active')
  // @Transaction({ name: 'onWorkerEvent', op: 'active', startNewTrace: true, clearContextFor: DefaultClearContext })
  async onActive(job: Job<T>, prev: string) {
    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    jobLogger.info(`Queue Job Active`, { prev });
    await this.jobEventQueue.trackActive(job, prev).catch(error => { this.logger.error(error)});
  }

  @OnWorkerEvent('completed')
  // @Transaction({ name: 'onWorkerEvent', op: 'completed', clearContextFor: DefaultClearContext })
  async onCompleted(job: Job<T>) {
    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    const returnValue = job.returnvalue ? `: ${JSON.stringify(job.returnvalue)}` : '';
    jobLogger.info(`Queue Job Completed`, { returnValue });
    await this.jobEventQueue.trackCompleted(job, 'active').catch(error => { this.logger.error(error)});
  }

  @OnWorkerEvent('error')
  // @Transaction({ name: 'onWorkerEvent', op: 'error', clearContextFor: DefaultClearContext })
  async onError(error: Error) {
    try {
      const logMsg = `Processor Error: ${error?.message }`;
      this.logger.info(logMsg);

      error?.message.startsWith('Missing lock for job')
        ? this.logger.debug('Missing lock for job', { error })
        : this.logger.warn(logMsg, { error })
    } catch (e) {
      this.logger.error(error);
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  // @Transaction({ name: 'onWorkerEvent', op: 'failed', clearContextFor: DefaultClearContext })
  async onFailed(job: Job<T> | undefined, error: Error, prev: string) {
    if (!job) {
      this.logger.warn(`Failed job is undefined, stalled job reaches the stalled limit and it is deleted by the removeOnFail option`, {
        error,
        prev
      });
      return;
    }

    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    jobLogger.warn(`Queue Job Failed: ${error?.message}`, { error });
    await this.jobEventQueue.trackFailed(job, error, prev);
  };

  @OnWorkerEvent('progress')
  // @Transaction({ name: 'onWorkerEvent', op: 'progress', clearContextFor: DefaultClearContext })
  async onProgress(job: Job<T>, progress: number | object) {
    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    const progressCtx = typeof(progress) === 'object' ? JSON.stringify(progress) : progress;
    jobLogger.info(`Queue Job Progress Update`, { progress: progressCtx });
    await this.jobEventQueue.trackProgress(job, progress);
  }

  @OnWorkerEvent('stalled')
  // @Transaction({ name: 'onWorkerEvent', op: 'stalled', clearContextFor: DefaultClearContext })
  async onStalled(jobId: string, prev: string) {
    this.logger.warn(`Queue Job Stalled`, { jobId, prev });
    await this.jobEventQueue.trackStalled(jobId, prev);
  }
}
