import { Inject, Injectable, LoggerService, Optional } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Scope } from '@sentry/types';
import { Logger } from 'winston';
import { ClsService } from 'nestjs-cls';
import { getLogContext } from './LogContext';
import { LOGGER_CONFIG, LOGGER_PROVIDER } from './logger.constants';
import { ContextAttributes, LogLevel, LoggerConfiguration } from './types';

@Injectable()
export class NestjsLogger implements LoggerService {
  protected requestLogger: Logger;
  readonly callersToSkip: string[];
  readonly contextAttributes: ContextAttributes;

  constructor(
    @Inject(LOGGER_PROVIDER) readonly logger: Logger,
    @Inject(LOGGER_CONFIG) readonly config: LoggerConfiguration,
    /* The Parent module must have a global ClsModule registration
     */
    @Optional() readonly asyncLocalStorage?: ClsService<Record<keyof ContextAttributes, string>>,
  ) {
    this.callersToSkip = config?.callersToSkip || [];
    this.contextAttributes = config?.contextAttributes;

    this.requestLogger = this.logger.child({});
  }

  close() {
    this.requestLogger.close();
  }

  get context(): Partial<Record<keyof typeof this.contextAttributes, string>> {
    return this.asyncLocalStorage?.get() || {};
  }

  apply(
    logLevel: LogLevel,
    context: Partial<Record<keyof typeof this.contextAttributes, string>>,
    message: any,
    ...optionalParams: any[]
  ): void {
    const getStackTrace = (): string[] => {
      const stackTrace = new Error().stack;
      const callerLines = stackTrace ? stackTrace.split('\n') : [];

      return callerLines;
    };

    const getCaller = (stackTrace: string[], callerDepth: number = 1): string | undefined => {
      if (callerDepth < 1) return;
      if (stackTrace.length < callerDepth + 1) return;

      const callerLine = stackTrace[callerDepth];

      // Check if this is a caller we should skip, if so go to the next callerLine
      if (this.callersToSkip.some((callerToSkip) => callerLine.includes(callerToSkip)))
        return getCaller(stackTrace, callerDepth + 1);

      // Determine the file name
      // console.debug(`callerLine: ${callerLine}`);
      let file = '';
      const hasGitHubLink = callerLine.includes('https://github.com');
      if (logLevel === 'error' || logLevel === 'warn') {
        if (hasGitHubLink) {
          const [_a, line, ...rest] = callerLine.split(':').reverse();
          const [_b, part] = callerLine.split('/blob/');
          if (!part) return;
          const path = part.split(':')[0];
          file = `${this.config.projectRepositoryUrl}/blob/${path}#L${line}`;
        } else {
          // TODO
          const parts = callerLine.split(':').reverse();
          if (parts.length < 3) file = 'unknown';
          else file = parts[2].split('/').reverse()[0];
        }
      } else {
        // default behavior
        const parts = callerLine.split(':').reverse();
        if (parts.length < 3) file = 'unknown';
        else file = parts[2].split('/').reverse()[0];
      }

      // Determine the method name
      // Note, when the method is a nested lambda function using the following string logic ends
      // up with a method name of 'sh'.
      let method: string | undefined = callerLine.split('at ')[1]?.split('.')[1]?.split(' ')[0];

      // Check if the method is a nested lambda function and handle sourcing its name
      if (method === 'sh') {
        // Get the parent method
        const parentCaller = getCaller(stackTrace, callerDepth + 1);
        const parentMethod = parentCaller?.split('.')[1];

        // console.debug(`callerLine[${callerDepth}]: ${file}.${method} -> ${callerLine}`);

        const isMethodCall = callerLine.endsWith(')');
        const nestedMethod = callerLine?.split('at ')[1]?.split(' (')[0];

        method = isMethodCall ? `${parentMethod}.${nestedMethod}` : undefined;
      }

      let caller = method && !hasGitHubLink ? `${file}::${method}` : `${file}`;

      if (logLevel == 'error') caller = file ?? method;

      // if (!file || !method || method === '<anonymous>' || method === 'sh')
      //   console.debug(`callerLine[${callerDepth}]: ${caller} -> ${callerLine}`);

      return caller;
    };

    try {
      const stackTrace = getStackTrace();
      let caller = getCaller(stackTrace);

      // Default NestjsLogger invocation
      if (caller?.startsWith('logger.service') && optionalParams.length > 0) caller = optionalParams.shift() as string;

      const argArray = [
        message,
        {
          caller,
          ...context,
          meta: [...optionalParams],
        },
      ];

      switch (logLevel) {
        case 'debug':
        case 'log':
          // @ts-ignore
          this.requestLogger.debug.apply(this.requestLogger, argArray);
          break;
        case 'error':
          this.captureException(message, optionalParams, context as any);
          // @ts-ignore
          this.requestLogger.error.apply(this.requestLogger, argArray);
          break;
        case 'info':
          // @ts-ignore
          this.requestLogger.info.apply(this.requestLogger, argArray);
          break;
        case 'verbose':
          // @ts-ignore
          this.requestLogger.verbose.apply(this.requestLogger, argArray);
          break;
        case 'warn':
          this.captureWarning(message, optionalParams, context as any);
          // @ts-ignore
          this.requestLogger.warn.apply(this.requestLogger, argArray);
          break;
        default:
          // @ts-ignore
          console.error(`Unable to apply logLevel: ${logLevel}`, argArray);
          break;
      }
    } catch (e) {
      console.error(e);
      this.captureException(message, optionalParams);
    }
  }

