import { WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Inject, Injectable } from '@nestjs/common';
import { Job } from 'bullmq';

import { Providers } from '../providers';
import { ILogger } from '../telemetry';

@Injectable()
export abstract class TrackedProcessor extends WorkerHost {

  constructor(
    @Inject(Providers.ILogger) readonly logger: ILogger,
  ) {
    super();
  };

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.info(`Job ${job.id} Processing: ${job.name}`);
  }

  async pause(): Promise<void> {
    await this.worker.pause();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any, any, string>) {
    this.logger.debug(`Job ${job.id} Completed: ${JSON.stringify(job)}`);
  }
}
