import { useFiltersStore } from '@datagrid/stores/filters';
import { uniq } from 'lodash';
import { useMemo } from 'react';

import type { DataGridFilter, DataGridFiltersType } from '@datagrid/types';

type InitAllFiltersArgs = {
  filters: DataGridFilter[];
  defaultFilters: DataGridFiltersType;
  queryFilters: DataGridFiltersType;
  selectedFilters: DataGridFiltersType;
  pinnedFilters: React.Key[];
};

type UseFiltersReturn = {
  filters: DataGridFilter[];
  filtersMap: Record<string, DataGridFilter>;
  defaultFilters: DataGridFiltersType;
  queryFilters: DataGridFiltersType;
  selectedFilters: DataGridFiltersType;
  pinnedFilters: React.Key[];
  updateSelectedFilters: (newSelectedFilters: DataGridFiltersType) => void;
  updatePinnedFilters: (pinnedFilters: React.Key[]) => void;
  initAllFilters: (args: InitAllFiltersArgs) => void;
  resetAllFilters: () => void;
};

export const useFilters = (): UseFiltersReturn => {
  const { filters, updatePinnedFilters, initFiltersStore, resetFiltersStore, ...filtersStore } = useFiltersStore();

  const preservedPinnedFilters = useMemo(() => {
    return filters.reduce<React.Key[]>((pinnedFilters, filter) => {
      const pinned = filter.showInToolbar;
      const hiddenInPanel = !filter.showInPanel;

      return pinned && hiddenInPanel ? [...pinnedFilters, filter.columnKey] : pinnedFilters;
    }, []);
  }, [filters]);

  const setPinnedFilters = (pinnedFilters: React.Key[]) => {
    const orderedPinnedFilters = filters.reduce<React.Key[]>((filters, filter) => {
      return pinnedFilters.includes(filter.columnKey) ? [...filters, filter.columnKey] : filters;
    }, []);

    /* removing duplicates in case of mismatch  */
    const pinnedValues = uniq([...preservedPinnedFilters, ...orderedPinnedFilters]);

    updatePinnedFilters(pinnedValues);
  };

  return {
    filters,
    ...filtersStore,
    updatePinnedFilters: setPinnedFilters,
    initAllFilters: initFiltersStore,
    resetAllFilters: resetFiltersStore,
  };
};
