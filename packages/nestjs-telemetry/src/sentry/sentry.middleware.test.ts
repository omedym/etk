import * as Sentry from '@sentry/node';

import { SetUserToSentryMiddleware } from './sentry.middleware';
import { SentryService } from './sentry.service';

describe('SetUserToSentryMiddleware', () => {
  let service: SetUserToSentryMiddleware;

  beforeEach(async () => {
    jest.resetModules();

    service = new SetUserToSentryMiddleware();
    SentryService.headersToTags = {
      'test-header-id': 'testId',
      testUserId: 'testUserId',
    };
    SentryService.headersToUser = {
      'test-header-user-id': 'testHeaderUserId',
      testUserId: 'testUserId',
      email: 'email',
    };
  });

  it('should canActivate', () => {
    const spy = jest.spyOn(Sentry, 'setTag');

    const result = service.use(
      {
        get: jest.fn().mockReturnValue('testHeaderUserId'),
        auth: {
          testUserId: 'testUserId',
          email: 'email',
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should canActivate2', () => {
    const spy = jest.spyOn(Sentry, 'setTag');

    const result = service.use(
      {
        get: jest.fn().mockReturnValue('testHeaderUserId'),
        auth: {
          testUserId: 'testUserId',
          email: 'email',
        },
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should canActivate 3', () => {
    const spy = jest.spyOn(Sentry, 'setTag');

    const result = service.use(
      {
        get: jest.fn().mockReturnValue(null),
        auth: {},
      } as any,
      {} as any,
      jest.fn(),
    );

    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalled();
  });
});
