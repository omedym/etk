import { OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { TrackedWorkerHost } from './TrackedWorkerHost';
import { Job } from 'bullmq';

import { TrackedQueueRepository } from '@omedym/nestjs-dmq-repository-postgres';

import { ILogger } from '../telemetry';
import { IMessage, IUnknownMessage } from '../message';
import { Providers } from '../providers';

@Injectable()
export abstract class TrackedProcessor<
  T extends IMessage | IUnknownMessage = any
> extends TrackedWorkerHost<T> {

  constructor(
    readonly trackedQueueRepository: TrackedQueueRepository,
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
    this.logger.debug(`Job ${job.id} Active: ${JSON.stringify(job)}`);

    const trackedJob = await this.trackedQueueRepository.trackJob({
      tenantId: job.data?.tenantid || 'SYSTEM',
      queueGroupId: 'queueGroupId',
      queueId: 'queueId',
      jobId: job.id,
      state: 'waiting',
      dataType: 'message',
      dataId: job?.data?.id,
      data: job?.data,
    });

    const updatedTrackedJob = await this.trackedQueueRepository.updateTrackedJob({
      tenantId: job.data.tenantid || 'SYSTEM',
      jobId: job.id!,
      state: 'active',
      // event: { prev: "prev" }
    });

    // this.logger.debug(JSON.stringify(updatedTrackedJob, null, 2));
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job<T>) {
    this.logger.debug(`Job ${job.id} Completed: ${JSON.stringify(job)}`);

    // const result = await this.trackedQueueRepository.findJobById({ tenantId: job?.data?.tenantid || '!!' , jobId: job?.data?.tenantid || '!!'});
    // console.warn(JSON.stringify(result, null, 2));
    // this.logger.warn(JSON.stringify(result, null, 2))

    // const updatedTrackedJob = await this.trackedQueueRepository.updateTrackedJob({
    //   tenantId: job?.data?.tenantid || '!!',
    //   jobId: job?.id || '!!',
    //   state: 'completed',
    //   event: { prev: 'active'}
    // });
  }
}
