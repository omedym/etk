import { LoggerService } from '@nestjs/common';

// Check to see if this object is a CloudEvent or other message type
const isCloudEventMessageType = (paramKeys: Array<string>): boolean => {
  return paramKeys.includes('data') && paramKeys.includes('specversion');
};

export type LogContextKey =
  | 'jobId'
  | 'messageId'
  | 'messageType'
  | 'queueId'
  | 'tenantId'
;

export type LogContext = Partial<Record<LogContextKey, string>>;

// execute the function and use the returned value to populate the log context attribute
type GetContextValueByContext = (
  context?: LogContext,
  metadata?: Record<string, unknown>,
) => LogContext;

export type ContextAttributesToCheck =
  | Record<LogContextKey, true>
  | Record<string, GetContextValueByContext>;

export const contextAttributes: ContextAttributesToCheck = {
  jobId: true,
  messageId: true,
  messageType: true,
  queueId: true,
  tenantId: true,
};

export const cloudEventContextAttributes: ContextAttributesToCheck = {
  id: (context, metadata) => {
    if (!context || !metadata) {
      return {};
    }

    if (isCloudEventMessageType(Object.keys(metadata)) && metadata.id) {
      return { messageId: metadata.id as string };
    }

    return {};
  },
  tenantid: (context, metadata) => {
    if (!context || !metadata) {
      return {};
    }

    if (isCloudEventMessageType(Object.keys(metadata)) && !context.tenantId && metadata.tenantid) {
      return { tenantId: metadata.tenantid as string };
    }
    return {};
  },
  type: (context, metadata) => {
    if (!context || !metadata) {
      return {};
    }

    if (isCloudEventMessageType(Object.keys(metadata)) && metadata.type) {
      return { messageType: metadata.type as string };
    }

    return {};
  },
};

export type LogLevel = 'debug' | 'error' | 'info' | 'log' | 'verbose' | 'warn';

export interface ILogger extends LoggerService {
  /**
   * Write a 'debug' level log.
   */
  debug(message: any, ...optionalParams: any[]): any;

  /**
   * Write an 'info' level log.
   */
  info(message: any, ...optionalParams: any[]): void;

  /**
   * @deprecated
   * Write a 'log' level log. This is ambiguous so avoid using, this redirects as a 'debug' level log.
   */
  log(message: any, ...optionalParams: any[]): void;
}
