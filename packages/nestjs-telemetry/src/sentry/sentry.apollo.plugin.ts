import { Plugin } from '@nestjs/apollo';
import { GraphQLRequestContext, ApolloServerPlugin, GraphQLRequestListener, BaseContext } from '@apollo/server';
import * as Sentry from '@sentry/node';
import { getApolloOperationData } from './utils';

@Plugin()
export class SentryApolloPlugin implements ApolloServerPlugin {
  async requestDidStart(
    requestContext: GraphQLRequestContext<BaseContext>,
  ): Promise<void | GraphQLRequestListener<BaseContext>> {
    const { requestType, operationName } = getApolloOperationData(requestContext.request.query);

    if (requestType && operationName) {
      const transactionName = `${requestType} /${operationName}`;
      Sentry.setTag('kind', requestType);
      Sentry.getCurrentScope().setTransactionName(transactionName);

      const currentSpan = Sentry.getActiveSpan();

      if (currentSpan) {
        // It does not update name for unknown reason
        // the same approach is used in beforeSendTransaction hook to update name
        // but tags and breadcrumbs should be set here
        Sentry.getRootSpan(currentSpan).updateName(transactionName);
      }

      Sentry.addBreadcrumb({
        category: 'query-path',
        message: operationName,
        level: 'info',
      });
    }
  }
}
