import { getInComparison, getLikeComparison } from '../comparisons';

import { getPaging } from './getPaging';

import type { FilterArgumentToFieldMapper, InfinityFetchOptionsVariables } from '@datagrid/types';

export const getQueryVariableForOptionsFetch = (
  { substring, defaultValue, page }: InfinityFetchOptionsVariables,
  mapper: FilterArgumentToFieldMapper,
) => {
  if (defaultValue?.length) {
    return {
      paging: getPaging({
        pageSize: defaultValue.length,
        current: 1,
      }),
      filters: [getInComparison(mapper.defaultValue, defaultValue)],
    };
  }

  return {
    filters: [getLikeComparison(mapper.substring, substring ?? '')],
    paging: getPaging({
      current: page,
    }),
  };
};
