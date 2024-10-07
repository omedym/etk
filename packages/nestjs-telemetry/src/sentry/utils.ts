import gql from 'graphql-tag';
import { OperationDefinitionNode, FieldNode } from 'graphql';
import { ApolloOperationData } from './sentry.interfaces';

export function getApolloOperationData(queryRaw?: string): ApolloOperationData {
  if (!queryRaw) {
    return {};
  }
  let requestType: string | undefined;
  let operationName: string | undefined;

  const query = gql(queryRaw);
  const queryNode = query.definitions[0] as OperationDefinitionNode;
  requestType = queryNode.operation;
  operationName = queryNode.name?.value;

  if (!operationName) {
    const fieldNode = queryNode.selectionSet.selections[0] as FieldNode;
    operationName = fieldNode.name?.value;
  }

  return {
    requestType,
    operationName
  }
}
