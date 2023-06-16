import { Job } from 'bullmq';
import { DateTime } from 'luxon';

import { ILogger, LogContext } from '../telemetry';
import { IMessage, IUnknownMessage } from '../message';
import { IMessageHandlerContext } from './TrackedQueueProcessor';
import { TrackedJobEventContext, TrackedJobEventData } from './TrackedJobEventData.type';
import { findMessageLogContext } from '../message/base/MessageTelemetry';


const {
  NESTJS_DMQ__QUEUE_SUFFIX = '',
} = process.env;

export const QueueSuffix = NESTJS_DMQ__QUEUE_SUFFIX ? `-${NESTJS_DMQ__QUEUE_SUFFIX}` : undefined;

export const DefaultClearContext = ['Tracked Job', 'Tracked Job Event'];

/**
 * @description
 * Builds a specialized Job specific logger that when used logs its messages
 * both to the Job object's log and the configured system logger.
 */
const buildJobLogger = (
  logger: ILogger,
  job: Job,
  context: LogContext,
): ILogger => {
  const timestamp = DateTime.now().toISO();

  // const _logger = logger as ILogger;

  return {
    debug: (message: any, ...optionalParams: any[]) => {
      const jobContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('debug', jobContext, message, ...optionalParams);
      job.log(`${timestamp} debug ${message}`);
    },
    info: (message: any, ...optionalParams: any[]): void => {
      const jobContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('info', jobContext, message, ...optionalParams);
      job.log(`${timestamp} info  ${message}`);
    },
    log: (message: any, ...optionalParams: any[]): void => {
      const jobContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('log', jobContext, message, ...optionalParams);
      job.log(`${timestamp} debug ${message}`);
    },
    error: (message: any, ...optionalParams: any[]) => {
      const jobContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('error', jobContext, message, ...optionalParams);
      job.log(`${timestamp} error ${message}`);
    },
    warn: (message: any, ...optionalParams: any[]) => {
      const jobContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('warn', jobContext, message, ...optionalParams);
      job.log(`${timestamp} warn  ${message}`);
    }
  };
};

type JobTelemetry = {
  jobEventId: string | undefined;
  jobEventType: string;
  jobId: string;
  queueId: string;
  tenantId: string | undefined;
}

type MessageTelemetry = {
  tenantId: string;
  messageId: string;
}

type TrackedJobTelemetryResult = {
  jobLogger: ILogger;
}

/** Configure Logger telemetry for a Job and Message */
export function setTrackedJobTelemetry<T extends IMessage | IUnknownMessage>(
  logger: ILogger,
  context: IMessageHandlerContext<T>,
): TrackedJobTelemetryResult {

  const { job, message, messageDefinition, messageQueueDefinition } = context;

  const tags = {
    jobId: job.id,
    messageId: message.id,
    messageType: message.type,
    queueId: QueueSuffix ? job.queueName.replace(QueueSuffix, '') : job.queueName,

    tenantId: message.tenantid === message?.context?.tenantId ? message?.context?.tenantId : '!!',

    jobEventId: null,
    jobEventType: null,

    jobEvent: null,
    queue: null,
  }

  const logContext: LogContext = {
    ...tags as any,
  };

  // Build the BullMQ integrated job logger
  const jobLogger = buildJobLogger(logger, job, logContext);

  return { jobLogger };
}

/** Configure Logger telemetry for a TrackedJobEvent */
export function setTrackedJobEventTelemetry(
  logger: ILogger,
  context: { job: Job<TrackedJobEventData>; message: TrackedJobEventContext, token?: string; },
): TrackedJobTelemetryResult {

  const { job, message } = context;

  const tags = {
    jobEventId: message.jobEventId,
    jobEventType: message.jobEventType,
    jobId: message.jobId,
    queueId: QueueSuffix ? message.queueId.replace(QueueSuffix, '') : message.queueId,
    tenantId: message.tenantId,

    messageId: null,
    messageType: null,

    jobEvent: null,
    queue: null,
  }

  const logContext: LogContext = {
    ...tags as any,
  };

  // Build the BullMQ integrated job logger
  const jobLogger = buildJobLogger(logger, job, logContext);

  return { jobLogger };
}
