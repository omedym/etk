import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { Processor, WorkerHost, OnQueueEvent, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';


export abstract class TrackedProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.info(`Job ${job.id} Processing: ${job.name}`);
  }

  async pause(): Promise<void> {
    await this.worker.pause();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<any, any, string>) {
    console.debug(`Job ${job.id} Completed: ${JSON.stringify(job)}`);
  }
}
