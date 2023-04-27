import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { DateTime } from 'luxon';

import { providers } from'./providers';
import { PrismaService } from './prisma.service';
import {
  FindJobByIdParams,
  CreateTrackedJobParams,
  ITrackedQueueJob,
  UpdateTrackedJobParams,
} from './types';


@Injectable()
export class TrackedQueueRepository {
  constructor(@Inject(providers.PRISMA) private readonly prisma: PrismaService) {}

  async findJobById<T extends object>(jobToFind: FindJobByIdParams): Promise<ITrackedQueueJob<T> | null> {
    const job = (await this.prisma.trackedQueueJob.findUnique({
      where: {
         tenantId_jobId: jobToFind,
      },
      include: {
        events: true,
      }
    })) ;

    return job as ITrackedQueueJob<T>;
  }

  async findJobByJobId<T extends object>(jobId: string): Promise<ITrackedQueueJob<T>> {
    const job = (await this.prisma.trackedQueueJob.findUniqueOrThrow({
      where: {
         jobId: jobId,
      },
      include: {
        events: true,
      }
    })) ;

    return job as ITrackedQueueJob<T>;
  }

  async trackJob<T extends object>(jobToTrack: CreateTrackedJobParams<T>): Promise<ITrackedQueueJob<T>> {
    const { createdAt, event, ...eventData } = jobToTrack;
    const timestampAt = createdAt && createdAt.isValid ? createdAt : DateTime.now();
    const trackedJob = await this.prisma.trackedQueueJob.create({
      data: {
        ...eventData,
        createdAt: timestampAt.toJSDate(),
        updatedAt: timestampAt.toJSDate(),

        events: {
          create: [{
            event: jobToTrack.event,
            state: jobToTrack.state,
            createdAt: timestampAt.toJSDate(),
          }],
        },
      },
      include: {
        events: true,
      }
    });

    return trackedJob as ITrackedQueueJob<T>;
  }

  async updateTrackedJob<T extends object>(jobToUpdate: UpdateTrackedJobParams): Promise<ITrackedQueueJob<T>> {
    const { tenantId, jobId, createdAt, log, ...eventData } = jobToUpdate;
    const timestampAt = createdAt && createdAt.isValid ? createdAt : DateTime.now();

    const jobDataToUpdate = {
      state: eventData.state,
      updatedAt: timestampAt.toJSDate(),
      ...(log ? { log } : {}), // If provided update the log entry
    }

    const JobEventToCreate = {
      ...eventData,
      createdAt: timestampAt.toJSDate(),
    }

    const trackedJob = await this.prisma.trackedQueueJob.update({
      data: {
        ...jobDataToUpdate,
        events: { create: [{ ...JobEventToCreate }] },
      },
      include: {
        events: true
      },
      where: {
        tenantId_jobId: { tenantId, jobId }},
    });

    return trackedJob as ITrackedQueueJob<T>;
  };
}
