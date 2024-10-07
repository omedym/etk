import { LoggerService } from '@nestjs/common';

export interface LoggerConfiguration {
  logLevel: LogLevel;
  filename: string;
  contextAttributes: ContextAttributes;
  /**
   * Define one or more callers to automatically skip when determining the caller
   * to attribute the log entry to. This uses a string.include() type match.
   *
   * @default
   *  [
   *    'NestjsLogger.',
   *    'Object.debug',
   *    'Object.error',
   *    'Object.info',
   *    'Object.log',
   *    'Object.verbose',
   *    'Object.warn',
   *  ]
   */
  callersToSkip?: string[];
  /*
   * Full github project URL
   * Used to set the caller reference for error logs
   */
  projectRepositoryUrl?: string;
}

type BaseContextAttributes = Record<string, true>;
type LogContext = Partial<Record<keyof BaseContextAttributes, string>>;
type GetContextValueByContext = (context?: LogContext, metadata?: Record<string, unknown>) => LogContext;
export type ContextAttributes = BaseContextAttributes | Record<string, GetContextValueByContext>;

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
