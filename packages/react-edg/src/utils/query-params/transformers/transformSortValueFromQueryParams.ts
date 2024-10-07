import type { DataGridColumn, SorterResult, SortOrder, TableData } from '@datagrid/types';

export const transformSortValueFromQueryParams = <TData extends TableData>(
  columns: DataGridColumn<TData>[],
  sortingRules: string[],
): SorterResult<TData>[] => {
  return sortingRules.reduce<SorterResult<TData>[]>((sorter, rule) => {
    const [columnKey, sortOrder] = rule.split('+');
    const field = columns.find((column) => column.key === columnKey)?.dataIndex;

    return [
      ...sorter,
      {
        columnKey,
        field,
        order: sortOrder as SortOrder,
      },
    ];
  }, []);
};
