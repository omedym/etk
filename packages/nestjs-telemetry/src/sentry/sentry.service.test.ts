import { Test, TestingModule } from '@nestjs/testing';
import * as Sentry from '@sentry/node';
import { Event } from '@sentry/types';

import { NestjsLogger } from '../logger';
import { mockedNestjsLogger } from '../logger/NestjsLogger.test';
import { SentryService } from './sentry.service';


describe('SentryService', () => {
  let service: SentryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SentryService,
        {
          provide: NestjsLogger,
          useValue: mockedNestjsLogger,
        },
      ],
    }).compile();

    service = module.get<SentryService>(SentryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init Sentry', () => {
    const result = SentryService.init({
      tags: {
        test: 'test',
      },
    });
    expect(result).toBeUndefined();
  });

  it('should initSentry', () => {
    const spy = jest.spyOn(global.console, 'info');

    const result = SentryService.init({
      tags: {
        test: 'test',
      },
    });
    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('Sentry initialized');
  });

  it('should setTag', () => {
    const spy = jest.spyOn(Sentry, 'setTag');

    const result = service.setTag('name', 'value');
    expect(spy).toHaveBeenCalled();
  });

  it('should setTags', () => {
    const spy = jest.spyOn(Sentry, 'setTags');

    const result = service.setTags({ name: 'value' });
    expect(spy).toHaveBeenCalled();
  });

  it('should captureException', () => {
    const spy = jest.spyOn(Sentry, 'captureException');

    const result = service.captureException('name');

    expect(spy).toHaveBeenCalled();
  });

  it('should postProcessSentryEvent', () => {
    const result = SentryService.postProcessSentryEvent({
      extra: {
        args: {
          test: 'test',
          test1: 'test1',
          data: {
            test: 'test',
            test2: 'test2',
          },
        },
      },
      tags: {
        test: 'test',
      },
    } as Event, ['test']);

    expect(result).toBeUndefined();
  });

  it('should convertArgsToTags', () => {
    const result = SentryService.convertArgsToTags(
      {
        extra: {
          args: {
            test: 'test',
            tenantId: 'tenantId',
            data: {
              test: 'test',
              tenantId2: 'tenantId',
            },
          },
        },
        tags: {
          test: 'test',
        },
      } as Event,
      ['tenantId', 'test', 'tenantId2'],
    );

    expect(result).toBeUndefined();
  });

  it('should convertArgsToTags with empty values for events', () => {
    const result = SentryService.convertArgsToTags({} as Event, ['key1']);

    expect(result).toBeUndefined();
  });

  it('should stringifyEventExtra ', () => {
    const result = SentryService.stringifyEventExtra(
      {
        extra: {
          test: {
            data: 'test',
          },
        },
        tags: {
          test: 'test',
        },
      } as Event,
      'test',
    );

    expect(result).toBeUndefined();
  });
});
