import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { DEVTOOLS_NAME, STORE } from '../devtools.constants';

import type { FiltersStore } from './filtersStore.types';
import type { DataGridFilter } from '@datagrid/types';

const initialState = {
  filters: [],
  defaultFilters: {},
  selectedFilters: {},
  queryFilters: {},
  pinnedFilters: [],
};

const useStore = createWithEqualityFn(
  devtools<FiltersStore>(
    (set, get) => ({
      ...initialState,
      actions: {
        updateFilterItem: (columnKey, filterItemData) => {
          const filtersState = get().filters;
          const updatedFilters = filtersState.map((filter) => {
            if (filter.columnKey === columnKey) {
              return {
                ...filter,
                ...filterItemData,
              };
            }

            return filter;
          });

          set({ filters: updatedFilters });
        },
        updateSelectedFilters: (selectedFilters) => set({ selectedFilters }),
        updatePinnedFilters: (pinnedFilters) => set({ pinnedFilters }),
        initFiltersStore: (filtersStore) =>
          set({
            filters: filtersStore.filters,
            defaultFilters: filtersStore.defaultFilters,
            selectedFilters: filtersStore.selectedFilters,
            queryFilters: filtersStore.queryFilters,
            pinnedFilters: filtersStore.pinnedFilters,
          }),
        resetFiltersStore: () => {
          set({
            ...initialState,
          });
        },
      },
    }),
    { name: DEVTOOLS_NAME, store: STORE.Filters },
  ),
  shallow,
);

type UseFiltersStore = () => {
  filters: FiltersStore['filters'];
  filtersMap: Record<string, DataGridFilter>;
  defaultFilters: FiltersStore['defaultFilters'];
  selectedFilters: FiltersStore['selectedFilters'];
  queryFilters: FiltersStore['queryFilters'];
  pinnedFilters: FiltersStore['pinnedFilters'];
} & FiltersStore['actions'];

export const useFiltersStore: UseFiltersStore = () => {
  const filtersStore = useStore((state) => ({
    filters: state.filters,
    selectedFilters: state.selectedFilters,
    queryFilters: state.queryFilters,
    defaultFilters: state.defaultFilters,
    pinnedFilters: state.pinnedFilters,
  }));
  const actions = useStore((state) => state.actions);

  const filtersMap = filtersStore.filters.reduce<Record<string, DataGridFilter>>(
    (map, filter) => ({
      ...map,
      [filter.columnKey]: filter,
    }),
    {},
  );

  return {
    filtersMap,
    ...filtersStore,
    ...actions,
  };
};
