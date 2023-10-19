import {
  cloudEventContextAttributes,
  contextAttributes,
  getLogContext,
  ILogger,
  LogContext,
} from '../../telemetry';
import { IMessageQueueDefinition } from './MessageQueue';


const attributes = { ...contextAttributes, ...cloudEventContextAttributes };
/**
 * @description
 * Builds a specialized Queue specific logger that when used extracts context
 */
  // const _logger = logger as ILogger;
const buildQueueLogger = (logger: ILogger, context: LogContext): ILogger => {

  return {
    debug: (message: string, ...optionalParams: any[]) => {
      // const queueContext = getLogContext({
      //   parentContext: context,
      //   metadata: [...optionalParams],
      //   attributes,
      // });
      // _logger.apply('debug', queueContext, message, ...optionalParams);
    },
    error: (message: string, ...optionalParams: any[]) => {
      // const queueContext = getLogContext({
      //   parentContext: context,
      //   metadata: [...optionalParams],
      //   attributes,
      // });
      // _logger.apply('error', queueContext, message, ...optionalParams);
    },
    info: (message: string, ...optionalParams: any[]) => {
      // const queueContext = getLogContext({
      //   parentContext: context,
      //   metadata: [...optionalParams],
      //   attributes,
      // });
      // _logger.apply('info', queueContext, message, ...optionalParams);
    },
    log: (message: string, ...optionalParams: any[]) => {
      // const queueContext = getLogContext({
      //   parentContext: context,
      //   metadata: [...optionalParams],
      //   attributes,
      // });
      // _logger.apply('log', queueContext, message, ...optionalParams);
    },
    warn: (message: string, ...optionalParams: any[]) => {
      // const queueContext = getLogContext({
      //   parentContext: context,
      //   metadata: [...optionalParams],
      //   attributes,
      // });
      // _logger.apply('warn', queueContext, message, ...optionalParams);
    },
  };
};

type MessageQueueTelemetryResult = {
  queueLogger: ILogger;
};

/** Configure Logger and telemetry for a MessageQueue */
export function setMessageQueueTelemetry<
  TDefinition extends IMessageQueueDefinition = IMessageQueueDefinition,
>(logger: ILogger, definition: TDefinition): MessageQueueTelemetryResult {

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
