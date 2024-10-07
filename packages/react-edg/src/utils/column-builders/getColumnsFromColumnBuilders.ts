import type { BaseColumn } from '@datagrid/column-builders';
import type { DataGridColumn, TableData } from '@datagrid/types';

export const getColumnsFromColumnBuilders = <T extends TableData>(
  columnBuilders: BaseColumn<T>[],
): DataGridColumn<T>[] => {
  return columnBuilders.map((builder) => builder.getColumn());
};
