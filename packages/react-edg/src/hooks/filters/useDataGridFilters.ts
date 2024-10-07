import { getDefaultFilters } from '@datagrid/utils/filters';
import { transformFiltersFromQueryParams } from '@datagrid/utils/query-params/transformers';
import { isEmpty } from 'lodash';
import { useEffect, useMemo, useState } from 'react';

import { useFilters } from './useFilters';

import type { BaseFilter } from '@datagrid/filter-builders';
import type { DataGridColumn, DataGridFilter, DataGridFiltersType, TableData } from '@datagrid/types';

type UseDataGridFiltersReturn = {
  defaultFilters: DataGridFiltersType;
  selectedFilters: DataGridFiltersType;
  filtersInitialized: boolean;
  filtersFetched: boolean;
  updateSelectedFilters: (filters: DataGridFiltersType) => void;
  updatePinnedFilters: (filters: React.Key[]) => void;
};

export const useDataGridFilters = <TData extends TableData>(
  columns: DataGridColumn<TData>[],
  initQueryParams: Record<string, any>,
): UseDataGridFiltersReturn => {
  const {
    filters,
    initAllFilters,
    resetAllFilters,
    defaultFilters,
    selectedFilters,
    updatePinnedFilters,
    updateSelectedFilters,
  } = useFilters();
  const [filtersInitialized, setFiltersInitialized] = useState(false);

  useEffect(() => {
    const filterBuilders = columns.map((column) => column.filter).filter(Boolean) as BaseFilter[];
    const filters = filterBuilders.map((builder) => builder.buildFilter());
    const filtersMap = filters.reduce<Record<string, DataGridFilter>>(
      (map, filter) => ({
        ...map,
        [filter.columnKey]: filter,
      }),
      {},
    );
    const queryFilters = transformFiltersFromQueryParams(initQueryParams, filtersMap);
    const defaultFilters = getDefaultFilters(filters);
    const selectedFilters = isEmpty(filters) ? defaultFilters : queryFilters;
    const pinnedFilters = filters.reduce<React.Key[]>(
      (pinnedFilters, filter) => (filter.showInToolbar ? [...pinnedFilters, filter.columnKey] : pinnedFilters),
      [],
    );

    initAllFilters({
      filters,
      defaultFilters,
      queryFilters,
      selectedFilters,
      pinnedFilters,
    });
    setFiltersInitialized(true);

    return () => {
      resetAllFilters();
    };
  }, []);

  const filtersFetched = useMemo(() => {
    if (!filtersInitialized) {
      return false;
    }

    return !filters.some((filter) => filter.loading);
  }, [filtersInitialized, filters]);

  return {
    filtersFetched,
    defaultFilters,
    selectedFilters,
    filtersInitialized,
    updatePinnedFilters,
    updateSelectedFilters,
  };
};
