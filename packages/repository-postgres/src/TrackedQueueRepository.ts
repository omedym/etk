import { Inject, Injectable } from '@nestjs/common';
import { createId } from '@paralleldrive/cuid2';
import { DateTime } from 'luxon';
import { providers } from './providers';
import { PrismaService } from './prisma.service';
import {
  FindJobByIdParams,
  TrackJobParams,
  ITrackedQueueJob,
  ITrackedQueueJobEvent,
  UpdateJobParams as UpdateTrackedJobParams,
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

    return job as unknown as ITrackedQueueJob<T>;
  }

  async trackJob<T extends object>(jobToTrack: TrackJobParams<T>): Promise<ITrackedQueueJob<T>> {
    const timestampAt = jobToTrack.createdAt ? jobToTrack.createdAt : DateTime.now();
    const trackedJob = await this.prisma.trackedQueueJob.create({
      data: {
        ...jobToTrack,
        createdAt: timestampAt.toJSDate(),
        updatedAt: timestampAt.toJSDate(),

        events: {
          create: [{
            state: jobToTrack.state,
            createdAt: timestampAt.toJSDate(),
          }],
        },
      },
      include: {
        events: true,
      }
    });

    return trackedJob as unknown as ITrackedQueueJob<T>;
  }

  async updateTrackedJob<T extends object>(jobUpdate: UpdateTrackedJobParams): Promise<ITrackedQueueJob<T>> {
    const { tenantId, jobId, createdAt, ...eventData } = jobUpdate;
    const timestampAt = createdAt ? createdAt : DateTime.now();

    const trackedJob = await this.prisma.trackedQueueJob.update({
      data: {
        state: eventData.state,
        updatedAt: timestampAt.toJSDate(),
        events: {
          create: [{
            ...eventData,
            createdAt: timestampAt.toJSDate(),
          }]
        }
      },
      include: {
        events: true,
      },
      where: {
        tenantId_jobId: { tenantId, jobId },
      },
    })

    return trackedJob as unknown as ITrackedQueueJob<T>;
  };
}
