import type { DataGridColumn } from '@datagrid/types';

export const disableSortingForColumns = <TData>(columns: DataGridColumn<TData>[]): DataGridColumn<TData>[] =>
  columns.map((column) => ({
    ...column,
    sorter: false,
  }));
