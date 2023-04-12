import { OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';
import { DateTime } from 'luxon';

import { JobState, TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { ILogger } from '../telemetry';
import { IMessage, IUnknownMessage } from '../message';
import { Providers } from '../providers';
import { TrackedJobEventQueue } from './TrackedJobEventProcessor';
import { TypedWorkerHost } from './TypedWorkerHost';


@Injectable()
export abstract class TrackedProcessor<
  T extends IMessage | IUnknownMessage = any
> extends TypedWorkerHost<T> {

  constructor(
    readonly trackedQueueRepository: TrackedQueueRepository,
    readonly jobEventQueue: TrackedJobEventQueue,
    @Inject(Providers.ILogger) readonly logger: ILogger,
  ) {
    super();

  };

  async process(job: Job<T>): Promise<any> {
    this.logger.info(`Job ${job.id} Processing: ${job.name}`);
  }

  async pause(): Promise<void> {
    await this.worker.pause();
  }

  @OnWorkerEvent('active')
  async onActive(job: Job<T>, prev: string) {
    this.jobEventQueue.trackActive(job, prev);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<T>) {
    this.jobEventQueue.trackCompleted(job, 'active');
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job<T>, error: Error, prev: string) {
    this.jobEventQueue.trackFailed(job, error, prev);
  };

  @OnWorkerEvent('progress')
  onProgress(job: Job<T>, progress: number | object) {
    this.jobEventQueue.trackProgress(job, progress);
  }
}
