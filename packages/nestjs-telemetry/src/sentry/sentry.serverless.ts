import * as SentryServerless from '@sentry/aws-serverless';
import { ErrorEvent, EventHint } from '@sentry/node';
import { NodeOptions } from '@sentry/node';
import { SentryService } from './sentry.service';
import { SentryOptions } from './sentry.interfaces';

export function initSentryServerless(options: SentryOptions) {
  try {
    const config: NodeOptions = {
      beforeSend: (event: ErrorEvent, hint: EventHint) => {
        SentryService.postProcessSentryEvent(event, options.contextArgumentsToTags || []);
        console.log('Sending event to Sentry: ', event.event_id);
        return event;
      },
      integrations: [
        SentryServerless.httpIntegration({ breadcrumbs: true }),
        SentryServerless.graphqlIntegration(),
        SentryServerless.postgresIntegration(),
      ],
      ...options,
    };

    SentryServerless.init(config);
    SentryServerless.setTags(options.tags || {});

    console.log('Sentry initialization finished');
  } catch (exception) {
    console.log('WARNING: Error during Sentry initialization, will not affect application');
    console.error(exception);
  }
}
