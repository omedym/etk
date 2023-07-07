const {
  NESTJS_DMQ__QUEUE_SUFFIX = '',
} = process.env;

export const QueueSuffix = NESTJS_DMQ__QUEUE_SUFFIX ? `-${NESTJS_DMQ__QUEUE_SUFFIX}` : undefined;

export const Providers = {
  ILogger: 'ILOGGER',
  TrackedJobEventQueue: '__TrackedJobEvents' + (QueueSuffix ?? ''),
}
