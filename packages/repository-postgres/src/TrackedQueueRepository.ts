import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import { providers } from'./providers';
import { PrismaService } from './prisma.service';
import {
  FindJobByIdParams,
  TrackJobParams,
  ITrackedQueueJob,
} from './types';

@Injectable()
export class TrackedQueueRepository {
  constructor(@Inject(providers.PRISMA) private readonly prisma: PrismaService) {}

  async trackJob<T extends object>(jobToTrack: TrackJobParams<T>): Promise<ITrackedQueueJob<T>> {
    const now = DateTime.now();
    const trackedJob = await this.prisma.trackedQueueJob.create({
      data: {
        ...jobToTrack,
        createdAt: now.toJSDate(),
        updatedAt: now.toJSDate(),
        events: {
          create: [{
            state: jobToTrack.state,
            createdAt: now.toJSDate(),
          }],
        },
      },
      include: {
        events: true,
      }
    });

    return trackedJob as unknown as ITrackedQueueJob<T>;
  }

  async findJobById<T extends object>(
    jobToFind: FindJobByIdParams
  ): Promise<ITrackedQueueJob<T> | null> {
    const job = (await this.prisma.trackedQueueJob.findUnique({
      where: {
         tenantId_jobId: jobToFind,
      },
    })) ;

    return job as unknown as ITrackedQueueJob<T>;
  }
}
