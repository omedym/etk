import * as Sentry from '@sentry/node';
import { ScopeData } from '@sentry/types';
import { Job } from 'bullmq';
import { DateTime } from 'luxon';
import stableStringify from 'safe-stable-stringify';

import { ILogger, ContextAttributes, NestjsLogger, getLogContext } from '@omedym/nestjs-telemetry';

import { IMessage, IUnknownMessage } from '../message';
import { IMessageHandlerContext } from './TrackedQueueProcessor';
import { TrackedJobEventContext, TrackedJobEventData } from './TrackedJobEventData.type';


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
const buildJobLogger = <Attributes extends ContextAttributes>(logger: ILogger, job: Job, context: Partial<Record<keyof Attributes, string>>): ILogger => {
  const timestamp = DateTime.now().toISO();

  const _logger = logger as NestjsLogger;

  return {
    debug: (message: any, ...optionalParams: any[]) => {
      const jobContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('debug', jobContext, message, ...optionalParams);
      job.log(`${timestamp} debug ${message}`);
    },
    error: (message: any, ...optionalParams: any[]) => {
      const jobContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('error', jobContext, message, ...optionalParams);
      job.log(`${timestamp} error ${message}`);
    },
    info: (message: any, ...optionalParams: any[]): void => {
      const jobContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('info', jobContext, message, ...optionalParams);
      job.log(`${timestamp} info  ${message}`);
    },
    log: (message: any, ...optionalParams: any[]): void => {
      const jobContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('log', jobContext, message, ...optionalParams);
      job.log(`${timestamp} debug ${message}`);
    },
    warn: (message: any, ...optionalParams: any[]) => {
      const jobContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('warn', jobContext, message, ...optionalParams);
      job.log(`${timestamp} warn  ${message}`);
    },
  };
};

type JobTelemetry = {
  jobEventId: string | undefined;
  jobEventType: string;
  jobId: string;
  queueId: string;
  tenantId: string | undefined;
};

type MessageTelemetry = {
  tenantId: string;
  messageId: string;
};

type TrackedJobTelemetryResult = {
  jobLogger: ILogger;
};

/** Configure Logger and Sentry telemetry for a Job and Message */
export function setTrackedJobTelemetry<T extends IMessage | IUnknownMessage>(
  logger: ILogger,
  context: IMessageHandlerContext<T>,
): TrackedJobTelemetryResult {
  const { job, message, messageDefinition, messageQueueDefinition } = context;
  const currentTx: ScopeData | undefined = Sentry.getCurrentScope().getScopeData();

  const sentryTags = {
    jobId: job.id,
    messageId: message.id,
    messageType: message.type,
    queueId: QueueSuffix ? job.queueName?.replace(QueueSuffix, '') : job.queueName,

    tenantId: message.tenantid === message?.context?.tenantId ? message?.context?.tenantId : '!!',

    jobEventId: null,
    jobEventType: null,

    jobEvent: null,
    queue: null,
  };

  const contextObj = {
    job: { ...job, data: null, queue: null, scripts: null, returnValue: null },
    message,
  };
  const sentryContext = JSON.parse(stableStringify(contextObj, null, 2));

  // Enrich the Sentry scope
  Sentry.setTags(sentryTags);
  Sentry.setContext('Tracked Job Event', null);
  Sentry.setContext('Tracked Job', sentryContext);

  const logContext = {
    ...(sentryTags as any),
    traceId: currentTx?.contexts?.trace?.trace_id,
  };

  // Build the BullMQ integrated job logger
  const jobLogger = buildJobLogger(logger, job, logContext);

  return { jobLogger };
}

/** Configure Logger and Sentry telemetry for a TrackedJobEvent */
export function setTrackedJobEventTelemetry(
  logger: ILogger,
  context: { job: Job<TrackedJobEventData>; message: TrackedJobEventContext; token?: string },
): TrackedJobTelemetryResult {
  const { job, message } = context;
  const currentTx: ScopeData | undefined = Sentry.getCurrentScope().getScopeData();

  const sentryTags = {
    jobEventId: message.jobEventId,
    jobEventType: message.jobEventType,
    jobId: message.jobId,
    queueId: QueueSuffix ? message.queueId.replace(QueueSuffix, '') : message.queueId,
    tenantId: message.tenantId,

    messageId: null,
    messageType: null,

    jobEvent: null,
    queue: null,
  };

  const contextObj = {
    job: { ...job, data: null, queue: null, scripts: null, returnValue: null },
    message,
  };
  const sentryContext = JSON.parse(stableStringify(contextObj, null, 2));

  const logContext = {
    ...(sentryTags as any),
    traceId: currentTx?.contexts?.trace?.trace_id,
  };

  // Enrich the Sentry scope
  Sentry.setTags(sentryTags);
  Sentry.setContext('Tracked Job', null);
  Sentry.setContext('Tracked Job Event', sentryContext);

  // Build the BullMQ integrated job logger
  const jobLogger = buildJobLogger(logger, job, logContext);

  return { jobLogger };
}
