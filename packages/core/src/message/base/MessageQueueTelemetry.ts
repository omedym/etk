import { ILogger, LogContext, getLogContext } from '../../telemetry';
import { IMessageQueueDefinition } from './MessageQueue';


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
    debug: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext(context, ...optionalParams);
      // _logger.apply('debug', queueContext, message, ...optionalParams);
    },
    error: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext(context, ...optionalParams);
      // _logger.apply('error', queueContext, message, ...optionalParams);
    },
    info: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext(context, ...optionalParams);
      // _logger.apply('info', queueContext, message, ...optionalParams);
    },
    log: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext(context, ...optionalParams);
      // _logger.apply('log', queueContext, message, ...optionalParams);
    },
    warn: (message: string, ...optionalParams: any[]) => {
      const queueContext = getLogContext(context, ...optionalParams);
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
