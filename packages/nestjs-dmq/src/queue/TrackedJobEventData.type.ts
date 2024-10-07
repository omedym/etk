import { DateTime } from 'luxon';

import { JobState } from '@omedym/nestjs-dmq-repository';

import { IMessage, IUnknownMessage } from '../message';

export type TrackedJobEventContext = {
  jobEventId: string | undefined;
  jobEventType: string;
  jobId: string;
  queueId: string;
  tenantId: string | undefined;
}

export type TrackedJobEventData = TrackedJobEventDataFull | TrackedJobEventDataCompact;

export type TrackedJobEventDataFull = {
  queueId: string;
  tenantId: string;
  jobId: string;
  data: IMessage | IUnknownMessage;
  state: JobState,
  statePrev: JobState;
  metadata: {
    attemptsMade?: number;
    delay?: number;
    failedReason?: string;
    progress?: number | object;
    runAt?: string;
    receivedAt?: string;
    stackTrace?: string[];
  },
  createdAt?: DateTime;
  updatedAt?: DateTime;
}

export type TrackedJobEventDataCompact = {
  queueId: string;
  jobId: string;
  metadata: {
    delay?: number;
    failedReason?: string;
    runAt?: string;
  },
  createdAt?: DateTime;
  updatedAt?: DateTime;
}
