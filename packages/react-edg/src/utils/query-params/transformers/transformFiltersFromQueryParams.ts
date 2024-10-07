import type { DataGridFilter, DataGridFiltersType, DataGridFilterValue } from '@datagrid/types';

export const transformFiltersFromQueryParams = (
  queryParams: Record<string, any>,
  filtersMap: Record<string, DataGridFilter>,
): DataGridFiltersType =>
  Object.keys(queryParams).reduce<DataGridFiltersType>((filters, columnKey) => {
    const filter = filtersMap[columnKey];

    /* If column not exists in columns definition - skip it */
    if (!filter) {
      return filters;
    }

    /* Get the method to convert from query filter value */
    const queryFilterValue = queryParams[columnKey];
    let filterValue: DataGridFilterValue | null;

    /* Check if the value can be formatted by the granted transform function */
    try {
      filterValue = {
        value: filter.fromFilterParams(queryFilterValue),
        comparisonFn: filter.comparisonFn,
      };
    } catch (error) {
      filterValue = null;
    }

    return {
      ...filters,
      ...(filterValue ? { [filter.columnKey as string]: filterValue } : {}),
    };
  }, {});
