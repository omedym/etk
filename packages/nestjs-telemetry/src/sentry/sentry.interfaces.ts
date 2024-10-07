import { Type, Abstract } from '@nestjs/common';
import { Options, SamplingContext } from '@sentry/types';

export interface SentryOptions extends Options {
  tags?: { [key: string]: string };
  prismaPostgresProvider?: Type<any> | Abstract<any> | string | symbol;
  contextArgumentsToTags?: Array<string>;
  reMapAttributes?: Record<string, string>;
  headersToTags?: Record<string, string>;
  headersToUser?: Record<string, string>;
}

export interface ApolloOperationData {
  requestType?: string;
  operationName?: string;
}

export { SamplingContext };
