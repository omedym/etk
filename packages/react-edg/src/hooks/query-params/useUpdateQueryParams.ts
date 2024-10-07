import {
  transformFiltersToQueryParams,
  transformSortValueToQueryParams,
} from '@datagrid/utils/query-params/transformers';
import { useUpdateEffect } from 'ahooks';
import { isEqual } from 'lodash';

import { useFilters } from '../filters';

import type {
  DataGridFiltersType,
  DataGridView,
  SorterResult,
  TableData,
  TablePaginationConfig,
} from '@datagrid/types';

type SetQueryParams = {
  filters: (filters: Record<string, any>) => void;
  sorting: (sortRules: string[]) => void;
  paging: (currentPage: number) => void;
  view: (viewKey: string) => void;
};

type UseUpdateQueryParamsArgs<TData extends TableData> = {
  sorting: SorterResult<TData>[];
  defaultSorting: SorterResult<TData>[];
  paging: TablePaginationConfig;
  selectedView?: DataGridView<TData>;
  setQueryParams: SetQueryParams;
};

export function useUpdateQueryParams<TData extends TableData>({
  sorting,
  defaultSorting,
  paging,
  selectedView,
  setQueryParams,
}: UseUpdateQueryParamsArgs<TData>): void {
  const { defaultFilters, selectedFilters, filtersMap } = useFilters();

  const queryParams = {
    filters: {
      clear: () => setQueryParams.filters({}),
      set: (filters: DataGridFiltersType) => setQueryParams.filters(transformFiltersToQueryParams(filters, filtersMap)),
    },
    sorting: {
      clear: () => setQueryParams.sorting([]),
      set: (sorter: SorterResult<TData>[]) => setQueryParams.sorting(transformSortValueToQueryParams(sorter)),
    },
    paging: {
      set: (pagination: TablePaginationConfig) => setQueryParams.paging(pagination.current ?? 1),
    },
    view: {
      set: (viewKey: string) => setQueryParams.view(viewKey),
    },
  };

  useUpdateEffect(() => {
    if (selectedView) {
      return;
    }
    // If selected view is not set, update query params based on default filters

    if (isEqual(selectedFilters, defaultFilters)) {
      // Clear query params if filters equal to default filters
      queryParams.filters.clear();
    } else {
      queryParams.filters.set(selectedFilters);
    }
  }, [selectedFilters, selectedView, defaultFilters]);

  useUpdateEffect(() => {
    if (!selectedView) {
      return;
    }
    // If selected view is set, update query params based on view sorting

    if (isEqual(selectedFilters, selectedView.selectedFilters)) {
      // Clear query params if filters equal to selected view filters
      queryParams.filters.clear();
    } else {
      queryParams.filters.set(selectedFilters);
    }
  }, [selectedFilters, selectedView]);

  useUpdateEffect(() => {
    if (selectedView) {
      return;
    }
    // If selected view is not set, update query params based on default sorting

    if (isEqual(sorting, defaultSorting)) {
      // Clear query params if sorting equal to selected view sorting
      queryParams.sorting.clear();
    } else {
      queryParams.sorting.set(sorting);
    }
  }, [sorting, selectedView, defaultSorting]);

  useUpdateEffect(() => {
    if (!selectedView) {
      return;
    }
    // If selected view is set, update query params based on view sorting

    if (isEqual(sorting, selectedView.sorting)) {
      // Clear query params if sorting equal to selected view sorting
      queryParams.sorting.clear();
    } else {
      queryParams.sorting.set(sorting);
    }
  }, [sorting, selectedView, defaultSorting]);

  useUpdateEffect(() => {
    queryParams.paging.set(paging);
  }, [paging]);

  useUpdateEffect(() => {
    if (selectedView) {
      queryParams.view.set(selectedView.key);
    }
  }, [selectedView]);
}
