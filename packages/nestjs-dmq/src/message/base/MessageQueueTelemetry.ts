import * as Sentry from '@sentry/node';
import { ScopeData } from '@sentry/types';

import { ILogger, ContextAttributes, NestjsLogger, getLogContext } from '@omedym/nestjs-telemetry';

import { IMessageQueueDefinition } from './MessageQueue';

/**
 * @description
 * Builds a specialized Queue specific logger that when used extracts context
 */
const buildQueueLogger = <Attributes extends ContextAttributes>(logger: ILogger, context: Partial<Record<keyof Attributes, string>>): ILogger => {
  const _logger = logger as NestjsLogger;

  return {
    debug: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('debug', queueContext, message, ...optionalParams);
    },
    error: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('error', queueContext, message, ...optionalParams);
    },
    info: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('info', queueContext, message, ...optionalParams);
    },
    log: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('log', queueContext, message, ...optionalParams);
    },
    warn: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext({
        parentContext: context,
        metadata: [...optionalParams],
        attributes: _logger.contextAttributes,
      });
      _logger.apply('warn', queueContext, message, ...optionalParams);
    },
  };
};

type MessageQueueTelemetryResult = {
  queueLogger: ILogger;
};

/** Configure Logger and Sentry telemetry for a MessageQueue */
export function setMessageQueueTelemetry<
  TDefinition extends IMessageQueueDefinition = IMessageQueueDefinition,
>(logger: ILogger, definition: TDefinition): MessageQueueTelemetryResult {
  const currentTx: ScopeData | undefined = Sentry.getCurrentScope().getScopeData();

  const sentryTags = {
    queueId: definition.queueId,
    jobEvent: undefined,
    queue: undefined,
  };

  // Enrich the Sentry scope
  Sentry.setTags(sentryTags);

  // Build the BullMQ integrated job logger
  const queueLogger = buildQueueLogger(logger, {
    ...sentryTags,
    traceId: currentTx?.contexts?.trace?.trace_id,
  });

  return { queueLogger };
}
