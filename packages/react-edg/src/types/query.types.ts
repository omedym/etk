import type { DataGridFiltersType } from './filters.types';
import type { TablePaginationConfig } from './paging.types';
import type { TableSorter } from './sorting.types';

export type QueryVariablesArgs<TData> = {
  paging: TablePaginationConfig;
  sorting: TableSorter<TData>;
  filters: DataGridFiltersType;
  fieldsMap: Record<string, any>;
  queryParams?: Record<string, any>;
};
