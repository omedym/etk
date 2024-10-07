import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { SentryApolloPlugin } from './sentry.apollo.plugin';

describe('SentryApolloPlugin', () => {
  let service: SentryApolloPlugin;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SentryApolloPlugin],
    }).compile();

    service = module.get<SentryApolloPlugin>(SentryApolloPlugin);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should requestDidStart', () => {
    const application = {
      getHttpAdapter: jest.fn().mockImplementation(() => ({
        getInstance: jest.fn().mockImplementation(() => ({
          use: jest.fn(),
        })),
      })),
      useGlobalInterceptors: jest.fn(),
    } as unknown as INestApplication;

    const result = service.requestDidStart({
      request: {
        query: 'mutation  {  testMutation }',
      },
    } as any);
    expect(result).toBeDefined();
  });
});
