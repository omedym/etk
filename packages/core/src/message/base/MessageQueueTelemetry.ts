
import { ILogger } from '../../telemetry';
import { IMessageQueueDefinition } from './MessageQueue';


/**
 * @description
 * Builds a specialized Job specific logger that when used logs its messages
 * both to the Job object's log and the configured system logger.
 */
const buildQueueLogger = (
  logger: ILogger,
  metadata: Record<string, string | undefined | null>,
): ILogger => {
  // const _logger = logger as ILogger;

  return {
    debug: (message: any, ...optionalParams: any[]) => {
      // _logger.apply('debug', metadata, message, ...optionalParams);
    },
    info: (message: any, ...optionalParams: any[]) => {
      // _logger.apply('info', metadata, message, ...optionalParams);
    },
    log: (message: any, ...optionalParams: any[]) => {
      // _logger.apply('log', metadata, message, ...optionalParams);
    },
    error: (message: any, ...optionalParams: any[]) => {
      // _logger.apply('error', metadata, message, ...optionalParams);
    },
    warn: (message: any, ...optionalParams: any[]) => {
      // _logger.apply('warn', metadata, message, ...optionalParams);
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
