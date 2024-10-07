import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ExternalExceptionFilter } from '@nestjs/core/exceptions/external-exception-filter';
import { GqlContextType } from '@nestjs/graphql';

@Catch()
export class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    if (host.getType<GqlContextType>() === 'graphql') {
      new ExternalExceptionFilter().catch(exception, host);
    } else {
      super.catch(exception, host);
    }
  }
}
