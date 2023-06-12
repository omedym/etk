import { ILogger, LogContext } from '../../telemetry';
import { IMessageQueueDefinition } from './MessageQueue';
import { findMessageLogContext } from './MessageTelemetry';


/**
 * @description
 * Builds a specialized Queue specific logger that when used extracts context
 */
const buildQueueLogger = (
  logger: ILogger,
  context: LogContext,
): ILogger => {
  // const _logger = logger as ILogger;

  return {
    debug: (message: any, ...optionalParams: any[]) => {
      const queueContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('debug', queueContext, message, ...optionalParams);
    },
    info: (message: any, ...optionalParams: any[]) => {
      const queueContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('info', queueContext, message, ...optionalParams);
    },
    log: (message: any, ...optionalParams: any[]) => {
      const queueContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('log', queueContext, message, ...optionalParams);
    },
    error: (message: any, ...optionalParams: any[]) => {
      const queueContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('error', queueContext, message, ...optionalParams);
    },
    warn: (message: any, ...optionalParams: any[]) => {
      const queueContext = findMessageLogContext(context, { ...optionalParams });
      // _logger.apply('warn', queueContext, message, ...optionalParams);
    }
  };
};

type MessageQueueTelemetryResult = {
  queueLogger: ILogger;
}

/** Configure Logger and telemetry for a MessageQueue */
export function setMessageQueueTelemetry<
  TDefinition extends IMessageQueueDefinition = IMessageQueueDefinition
>(
  logger: ILogger,
  definition: TDefinition,
): MessageQueueTelemetryResult {

  const tags = {
    queueId: definition.queueId,
    jobEvent: null,
    queue: null,
  }

  // Build the BullMQ integrated job logger
  const queueLogger = buildQueueLogger(logger, {
    ...tags,
  });

  return { queueLogger };
}
