import { Test, TestingModule } from '@nestjs/testing';
import { NestjsSentryModule } from './sentry.module';

describe('SentryModule', () => {
  it('should define SentryModule ', async () => {
    const module: TestingModule = await Test.createTestingModule({
      exports: [],
      providers: [],
      imports: [NestjsSentryModule],
    }).compile();

    const statsigModule = module.get(NestjsSentryModule);

    expect(statsigModule).toBeDefined();
  });
});
