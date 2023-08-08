import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

import { providers } from'./providers';
import { PrismaService } from './prisma.service';
import {
  FindJobByIdParams,
  CreateTrackedJobParams,
  ITrackedQueueJob,
  UpdateTrackedJobParams,
  Vault,
  VaultToCreate,
  VaultState,
} from './types';


const {
  NESTJS_DMQ__QUEUE_SUFFIX = '',
} = process.env;

export const QueueSuffix = NESTJS_DMQ__QUEUE_SUFFIX ? `-${NESTJS_DMQ__QUEUE_SUFFIX}` : undefined;

@Injectable()
export class TrackedQueueRepository {
  constructor(@Inject(providers.PRISMA) private readonly prisma: PrismaService) {}

  async findJobById<T extends object>(
    jobToFind: FindJobByIdParams
  ): Promise<ITrackedQueueJob<T> | null> {
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

  async findJobByJobId<T extends object>(
    jobId: string
  ): Promise<ITrackedQueueJob<T>> {
    const job = (await this.prisma.trackedQueueJob.findUniqueOrThrow({
      where: {
         jobId: jobId,
      },
      include: {
        events: true,
      }
    })) ;

    return job as unknown as ITrackedQueueJob<T>;
  }

  async trackJob<T extends object>(
    jobToTrack: CreateTrackedJobParams<T>
  ): Promise<ITrackedQueueJob<T>> {
    const { createdAt, event, log, metadata, queueId, ...eventData } = jobToTrack;
    const timestampAt = createdAt && createdAt.isValid ? createdAt : DateTime.now();
    const trackedJob = await this.prisma.trackedQueueJob.create({
      data: {
        ...eventData,
        queueId: QueueSuffix ? queueId.replace(QueueSuffix, '') : queueId,
        createdAt: timestampAt.toJSDate(),
        updatedAt: timestampAt.toJSDate(),

        events: {
          create: [{
            event: jobToTrack.event,
            state: jobToTrack.state,
            metadata: metadata,
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

  async updateTrackedJob<T extends object>(
    jobToUpdate: UpdateTrackedJobParams
  ): Promise<ITrackedQueueJob<T>> {
    const { tenantId, jobId, createdAt, log, ...eventData } = jobToUpdate;
    const timestampAt = createdAt && createdAt.isValid ? createdAt : DateTime.now();

    const jobDataToUpdate = {
      state: eventData.state,
      updatedAt: timestampAt.toJSDate(),
      ...(log ? { log } : { log: [] }), // If provided update the log entry
    }

    const jobEventToCreate = {
      ...eventData,
      createdAt: timestampAt.toJSDate(),
      log,
    }

    const trackedJob = await this.prisma.trackedQueueJob.update({
      data: {
        ...jobDataToUpdate,
        events: { create: [{ ...jobEventToCreate }] },
      },
      include: {
        events: true
      },
      where: {
        tenantId_jobId: { tenantId, jobId }},
    });

    return trackedJob as ITrackedQueueJob<T>;
  };

   async createVault(data: VaultToCreate): Promise<Vault> {
    return this.prisma.vault.create({
      data: {
        ...data,
        state: VaultState.active,
      },
    });
  }

  async findVaultById({ tenantId, vaultId }: { tenantId: string; vaultId: string }): Promise<Vault | null> {
    return this.prisma.vault.findUnique({
      where: {
        tenantId_vaultId: {
          tenantId,
          vaultId,
        },
      },
    });
  }

  async findVaultByEntityId({ tenantId, entityType, entityId }: { tenantId: string; entityType: string, entityId: string }): Promise<Vault[]> {
    return this.prisma.vault.findMany({
      where: {
        tenantId,
        entityType,
        entityId
      },
    });
  }

   async destroyKeysByEntityId({ tenantId, entityType, entityId }: { tenantId: string; entityType: string, entityId: string }) {
    return this.prisma.vault.updateMany({
      where: {
        tenantId,
        entityType,
        entityId
      },
      data: {
        key: '',
        state: VaultState.deleted,
      }
    });
  }
}
