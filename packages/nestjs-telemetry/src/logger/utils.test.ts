import { mockDeep } from 'jest-mock-extended';
import { Writable } from 'stream';
import winston, { Logger } from 'winston';

import { bindRequest, fixedLength, enrichedJsonFormat } from './utils';


describe('utils', () => {
  let output = '';
  const stream = new Writable();
  stream._write = (chunk, encoding, next) => {
    output = output += chunk.toString();
    next();
  };
  const defaultLogger = mockDeep<Logger>({
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
    apply: jest.fn(),
    child: () => defaultLogger,
  } as any);

  const getLogFromStream = (index = 0) => {
    return output.trim().split('\n')[index];
  };

  beforeEach(() => {
    output = '';
  });

  it('should return a string with 4 characters', () => {
    const response = fixedLength('Test String', 4);
    expect(response).toBe('Test');
    expect(response).toHaveLength(4);
  });

  it('should create logger', () => {
    const req = {
      tenantUserId: 'tenantUserId',
    };
    const requestLogger = bindRequest(defaultLogger, req);

    expect(requestLogger).toBeTruthy();
  });

  describe('enrichedJsonFormat', () => {
    const testLogger = winston.createLogger({
      transports: [
        new winston.transports.Stream({
          stream,
          // @ts-ignore
          format: enrichedJsonFormat({
            tenantId: true,
            jobId: true,
            tenantUserId: true,
            portalId: true,
            memberId: true,
          }),
        }),
      ],
    });

    it('should stringify text log message', () => {
      testLogger.error('test error');
      const logMessage = getLogFromStream();

      const dateFromLog = JSON.parse(logMessage).timestamp;
      const logResult = `{"message":\"test error\","level":"error","timestamp":"${dateFromLog}","header":{}}`;
      expect(logMessage).toStrictEqual(logResult);
    });

    it('should stringify object log message', () => {
      testLogger.error({ test: 'test error' });
      const logMessage = getLogFromStream();

      const dateFromLog = JSON.parse(logMessage).timestamp;
      const logResult = `{"message":{"test":"test error"},"level":"error","timestamp":"${dateFromLog}","header":{}}`;
      expect(logMessage).toStrictEqual(logResult);
    });

    it('should populate header', () => {
      testLogger.error('test error', { memberId: '1' });
      const logMessage = getLogFromStream();

      const dateFromLog = JSON.parse(logMessage).timestamp;
      const logResult = `{"level":"error","message":"test error","timestamp":"${dateFromLog}","header":{"memberId":"1"}}`;
      expect(logMessage).toStrictEqual(logResult);
    });

    it('should stringify nested object log message', () => {
      testLogger.error('nested object error', { test: { foo: 'bar', bar: { bar: 'foo' } } });
      const logMessage = getLogFromStream();

      const dateFromLog = JSON.parse(logMessage).timestamp;
      const logResult = `{"test":{"foo":"bar","bar":{"bar":"foo"}},"level":"error","message":"nested object error","timestamp":"${dateFromLog}","header":{}}`;
      expect(logMessage).toStrictEqual(logResult);
    });

    it('should stringify error', () => {
      testLogger.error('test error', { memberId: '1', error: new Error('error message') });
      const logMessage = getLogFromStream();

      const logData = JSON.parse(logMessage);
      expect(logData).toHaveProperty('level', 'error');
      expect(logData).toHaveProperty('error');
      expect(logData).toHaveProperty('error.name', 'Error');
      expect(logData).toHaveProperty('error.message', 'error message');
      expect(logData).toHaveProperty('error.stack');
      expect(logData).toHaveProperty('message', 'test error');
    });

    it('should stringify nested error', () => {
      testLogger.error('test error', { memberId: '1', foo: { error: new Error('error message') } });
      const logMessage = getLogFromStream();

      const logData = JSON.parse(logMessage);
      expect(logData).toHaveProperty('level', 'error');
      expect(logData).toHaveProperty('foo.error');
      expect(logData).toHaveProperty('foo.error.name', 'Error');
      expect(logData).toHaveProperty('foo.error.message', 'error message');
      expect(logData).toHaveProperty('foo.error.stack');
      expect(logData).toHaveProperty('message', 'test error');
    });

    it('should process error as a second argument', () => {
      testLogger.error('test error', new Error('error message'));
      const logMessage = getLogFromStream();

      const logData = JSON.parse(logMessage);
      expect(logData).toHaveProperty('level', 'error');
      expect(logData).toHaveProperty('level', 'error');
      expect(logData).toHaveProperty('stack');
      expect(logData).toHaveProperty('message', 'test error error message');
    });

    it('should stringify custom error type', () => {
      class CustomError extends Error {
        constructor(msg: string) {
          super();
          this.message = msg;
          this.name = this.constructor.name;
        }
      }
      testLogger.error('test error', { memberId: '1', error: new CustomError('error message') });
      const logMessage = getLogFromStream();

      const logData = JSON.parse(logMessage);
      expect(logData).toHaveProperty('level', 'error');
      expect(logData).toHaveProperty('error');
      expect(logData).toHaveProperty('error.name', 'CustomError');
      expect(logData).toHaveProperty('error.message', 'error message');
      expect(logData).toHaveProperty('error.stack');
      expect(logData).toHaveProperty('message', 'test error');
    });
  });
});
