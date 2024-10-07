import { toArray } from '@datagrid/utils/common';

import type { DataGridFiltersType, FilterValue } from '@datagrid/types';

export const removeFilterByValue = (
  selectedFilters: DataGridFiltersType,
  columnKey: React.Key,
  value: FilterValue,
): DataGridFiltersType =>
  Object.keys(selectedFilters).reduce<DataGridFiltersType>((newFilters, currentColumnKey) => {
    if (columnKey !== currentColumnKey) {
      return {
        ...newFilters,
        [currentColumnKey]: selectedFilters[currentColumnKey],
      };
    }

    const filterValue = selectedFilters[columnKey]?.value;
    const updatedFilterValue = toArray(filterValue).filter((valueEl) => valueEl !== value);

    if (!updatedFilterValue.length) {
      return newFilters;
    }

    return {
      ...newFilters,
      [columnKey]: {
        value: updatedFilterValue,
        comparisonFn: selectedFilters[columnKey]?.comparisonFn,
      },
    };
  }, {});

export const removeFilter = (selectedFilters: DataGridFiltersType, columnKey: React.Key): DataGridFiltersType =>
  Object.keys(selectedFilters).reduce<DataGridFiltersType>((newFilters, currentColumnKey) => {
    if (columnKey !== currentColumnKey) {
      return {
        ...newFilters,
        [currentColumnKey]: selectedFilters[currentColumnKey],
      };
    }

    return newFilters;
  }, {});
