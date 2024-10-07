import * as Sentry from '@sentry/aws-serverless';
import { initSentryServerless } from './sentry.serverless';

jest.mock('@sentry/aws-serverless', () => {
  const original = jest.requireActual('@sentry/aws-serverless');

  return {
    ...original,
    init: jest.fn().mockImplementation((config) => {
      const { debug } = config;
      if (debug) {
        return true;
      } else {
        throw Error('Error');
      }
    }),
    setTag: jest.fn(),
    setTags: jest.fn(),
  };
});

describe('Sentry Serverless Service', () => {
  it('should initSentryServerless', () => {
    const spy = jest.spyOn(Sentry, 'setTags');

    const result = initSentryServerless({
      tags: { service: 'test' },
      debug: true,
    });
    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalled();
  });

  it('should fail to initSentryServerless', () => {
    const spy = jest.spyOn(global.console, 'log');

    const result = initSentryServerless({
      tags: { service: 'test' },
      debug: false,
    });
    expect(result).toBeUndefined();
    expect(spy).toHaveBeenCalledWith('WARNING: Error during Sentry initialization, will not affect application');
  });
});
