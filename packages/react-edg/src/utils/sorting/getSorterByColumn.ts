import type { DataGridColumn, SorterResult, TableData } from '@datagrid/types';

export const getSorterByColumn = <TData extends TableData>(column: DataGridColumn<TData>): SorterResult<TData> => {
  return {
    columnKey: column.key,
    field: column.dataIndex,
    order: column.defaultSortOrder,
  };
};
