import { Test, TestingModule } from '@nestjs/testing';
import { AsyncLocalStorage } from 'async_hooks';
import { mockDeep } from 'jest-mock-extended';
import { ClsService } from 'nestjs-cls';
import { Logger } from 'winston';

import { LOGGER_CONFIG, LOGGER_PROVIDER } from './logger.constants';
import { NestjsLogger } from './NestjsLogger';
import { LoggerConfiguration } from './types';


export const mockedNestjsLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  matchFilePartRegEx: jest.fn(),
  requestLogger: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
} as unknown as NestjsLogger;

describe('Logger', () => {
  let logger: NestjsLogger;
  const defaultLogger = mockDeep<Logger>({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    apply: jest.fn(),
    child: () => defaultLogger,
  } as any);
  const config: LoggerConfiguration = {
    logLevel: 'log',
    filename: '',
    contextAttributes: {
      tenantId: true,
      jobId: true,
      tenantUserId: true,
      portalId: true,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestjsLogger,
        {
          provide: LOGGER_PROVIDER,
          useValue: defaultLogger,
        },
        {
          provide: LOGGER_CONFIG,
          useValue: config,
        },
      ],
    }).compile();

    logger = await module.resolve<NestjsLogger>(NestjsLogger);
  });

  it('should apply', () => {
    expect(
      logger.apply(
        'debug',
        {
          jobId: 'jobId',
          tenantId: 'tenantId',
          tenantUserId: 'tenantUserId',
        },
        'message',
      ),
    ).toBeUndefined();
  });

  it('should log info', () => {
    expect(logger.info('log', { test: 'test' })).toBeUndefined();
  });

  it('should log debug', () => {
    expect(logger.debug('log', { test: 'test' })).toBeUndefined();
  });

  it('should log error', () => {
    expect(logger.error('error', { test: 'test' })).toBeUndefined();
  });

  it('should log warn', () => {
    expect(logger.warn('warn', { test: 'test' })).toBeUndefined();
  });

  it('should log verbose', () => {
    expect(logger.verbose('verbose', { test: 'test' })).toBeUndefined();
  });

  it('should log log', () => {
    expect(logger.log('log', { test: 'test' })).toBeUndefined();
  });

  it('should log context', () => {
    const spy = jest.spyOn(logger, 'apply');
    const context = { tenantId: 'tenantId-1' };

    logger.error('error', context);

    expect(spy).toHaveBeenCalledWith('error', context, 'error', context);
  });

  it('should log context, without non context fields', () => {
    const spy = jest.spyOn(logger, 'apply');
    const context = { tenantId: 'tenantId-1' };

    logger.error('error-msg', { ...context, foo: 'bar' });

    expect(spy).toHaveBeenCalledWith('error', context, 'error-msg', { ...context, foo: 'bar' });
  });

  it('should log context, get tenantId from AsyncLocalStorage', () => {
    const globalContext = { portalId: 'portalId-1' };
    const localStorage = new AsyncLocalStorage();
    const localStorageService = new ClsService<any>(localStorage);

    localStorage.run(globalContext, () => {
      logger = new NestjsLogger(defaultLogger, config, localStorageService);

      const spy = jest.spyOn(logger, 'apply');
      const context = { tenantId: 'tenantId-1' };

      logger.error('error-msg', { ...context, foo: 'bar' });
      logger.error('error-2');

      expect(spy).toHaveBeenNthCalledWith(1, 'error', { ...context, ...globalContext }, 'error-msg', {
        ...context,
        foo: 'bar',
      });
      expect(spy).toHaveBeenNthCalledWith(2, 'error', globalContext, 'error-2');
    });
  });

  it('should close logger', () => {
    const spy = jest.spyOn(logger, 'close');

    logger.close();

    expect(spy).toHaveBeenCalled();
  });

  it('should captureException', () => {
    const result = logger['captureException']('message', [Error('error')]);

    expect(result).toBeUndefined();
  });
  it('should captureException with zero optionalParams', () => {
    const result = logger['captureException']('message', []);

    expect(result).toBeUndefined();
  });

  it('should captureWarning', () => {
    const result = logger['captureWarning']('message', [Error('error')]);

    expect(result).toBeUndefined();
  });
});
