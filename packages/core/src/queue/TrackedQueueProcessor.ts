import { OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { DateTime } from 'luxon';

import { TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { ILogger } from '../telemetry';
import { IMessage, IUnknownMessage } from '../message';
import { Providers } from '../providers';
import { TrackedJobEventQueue } from './TrackedJobEventQueue';
import { TypedWorkerHost } from './TypedWorkerHost';


@Injectable()
export abstract class TrackedQueueProcessor<
  T extends IMessage | IUnknownMessage = any
> extends TypedWorkerHost<T> {

  constructor(
    readonly trackedQueueRepository: TrackedQueueRepository,
    readonly jobEventQueue: TrackedJobEventQueue,
    @Inject(Providers.ILogger) readonly logger: ILogger,
  ) {
    super();
  };

  async process(job: Job<T>, token?: string): Promise<any> {
    const logMsg = `Queue: ${job.queueName} Job: ${job.id} Processing: ${job.name}`;
    this.logger.info(logMsg);
    job.log(`${DateTime.now().toISO()} info ${logMsg}`);
  }

  async pause(): Promise<void> {
    this.logger.info(`Processor Paused`);
    await this.worker.pause();
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<T>, prev: string) {
    const logMsg = `Queue: ${job.queueName} ${job.id} Active: ${JSON.stringify(prev)}`;
    this.logger.info(logMsg);
    job.log(`${DateTime.now().toISO()} info ${logMsg}`);

    await this.jobEventQueue.trackActive(job, prev).catch(error => { this.logger.error(error)});
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<T>) {
    const logMsg = `${DateTime.now().toISO()} Queue: ${job.queueName} Job: ${job.id} Completed: ${JSON.stringify(job.returnvalue)}`;
    this.logger.info(logMsg);
    job.log(`${DateTime.now().toISO()} info ${logMsg}`);

    await this.jobEventQueue.trackCompleted(job, 'active').catch(error => { this.logger.error(error)});
  }

  @OnWorkerEvent('error')
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
  async onFailed(job: Job<T>, error: Error, prev: string) {
    const logMsg = `Queue: ${job.queueName} Job: ${job.id} Failed: ${error.name} { message: ${error.message} cause: ${error.cause} }`;
    this.logger.info(logMsg);
    job.log(`${DateTime.now().toISO()} info ${logMsg}`);

    await this.jobEventQueue.trackFailed(job, error, prev);
  };

  @OnWorkerEvent('progress')
  async onProgress(job: Job<T>, progress: number | object) {
    const logMsg = `Queue: ${job.queueName} Job: ${job.id} Progress: ${typeof(progress) === 'object' ? JSON.stringify(progress) : progress}`;
    this.logger.info(logMsg);
    job.log(`${DateTime.now().toISO()} info ${logMsg}`);

    await this.jobEventQueue.trackProgress(job, progress);
  }

  @OnWorkerEvent('stalled')
  async onStalled(job: Job<T>, prev: string) {
    const logMsg = `Queue: ${job.queueName} Job: ${job.id} Stalled: ${JSON.stringify(prev)}`;
    this.logger.info(logMsg);
    job.log(`${DateTime.now().toISO()} info ${logMsg}`);

    await this.jobEventQueue.trackStalled(job, prev);
  }
}
