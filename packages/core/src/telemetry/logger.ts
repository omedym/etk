import { LoggerService } from '@nestjs/common';

export type LogLevel =
  | 'debug'
  | 'error'
  | 'info'
  | 'log'
  | 'verbose'
  | 'warn'
;

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
