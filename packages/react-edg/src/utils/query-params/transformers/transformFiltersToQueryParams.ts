import { isNil } from 'lodash';

import type { DataGridFilter, DataGridFiltersType } from '@datagrid/types';

export const transformFiltersToQueryParams = (
  selectedFilters: DataGridFiltersType,
  filtersMap: Record<string, DataGridFilter>,
) => {
  return Object.keys(selectedFilters).reduce<Record<string, any>>((queryFilterParams, columnKey) => {
    const filterValue = selectedFilters[columnKey];
    /* Get the method to convert to query filter value */
    const toFilterParams = filtersMap[columnKey]?.toFilterParams;
    const value = toFilterParams ? toFilterParams(filterValue) : filterValue;

    if (isNil(value)) {
      return {
        ...queryFilterParams,
      };
    }

    return {
      ...queryFilterParams,
      [columnKey]: value,
    };
  }, {});
};
