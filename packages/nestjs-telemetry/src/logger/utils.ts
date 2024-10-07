import chalk from 'chalk';
import { DateTime } from 'luxon';
import { serializeError } from 'serialize-error';
import { configure as stringifyConfigure } from 'safe-stable-stringify';
import { format } from 'logform';
import { findLogContext } from './LogContext';
import { ContextAttributes } from './types';

const { combine, timestamp, align, printf, splat } = format;

export const fixedLength = (s: string, len: number): string =>
  Array(len)
    .fill('')
    .reduce((acc, _val, i) => acc + `${i < s.length ? s[i] : ' '}`, '');

const isLambda = !!process.env.LAMBDA_TASK_ROOT;

const safeStringify = stringifyConfigure({
  deterministic: false,
  maximumDepth: 8,
});

export const alignedWithColorsAndTime = combine(
  timestamp(),
  align(),
  splat(),
  printf(
    ({
      timestamp,
      level: logLevel,
      message,
      caller,
      ...customAttributes
    }: { level: string; timestamp?: string; caller?: string } & Record<
      string,
      string | Record<string, string> | Array<any>
    >) => {
      const jsDate = timestamp ? new Date(timestamp) : new Date();
      const isoDate = DateTime.fromJSDate(jsDate).toISO();

      const fLogLevel = (logLevel: string) => {
        let color;
        switch (logLevel) {
          case 'error':
            color = chalk.bgRed.white;
            break;
          case 'warn':
            color = chalk.yellow;
            break;
          case 'debug':
            color = chalk.dim;
            break;
          default:
            color = chalk.reset;
            break;
        }

        return color(fixedLength(logLevel.toLocaleUpperCase(), 5));
      };

      let logLine = `${chalk.cyan(isoDate)}${' ' + fLogLevel(logLevel)}`;
      const notStringCustomAttributes = [];

      if (customAttributes) {
        for (const attribute in customAttributes) {
          if (Object.hasOwn(customAttributes, attribute)) {
            const valueType = typeof customAttributes[attribute];

            if (valueType === 'string' || valueType === 'number') {
              logLine += ` [${attribute}: ${chalk.green(customAttributes[attribute])}]`;
            } else {
              notStringCustomAttributes.push(customAttributes[attribute]);
            }
          }
        }
      }

      if (caller && !(logLevel === 'error' || logLevel === 'warn')) {
        logLine += ` [${chalk.magenta(caller)}]`;
      }

      logLine += chalk.white(message);

      notStringCustomAttributes.forEach((meta) => {
        if (Array.isArray(meta)) {
          logLine += ` ${meta
            .map((m: string) => {
              return chalk.yellow(safeStringify(serializeError(m), null, 2));
            })
            .join(', ')}${
            caller && (logLevel === 'error' || logLevel === 'warn') ? '\n\t(at: ' + chalk.bold(caller) + ')' : ''
          }`;
        }
      });

      // prevent multiline logs in serverless environments
      if (isLambda) logLine = logLine.replaceAll('\n', '');

      return logLine;
    },
  ),
);

export const enrichedJsonFormat = (contextAttributes: ContextAttributes) => {
  const addHeader = format((info) => {
    // Crate header copying specified attributes
    info.header = findLogContext({}, contextAttributes, info);

    // Remove copied attributes, only from the first level
    for (const key in info.header) {
      if (Object.hasOwn(info, key)) {
        delete info[key];
      }
    }

    return info;
  });

  return combine(
    timestamp(),
    addHeader(),
    printf((msg: any) => safeStringify(serializeError(msg as string))),
  );
};

/**
 * Here we replace the original logging methods by a closure with the request injected.
 *
 * @param obj     The logger instance.
 * @param req     The request object.
 */
export const bindRequest = (obj: any, req?: any) => {
  return new Proxy(obj, {
    get(target, prop) {
      if (
        // if prop is any of these
        ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly', 'log'].reduce(
          (acc, val) => acc || val === prop,
          false,
        )
      ) {
        // return an arrow function with an implicit extra argument
        return (message: string, meta: any) => {
          obj[prop].apply(obj, [message, { ...meta, ...req }]);
        };
      } else {
        return Reflect.get(target, prop);
      }
    },
  });
};
