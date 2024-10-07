import type { DataGridFilter, DataGridFiltersType } from '@datagrid/types';

export const getValidFilters = (
  filters: DataGridFiltersType,
  filtersMap: Record<string, DataGridFilter>,
): DataGridFiltersType => {
  return Object.keys(filters).reduce<DataGridFiltersType>((filledFilters, key) => {
    const filter = filters[key];

    if (filtersMap[key].isFilterEmpty(filter.value)) {
      return filledFilters;
    }

    return {
      ...filledFilters,
      [key]: filter,
    };
  }, {});
};
