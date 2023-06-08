const {
  REDIS_QUEUE_SUFFIX = '',
} = process.env;

export const QueueSuffix = REDIS_QUEUE_SUFFIX ? `-${REDIS_QUEUE_SUFFIX}` : undefined;

export const Providers = {
  ILogger: 'ILOGGER',
  TrackedJobEventQueue: '__TrackedJobEvents' + QueueSuffix,
}
