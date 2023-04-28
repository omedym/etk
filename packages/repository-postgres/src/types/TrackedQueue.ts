import { DateTime } from 'luxon';
import {
  JobEvent,
  JobState,
  JobDataType,
} from '@omedym/nestjs-dmq-postgres-client';

export interface ITrackedQueueJob<T extends object = {}> {
  tenantId: string;
  queueGroupId: string | null;
  queueId: string;
  jobId: string;
  state: JobState;
  dataType: JobDataType
  dataId?: string;
  data: T;
  metadata?: any;
  result?: any;
  log: string[];
  createdAt: Date;
  updatedAt: Date;

  events?: ITrackedQueueJobEvent<T>[];
}

export interface ITrackedQueueJobEvent<T extends object = {}> {
  tenantId: string;
  jobId: string;
  jobEventId: string;
  event: JobEvent;
  state: JobState;
  statePrev: JobState;
  metadata?: object;
  log: string[];
  createdAt: Date;

  job?: ITrackedQueueJob<T>;
}

export type FindJobByIdParams = {
  tenantId: string;
  jobId: string;
}

export type CreateTrackedJobParams<T extends object = {}> =
  Omit<ITrackedQueueJob<T>, 'createdAt' | 'jobId' | 'log' | 'updatedAt' | 'events'> & {
    jobId?: string,
    createdAt?: DateTime,
    event?: JobEvent,
  }

export type UpdateTrackedJobParams<T extends object = {}> =
  Omit<ITrackedQueueJobEvent<T>, 'createdAt' | 'jobEventId' | 'job' | 'log'> & {
    jobEventId?: string,
    createdAt?: DateTime,
    log?: string[],
  }
