import { Inject, Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

import { providers } from'./providers';
import { PrismaService } from './prisma.service';
import {
  FindJobByIdParams,
  CreateTrackedJobParams,
  ITrackedQueueJob,
  UpdateTrackedJobParams,
  VaultToCreate,
} from './types';
import { decryptMessage, encryptMessage } from './utils';
import { VaultRecord, VaultState } from '@omedym/nestjs-dmq-repository-postgres-client';

const {
  NESTJS_DMQ__QUEUE_SUFFIX = '',
  NESTJS_DMQ__VAULT_SECRET_KEY = '',
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

    return job as ITrackedQueueJob<T>;
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
      ...(log ? { log } : {}), // If provided update the log entry
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
    })

    return trackedJob as ITrackedQueueJob<T>;
  };

   async createVault(data: VaultToCreate): Promise<VaultRecord> {
    const encryptedKey = encryptMessage({ message: data.key, key: NESTJS_DMQ__VAULT_SECRET_KEY });

    const result = await this.prisma.vaultRecord.create({
      data: {
        ...data,
        key: encryptedKey.message,
        state: VaultState.active,
      },
    });

    return {
      ...result,
      key: data.key,
    }
  }

  async findVaultKeyById({ tenantId, vaultId }: { tenantId: string; vaultId: string }): Promise<VaultRecord | null> {
    const result = await this.prisma.vaultRecord.findUnique({
      where: {
        tenantId_vaultId: {
          tenantId,
          vaultId,
        },
      },
    });

    if (!result) {
      return result;
    }

    const decryptedKey = decryptMessage({ message: result.key, key: NESTJS_DMQ__VAULT_SECRET_KEY });

    return {
      ...result,
      key: decryptedKey.message,
    }
  }

  async findVaultKeyByEntityId({ tenantId, entityId, entityType }: { tenantId: string; entityId: string, entityType?: string }): Promise<VaultRecord | null> {
    const result = await this.prisma.vaultRecord.findUnique({
      where: {
        ...(entityType ? { tenantId_entityId_entityType: {
          tenantId,
          entityId,
          entityType,
        } } : {
            tenantId_entityId: {
              tenantId,
              entityId,
            }
          })
      },
    });

    if (!result) {
      return result;
    }

    const decryptedKey = decryptMessage({ message: result.key, key: NESTJS_DMQ__VAULT_SECRET_KEY });

    return {
      ...result,
      key: decryptedKey.message,
    }
  }

   async destroyVaultKeysByEntityId({ tenantId, entityType, entityId }: { tenantId: string; entityId: string, entityType?: string}) {
    return this.prisma.vaultRecord.updateMany({
      where: {
        tenantId,
        entityId,
        entityType,
      },
      data: {
        key: '',
        state: VaultState.deleted,
      }
    });
  }
}
