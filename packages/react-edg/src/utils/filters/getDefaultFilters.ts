import type { DataGridFilter, DataGridFilterValue, DataGridFiltersType } from '@datagrid/types';

export const getDefaultFilters = (filters: DataGridFilter[]): DataGridFiltersType =>
  filters.reduce<DataGridFiltersType>((defaultFilters, filter) => {
    if (!filter.defaultValue) {
      return defaultFilters;
    }

    let filterValue: DataGridFilterValue | null;

    /* Check if the value can be formatted by the granted transform function */
    try {
      filterValue = {
        value: filter.fromFilterParams(filter.defaultValue),
        comparisonFn: filter.comparisonFn,
      };
    } catch (error) {
      filterValue = null;
    }

    return {
      ...defaultFilters,
      ...(filterValue ? { [filter.columnKey as string]: filterValue } : {}),
    };
  }, {});
