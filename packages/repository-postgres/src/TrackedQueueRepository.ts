import { Inject, Injectable } from '@nestjs/common';
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

  async trackJob<T extends object>(
    jobToTrack: TrackJobParams<T>
  ): Promise<ITrackedQueueJob<T>> {
    const trackedJob = await this.prisma.trackedQueueJob.create({
      data: jobToTrack,
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
