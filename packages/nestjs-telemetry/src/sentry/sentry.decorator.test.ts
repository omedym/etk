import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { NestjsLogger } from '../logger';
import { SentryTransaction } from './sentry.decorator';
import { mockedNestjsLogger } from '../logger/NestjsLogger.test';

jest.mock('@sentry/node', () => {
  const original = jest.requireActual('@sentry/node');

  return {
    ...original,
  };
});

describe('Statsig Decorators', () => {
  describe('SentryTransaction Decorator Tests', () => {
    @Injectable()
    class TestService {
      constructor() {}
      @SentryTransaction({
        op: 'process',
        startNewTrace: true,
        clearContextFor: ['Tracked Job', 'Tracked Job Event'],
      })
      async testMethod(data: any) {}

      @SentryTransaction({
        op: 'fail',
        startNewTrace: true,
        clearContextFor: ['Tracked Job', 'Tracked Job Event'],
      })
      async failMethod(data: any) {}

      @SentryTransaction({
        op: 'process',
        startNewTrace: true,
        clearContextFor: ['Tracked Job', 'Tracked Job Event'],
      })
      testMethod2(data: any) {}
    }

    it('should SentryTransaction', async () => {
      const module: TestingModule = await Test.createTestingModule({
        exports: [TestService],
        providers: [
          TestService,
          {
            provide: NestjsLogger,
            useValue: mockedNestjsLogger,
          },
        ],
      }).compile();

      const service = module.get(TestService);

      const result = await service.testMethod({ test: 'test' });

      expect(result).toBeUndefined();
    });

    it('should SentryTransaction2', async () => {
      const module: TestingModule = await Test.createTestingModule({
        exports: [TestService],
        providers: [
          TestService,
          {
            provide: NestjsLogger,
            useValue: mockedNestjsLogger,
          },
        ],
      }).compile();

      const service = module.get(TestService);

      const result = service.testMethod2({ test: 'test' });

      expect(result).toBeTruthy();
    });

    it('should fail SentryTransaction', async () => {
      const module: TestingModule = await Test.createTestingModule({
        exports: [TestService],
        providers: [
          TestService,
          {
            provide: NestjsLogger,
            useValue: mockedNestjsLogger,
          },
        ],
      }).compile();

      const service = module.get(TestService);
      try {
        await service.failMethod({ test: 'test' });
      } catch (error: any) {
        expect(error.message).toStrictEqual('Error');
      }
    });
  });
});
