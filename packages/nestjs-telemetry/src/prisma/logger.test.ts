import { setPrismaInfoLogEventLevel } from './logger';

describe('setPrismaInfoLogEventLevel', () => {
  it(`should filter correctly the start postgres pool log message and return 'debug' as target If matched`, () => {
    const testCases = [
      { message: 'Starting a new service', expectedTarget: 'info' },
      { message: 'Starting a postgresql pool with 5 attempts', expectedTarget: 'debug' },
      { message: 'Connecting to the database', expectedTarget: 'info' },
    ];

    testCases.forEach(({ message, expectedTarget }) => {
      const result = setPrismaInfoLogEventLevel(message);
      expect(result).toBe(expectedTarget);
    });
  });
});
