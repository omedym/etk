import type { DataGridColumn } from './table.types';
import type { Key } from 'react';

export interface SorterResult<TData> {
  columns?: DataGridColumn<TData>;
  order?: SortOrder;
  field?: Key | readonly Key[];
  columnKey?: Key;
}

export type TableSorter<TData> = SorterResult<TData> | SorterResult<TData>[];

export type SortOrder = 'descend' | 'ascend' | null;

export enum SortDirectionEnum {
  descend = 'DESC',
  ascend = 'ASC',
}

export enum SortNullsEnum {
  First = 'NULLS_FIRST',
  Last = 'NULLS_LAST',
}

export type DataGridSorting = {
  field: string;
  direction: SortDirectionEnum;
};
