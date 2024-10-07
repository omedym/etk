import { LogicalOperatorEnum } from '@datagrid/types';
import { getFilters, getPaging, getSorting } from '@datagrid/utils/data-fetch';

import type { Paging, DataGridSorting, QueryVariablesArgs } from '@datagrid/types';

type GetQueryVariablesReturn = {
  paging: Paging;
  sorting: DataGridSorting[];
  filter: {
    [LogicalOperatorEnum.and]: any[];
  };
};

export const getQueryVariables = <TData>({
  paging,
  sorting,
  filters,
  queryParams,
  fieldsMap,
}: QueryVariablesArgs<TData>): GetQueryVariablesReturn => {
  return {
    paging: getPaging(paging),
    sorting: getSorting(sorting, fieldsMap),
    filter: {
      [LogicalOperatorEnum.and]: getFilters(filters, fieldsMap),
    },
    ...(queryParams ?? {}),
  };
};
