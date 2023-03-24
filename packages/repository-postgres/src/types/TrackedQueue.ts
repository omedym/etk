import {
  JobState,
  JobDataType,
} from '@omedym/nestjs-dmq-postgres-client';

export interface ITrackedQueueJob<T extends object> {
  tenantId: string;
  queueGroupId: string | null;
  queueId: string;
  jobId: string;
  state: JobState;
  dataType: JobDataType
  dataId: string | null;
  data: T;
  metadata: any | null;
  result: any | null;
  log: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export type FindJobByIdParams = {
  tenantId: string;
  jobId: string;
}

export type TrackJobParams<T extends object = {}> = Omit<ITrackedQueueJob<T>, 'createdAt'|'updatedAt'>;
