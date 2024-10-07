import type { BaseFilter } from '@datagrid/filter-builders';
import type { TableColumnType } from 'antd';
import type { ReactNode } from 'react';

export type EnumColumnOption = {
  label: React.ReactNode;
  value: any;
};

export type DataGridColumn<TData> = TableColumnType<TData> & {
  key: string;
  dataIndex?: React.Key | readonly React.Key[];
  nodeField?: string;
  hidden?: boolean;
  group?: string;
  filter?: BaseFilter;
  exportHeaderLabel?: string;
  /**
   * Must be used when the title column is a `ReactNode`.
   */
  rawTitle?: string;
  emptyValueRender?: TableColumnType<TData>['render'];
  transformValue?: (value: any, record: TData) => any;
};

export type DataGridEnumColumn<TData> = DataGridColumn<TData> & {
  options?: EnumColumnOption[];
};

export type ColumnRenderFn<TData, TValue> = (value: TValue, record: TData, index: number) => ReactNode;