  private captureException(message: string, optionalParams: any[], context?: Record<string, string>) {
    try {
      // This is how we used to from the Exception:
      //   type ExceptionForSentry = { exception: any; hint?: EventHint; }
      //   const toSentry: ExceptionForSentry = {
      //     exception: optionalParams[0]?.error || message,
      //     hint: {...optionalParams[0], context },
      //   };

      // Set the scope tags and context
      const scope = (scope: Scope) => {
        scope.setLevel('error'), scope.setTags({ ...context });
        scope.setContext('Error Insights', { ...optionalParams });
        return scope;
      };

      // Find the error object(s)
      const error: Error[] = optionalParams.filter((p) => p instanceof Error);

      // Forward the exception error(s) to Sentry
      error.length > 0
        ? error.map((e) => Sentry.captureException(e, scope))
        : Sentry.captureException(new Error(message), scope);
    } catch (e) {
      console.error(`NestjsLogger Sentry.captureException failure`, e);
    }
  }

  private captureWarning(message: string, optionalParams: any[], context?: Record<string, string>) {
    try {
      // Set the scope tags and context
      const scope = (scope: Scope) => {
        scope.setLevel('warning'), scope.setTags({ ...context });
        scope.setContext('Warning Insights', { ...optionalParams });
        return scope;
      };

      Sentry.captureMessage(message, scope);
    } catch (e) {
      console.error(`NestJsLogger Sentry.captureMessage failure`, e);
    }
  }

  debug(message: string, ...optionalParams: any[]) {
    const logContext = getLogContext({
      parentContext: this.context,
      metadata: [...optionalParams],
      attributes: this.contextAttributes,
    });
    this.apply('debug', logContext, message, ...optionalParams);
  }

  error(message: string, ...optionalParams: any[]) {
    const logContext = getLogContext({
      parentContext: this.context,
      metadata: [...optionalParams],
      attributes: this.contextAttributes,
    });
    this.apply('error', logContext, message, ...optionalParams);
  }

  info(message: string, ...optionalParams: any[]) {
    const logContext = getLogContext({
      parentContext: this.context,
      metadata: [...optionalParams],
      attributes: this.contextAttributes,
    });
    this.apply('info', logContext, message, ...optionalParams);
  }

  /**
   * @deprecated. For local development only. Use debug instead
   */
  log(message: string, ...optionalParams: any[]) {
    const logContext = getLogContext({
      parentContext: this.context,
      metadata: [...optionalParams],
      attributes: this.contextAttributes,
    });
    this.apply('log', logContext, message, ...optionalParams);
  }

  warn(message: string, ...optionalParams: any[]) {
    const logContext = getLogContext({
      parentContext: this.context,
      metadata: [...optionalParams],
      attributes: this.contextAttributes,
    });
    this.apply('warn', logContext, message, ...optionalParams);
  }

  verbose(message: string, ...optionalParams: any[]) {
    const logContext = getLogContext({
      parentContext: this.context,
      metadata: [...optionalParams],
      attributes: this.contextAttributes,
    });
    this.apply('verbose', logContext, message, ...optionalParams);
  }
}
