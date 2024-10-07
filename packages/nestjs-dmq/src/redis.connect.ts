import { RedisOptions } from 'bullmq';

/**
 * Returns a Redis connection configuration
 *
 * @remarks
 * Unless overridden through the options parameter this will also check
 * for environment parameters to determine the host, port, and enabling of TLS.

 * @default
 * {
 *   host: 'localhost',           // REDIS_HOST
 *   port:  6379,                 // REDIS_PORT
 *   tls:  'enable',              // REDIS_TLS
 *   maxRetriesPerRequest: null,
 *   enableReadyCheck: true,
 * }
 *
 * @param {RedisOptions} [options]
 * @returns {RedisOptions}
 * @export
 */
export const configureRedisConnection = (
  options?: RedisOptions
): RedisOptions => {

  const {
    REDIS_HOST = 'localhost',
    REDIS_PORT = '6379',
    REDIS_TLS  = 'enable',
  } = process.env;

  const enableTls: boolean = toBoolean(REDIS_TLS) ?? true;

  return {
    host: REDIS_HOST,
    port: parseInt(REDIS_PORT),

    // Default settings
    enableReadyCheck: true,
    maxRetriesPerRequest: null,

    // TODO: Deprecate checkServerIdentity workaround in Redis TLS configuration

    // When using TLS with AWS ElasticCache Redis there is an issue related to
    // verifying server identity. This checkServerIdentity workaround is required.
    // See: https://github.com/luin/ioredis/issues/754
    ...enableTls && { tls: { checkServerIdentity: () => undefined }},

    ...options,
  };
};

/**
 * Convert an environment variable or other string value to a boolean;
 *
 * @description
 * Use this for environment variables you need to treat as a boolean. It provides
 * support for converting the following boolean oriented value pairs:
 *  - `true` | `false`
 *  - `enable` | `disable`
 *  - `yes` | `no`
 *  - `y` | `n`
 *  - `0` | `1`
 *
 * Values are automatically lower cased. All non-truthy values are automatically
 * treated as falsy. Therefore,  only `true`, `enable`, `yes`, `y`, and `1` will
 * result in `true`. All other values will return `false`.
 *
 * @default false
 * @export
 * @param {(string | undefined)} value
 * @returns {(boolean | undefined)}
 * @export
 */
export function toBoolean(
  value: string | undefined,
): boolean | undefined {
  if (!value || value === '') return undefined;

  switch (value.toLocaleLowerCase()) {
    case 'true':
    case 'enable':
    case '1':
    case 'yes':
    case 'y':
      return true;

    default:
      return false;
  };
}
