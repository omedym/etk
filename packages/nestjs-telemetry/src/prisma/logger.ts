/**
 * Evaluates a Prisma info log event message and changes its log level if appropriate
 *
 * @param message
 * @returns 'info' | 'debug'
 */
export const setPrismaInfoLogEventLevel = (message: string): 'info' | 'debug' => {
  // Whenever Prisma starts a fresh database connection pool it generates an
  // INFO log entry. This refresh occurs  many times throughout the day, as
  // database credentials are cycled generally every 10 minutes. Moreover, it
  // occurs per service, per pod. So in any given 24h period we can easily
  // see upwards of 10K log entries. Therefore, set to DEBUG log level.
  if (message.startsWith('Starting a postgresql pool with'))
    return 'debug';

  return 'info';
};
