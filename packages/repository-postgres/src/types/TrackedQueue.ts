import {
  JobState,
  JobDataType,
  TrackedQueueJob,
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
  log?: any;
  createdAt: Date;
  updatedAt: Date;

  events?: ITrackedQueueJobEvent<T>[];
}

export interface ITrackedQueueJobEvent<T extends object = {}> {
  tenantId: string;
  jobId: string;
  jobEventId: string;
  state: JobState;
  event?: object;
  createdAt: Date;

  job?: ITrackedQueueJob<T>;
}

export type FindJobByIdParams = {
  tenantId: string;
  jobId: string;
}

export type TrackJobParams<T extends object = {}> =
  Omit<ITrackedQueueJob<T>, 'createdAt' | 'updatedAt' | 'events'>;
