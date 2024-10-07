import { Inject } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { extractTraceparentData } from '@sentry/utils';
import { SENTRY_MODULE_OPTIONS, SENTRY_TOKEN } from './sentry.constants';

export const InjectSentry = () => Inject(SENTRY_TOKEN);
export const InjectSentryModuleConfig = () => Inject(SENTRY_MODULE_OPTIONS);

export type SentryTransactionOptions = {
  description?: string;
  name?: string;
  op?: string;

  /** For the given context keys send an `undefined` value to clear them out */
  clearContextFor?: string[];

  /** When set to true do not link this transaction to the parent transaction it is spawned from */
  startNewTrace?: boolean;
  /** When set to true do not clear out existing tags */
  preserveTags?: boolean;
};

/**
 * a class method decorator
 * that starts Sentry transactions at the beginning of the method, and finishes it at the end
 */
export function SentryTransaction(options: SentryTransactionOptions) {
  return function (target: unknown, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (this: any, ...args: unknown[]) {
      // Get the current (parent) transaction before we spawn a new one
      const currentTx: Sentry.Span | undefined = Sentry.getActiveSpan();
      // Get the traceId details from the parent
      const traceparent = currentTx ? Sentry.spanToTraceHeader(currentTx) : null;
      const traceparentData = traceparent ? extractTraceparentData(traceparent) : {};

      return Sentry.startSpanManual(
        {
          attributes: {
            description: options.description,
          },
          name: options.name ?? this.constructor.name,
          onlyIfParent: false,
          op: options.op ?? this.constructor.name,
          ...(options.preserveTags ? {} : { tags: {} }),
          ...(options.startNewTrace ? {} : { ...traceparentData }),
        },
        async (span) => {
          // Clear out any specified context
          options.clearContextFor && options.clearContextFor.map((ctx) => Sentry.setContext(ctx, null));
          let result = originalMethod.apply(this, args);

          if (!(result instanceof Promise)) {
            span.setStatus({ code: 1 });
            span.end();
            return result;
          }

          try {
            span.setStatus({ code: 1 });
            return await result;
          } catch (e) {
            span.setStatus({ code: 2 });
            throw e;
          } finally {
            span.end();
          }
        },
      );
    };
  };
}
