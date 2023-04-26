import { OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

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
    this.logger.info(`Job ${job.id} Processing: ${job.name}`);
  }

  async pause(): Promise<void> {
    await this.worker.pause();
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<T>, prev: string) {
    await this.jobEventQueue.trackActive(job, prev);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<T>) {
    await this.jobEventQueue.trackCompleted(job, 'active');

    this.worker
  }

  @OnWorkerEvent('error')
  async onError(error: Error) {
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
    await this.jobEventQueue.trackFailed(job, error, prev);
  };

  @OnWorkerEvent('progress')
  async onProgress(job: Job<T>, progress: number | object) {
    await this.jobEventQueue.trackProgress(job, progress);
  }

  @OnWorkerEvent('stalled')
  async onStalled(job: Job<T>, prev: string) {
    await this.jobEventQueue.trackStalled(job, prev);
  }
}
