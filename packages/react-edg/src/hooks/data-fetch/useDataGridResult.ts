import { useApolloClient, useQuery } from '@apollo/client';
import { extractDataFromEdges, getQueryVariables } from '@datagrid/utils/data-fetch';
import { useMemo, useRef } from 'react';

import { useErrorHandling } from '../base';

import type { DocumentNode } from '@apollo/client';
import type { QueryVariablesArgs, DataResult } from '@datagrid/types';

type FetchDataResult<TData> = DataResult<TData> & {
  success: boolean;
  loading: boolean;
};

export const useDataGridResult = <TData extends Record<string, any>>(
  query: DocumentNode,
  dataKey: string,
  params: QueryVariablesArgs<TData>,
): FetchDataResult<TData> => {
  const apolloClient = useApolloClient();
  /* Store prev result of fetch to show it as a placeholder during next fetch  */
  const resultRef = useRef<FetchDataResult<TData>>({
    data: [] as TData[],
    success: false,
    loading: true,
    totalCount: 0,
  });

  const { setError } = useErrorHandling();
  const { loading, data, error } = useQuery(query, {
    variables: getQueryVariables(params),
    client: apolloClient,
    fetchPolicy: 'cache-and-network',
    onError: setError,
  });

  const result: FetchDataResult<TData> = useMemo(() => {
    if (error) {
      resultRef.current = {
        data: [],
        success: !error,
        loading,
        totalCount: 0,
      };
    }

    if (loading || error) {
      return {
        data: resultRef.current.data,
        success: !error,
        loading,
        totalCount: resultRef.current.totalCount,
      };
    }

    const extractedData = extractDataFromEdges<TData>(data[dataKey]);
    const dataGridResult = {
      data: extractedData.data,
      success: !error,
      loading,
      totalCount: extractedData.totalCount ?? 0,
    };
    resultRef.current = dataGridResult;

    return dataGridResult;
  }, [data, loading, error]);

  return result;
};
