import { Injectable } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { Event, ScopeData, TransactionEvent } from '@sentry/types';
import { configure as stringifyConfigure } from 'safe-stable-stringify';

import { SentryOptions } from './sentry.interfaces';
import { getApolloOperationData } from './utils';

const safeStringify = stringifyConfigure({
  deterministic: false,
  maximumDepth: 8,
});

@Injectable()
export class SentryService {
  static contextArgumentsToTags: string[] = [];
  static reMapAttributes: Record<string, string> = {};
  static headersToTags: Record<string, string> = {};
  static headersToUser: Record<string, string> = {};

  static init(options: SentryOptions) {
    SentryService.contextArgumentsToTags = options.contextArgumentsToTags || [];
    SentryService.reMapAttributes = options.reMapAttributes || {};
    SentryService.headersToTags = options.headersToTags || {};
    SentryService.headersToUser = options.headersToUser || {};

    Sentry.init({
      beforeSendTransaction: (event: TransactionEvent) => {
        // Update graphql request transaction name
        if (event.request && event.transaction === 'POST /graphql') {
          const { requestType, operationName } = getApolloOperationData(JSON.parse(event.request?.data || {})?.query);
          if (requestType && operationName) {
            const transactionName = `${requestType} /${operationName}`;
            event.transaction = transactionName;
          }
        }
        return event;
      },
      beforeSend: (event: Sentry.ErrorEvent, hint: Sentry.EventHint) => {
        SentryService.postProcessSentryEvent(event, SentryService.contextArgumentsToTags);
        return event;
      },
      integrations: [
        // Other integrations automatically detected
        Sentry.prismaIntegration(),
        Sentry.redisIntegration(),
        Sentry.extraErrorDataIntegration({ depth: 6 }),
      ],
      ...options,
    });

    console.info('Sentry initialized');
  }

  static setupNestErrorHandler(app: any, filter: any) {
    Sentry.setupNestErrorHandler(app, filter);
  }

  getScopeData(): ScopeData {
    return Sentry.getCurrentScope().getScopeData();
  }

  setTag(name: string, value: string) {
    if (name && value) {
      Sentry.setTag(name, value);
    }
  }

  setTags(tags: { [keys: string]: string }) {
    Sentry.setTags(tags);
  }

  captureException(...args: Array<any>) {
    // @ts-ignore
    Sentry.captureException.apply(null, args);
  }

  static postProcessSentryEvent(event: Event, targetKeys: string[]) {
    SentryService.convertArgsToTags(event, targetKeys);
    // After tags are set, safely convert req and args objects to JSON strings
    SentryService.stringifyEventExtra(event, 'req');
    SentryService.stringifyEventExtra(event, 'args');
  }

  static convertArgsToTags(event: Event, targetKeys: string[]) {
    if (!event.extra || !event.extra.args || !event.tags) {
      return;
    }

    const eventTags: { [key: string]: any } = event.tags;
    const eventExtraArgs: { [key: string]: any } = event.extra.args;

    Object.keys(eventExtraArgs).forEach((argKey) => {
      if (targetKeys.indexOf(argKey) >= 0) {
        let tagName = argKey;
        if (SentryService.reMapAttributes[argKey]) {
          tagName = SentryService.reMapAttributes[argKey];
        }
        eventTags[tagName] = eventExtraArgs[argKey];
      } else if (typeof eventExtraArgs[argKey] === 'object') {
        // In case the argument is an Input type object look for the targetKeys
        Object.keys(eventExtraArgs[argKey]).forEach((objKey) => {
          if (targetKeys.indexOf(objKey) >= 0) {
            let tagName = argKey;
            if (SentryService.reMapAttributes[argKey]) {
              tagName = SentryService.reMapAttributes[argKey];
            }
            eventTags[tagName] = eventExtraArgs[argKey][objKey];
          }
        });
      }
    });

    event.tags = eventTags;
    event.extra.args = eventExtraArgs;
  }

  static stringifyEventExtra(event: any, extraName: string) {
    if (event.extra && event.extra[extraName]) {
      const data = event.extra[extraName];
      delete event.extra[extraName];
      event.extra[extraName] = safeStringify(data, null, 2);
    }
  }
}
