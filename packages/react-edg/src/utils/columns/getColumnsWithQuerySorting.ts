import { getColumnsFromColumnBuilders } from '@datagrid/utils/column-builders';
import { transformSortValueFromQueryParams } from '@datagrid/utils/query-params/transformers';

import type { BaseColumn } from '@datagrid/column-builders';
import type { DataGridColumn } from '@datagrid/types';

export function getColumnsWithQuerySorting<TData extends Record<string, any>>(
  initialSortQueryParams: string[],
  columnBuilders: BaseColumn<TData>[],
): DataGridColumn<TData>[] {
  const columns = getColumnsFromColumnBuilders(columnBuilders);
  const initialSortParams = transformSortValueFromQueryParams<TData>(columns, initialSortQueryParams);

  if (!initialSortParams.length) {
    return columns;
  }

  return columns.map((column) => {
    const columnKey = column.key;
    const initialSortOrder = initialSortParams.find((sortRule) => sortRule.columnKey === columnKey)?.order;

    /**
     * Override default sort order if initial sort order is provided. If not, default sort order will be null.
     * This is to ensure that the column will not be sorted by default if no initial query sort order is provided.
     */
    return {
      ...column,
      defaultSortOrder: initialSortOrder ?? null,
    };
  });
}
