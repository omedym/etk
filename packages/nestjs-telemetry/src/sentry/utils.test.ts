import { getApolloOperationData } from './utils';

describe('utils', () => {
  it('should getApolloOperationData', () => {
    const result = getApolloOperationData('mutation  {  testMutation }');

    expect(result).toStrictEqual({
      operationName: 'testMutation',
      requestType: 'mutation',
    });
  });

  it('should getApolloOperationData with empty query', () => {
    const result = getApolloOperationData();

    expect(result).toStrictEqual({});
  });

  it('should getApolloOperationData with no operation name', () => {
    const result = getApolloOperationData('{  testMutation }');

    expect(result).toStrictEqual({
      operationName: 'testMutation',
      requestType: 'query',
    });
  });
});
