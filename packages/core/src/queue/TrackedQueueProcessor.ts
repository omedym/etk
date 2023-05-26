import { OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { ILogger } from '../telemetry';
import { Providers } from '../providers';
import { IMessage, IMessageDefinition, IMessageQueueDefinition, IUnknownMessage } from '../message';
import { TrackedJobEventQueue } from './TrackedJobEventQueue';
import { TypedWorkerHost } from './TypedWorkerHost';
import { DefaultClearContext, setTrackedJobTelemetry } from './TrackedJobTelemetry';


export interface IMessageHandlerContext<T extends IMessage | IUnknownMessage> {
  job: Job<T>;
  message: T;
  messageDefinition?: IMessageDefinition;
  messageQueueDefinition?: IMessageQueueDefinition;
  token?: string;
}

export interface IMessageRouter<T extends IMessage> {
  route: (logger: ILogger, context: IMessageHandlerContext<T>) => Promise<any>;
}

@Injectable()
export abstract class TrackedQueueProcessor<
  T extends IMessage = any
> extends TypedWorkerHost<T> {

  @Inject(TrackedQueueRepository) readonly trackedQueueRepository: TrackedQueueRepository;
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

    jobLogger.info(`Queue: ${job.queueName} Job: ${job.id} Processing: ${job.name}`);

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
    jobLogger.info(`Queue: ${job.queueName} Job: ${job.id} Active: ${JSON.stringify(prev)}`);
    await this.jobEventQueue.trackActive(job, prev).catch(error => { this.logger.error(error)});
  }

  @OnWorkerEvent('completed')
  // @Transaction({ name: 'onWorkerEvent', op: 'completed', clearContextFor: DefaultClearContext })
  async onCompleted(job: Job<T>) {
    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    jobLogger.info(`Queue: ${job.queueName} Job: ${job.id} Completed: ${JSON.stringify(job.returnvalue)}`);
    await this.jobEventQueue.trackCompleted(job, 'active').catch(error => { this.logger.error(error)});
  }

  @OnWorkerEvent('error')
  // @Transaction({ name: 'onWorkerEvent', op: 'error', clearContextFor: DefaultClearContext })
  async onError(error: Error) {
    const logMsg = `Processor Error: ${error.name} { message: ${error.message} cause: ${error.cause} }`;
    this.logger.warn(logMsg);

    try {
      error?.message.startsWith('Missing lock for job')
        ? this.logger.debug('Missing lock for job', error)
        : this.logger.error(error)
    } catch (e) {
      this.logger.error(error);
      throw error;
    }
  }

  @OnWorkerEvent('failed')
  // @Transaction({ name: 'onWorkerEvent', op: 'failed', clearContextFor: DefaultClearContext })
  async onFailed(job: Job<T>, error: Error, prev: string) {
    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    jobLogger.warn(`Queue: ${job.queueName} Job: ${job.id} Failed: ${error.name} { message: ${error.message} cause: ${error.cause} }`);
    await this.jobEventQueue.trackFailed(job, error, prev);
  };

  @OnWorkerEvent('progress')
  // @Transaction({ name: 'onWorkerEvent', op: 'progress', clearContextFor: DefaultClearContext })
  async onProgress(job: Job<T>, progress: number | object) {
    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    jobLogger.warn(`Queue: ${job.queueName} Job: ${job.id} Progress: ${typeof(progress) === 'object' ? JSON.stringify(progress) : progress}`);
    await this.jobEventQueue.trackProgress(job, progress);
  }

  @OnWorkerEvent('stalled')
  // @Transaction({ name: 'onWorkerEvent', op: 'stalled', clearContextFor: DefaultClearContext })
  async onStalled(job: Job<T>, prev: string) {
    const { jobLogger } = setTrackedJobTelemetry(this.logger, { job, message: job.data as T });
    jobLogger.warn(`Queue: ${job.queueName} Job: ${job.id} Stalled: ${JSON.stringify(prev)}`);
    await this.jobEventQueue.trackStalled(job, prev);
  }
}
