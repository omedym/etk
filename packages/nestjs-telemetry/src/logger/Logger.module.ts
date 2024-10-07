import { DynamicModule, Module } from '@nestjs/common';
import { NestjsLogger } from './NestjsLogger';
import winston from 'winston';
import { alignedWithColorsAndTime, enrichedJsonFormat } from './utils';
import { LOGGER_CONFIG, LOGGER_PROVIDER } from './logger.constants';
import { LoggerConfiguration } from './types';

const getLoggerProvider = ({ logLevel, filename, contextAttributes }: LoggerConfiguration) => ({
  provide: LOGGER_PROVIDER,
  useFactory: () => {
    return winston.createLogger({
      transports: [
        new winston.transports.File({
          // @ts-ignore
          level: logLevel,
          format: enrichedJsonFormat(contextAttributes),
          filename,
        }),
        new winston.transports.Console({
          // @ts-ignore
          level: logLevel,
          format: alignedWithColorsAndTime,
        }),
      ],
    });
  },
});

@Module({})
export class NestjsLoggingModule {
  static forRoot(config: LoggerConfiguration): DynamicModule {
    const loggerProvider = getLoggerProvider(config);
    const loggerConfigProvider = {
      provide: LOGGER_CONFIG,
      useValue: config,
    };

    return {
      providers: [NestjsLogger, loggerProvider, loggerConfigProvider],
      exports: [NestjsLogger, loggerProvider, loggerConfigProvider],
      module: NestjsLoggingModule,
    };
  }
}
