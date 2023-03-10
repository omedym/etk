import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { Processor, WorkerHost, OnQueueEvent, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';


export abstract class TrackedProcessor extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    console.log(`DO PROCESS ${job.data?.seq}`);
  }

  async pause(): Promise<void> {
    await this.worker.pause();
  }

  @OnWorkerEvent('completed')
  onCompleted(job: any) {
    console.info(`COMPLETED ${JSON.stringify(job)}`);
  }
}
