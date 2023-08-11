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
import { decryptMessage, encryptMessage } from './utils';

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
    const encryptedKey = encryptMessage({ message: data.key, key: NESTJS_DMQ__VAULT_SECRET_KEY });

    const result = await this.prisma.vault.create({
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

  async findVaultById({ tenantId, vaultId }: { tenantId: string; vaultId: string }): Promise<Vault | null> {
    const result = await this.prisma.vault.findUnique({
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

  async findVaultByEntityId({ tenantId, entityId, entityType }: { tenantId: string; entityId: string, entityType?: string }): Promise<Vault | null> {
    const result = await this.prisma.vault.findUnique({
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

   async destroyKeysByEntityId({ tenantId, entityType, entityId }: { tenantId: string; entityId: string, entityType?: string}) {
    return this.prisma.vault.updateMany({
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
