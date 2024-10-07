import { SORT_KEY, PAGE_KEY, VIEW_KEY } from '@datagrid/constants';
import {
  getFiltersFromQueryParams,
  getPageValueFromQueryParams,
  getSortValueFromQueryParams,
  getViewKeyFromQueryParams,
} from '@datagrid/utils/query-params';
import { useMemo } from 'react';

import { useURLQueryParams } from './useURLQueryParams';

type UseDataGridQueryParams = () => {
  initialSortQueryParams: string[];
  initialPageQueryParams: number;
  initialFiltersQueryParams: Record<string, any>;
  initialViewQueryParams: string;
  setSortingQueryParams: (sortRules: string[]) => void;
  setPagingQueryParams: (currentPage: number) => void;
  setViewQueryParams: (viewKey: string) => void;
  setFiltersQueryParams: (filters: Record<string, any>) => void;
};

export const useDataGridQueryParams: UseDataGridQueryParams = () => {
  const [queryParams, { add, removeAll }] = useURLQueryParams({
    queryOrder: [VIEW_KEY, PAGE_KEY, SORT_KEY],
    ignoreDecodeKeys: [SORT_KEY],
  });

  const initialSortQueryParams = useMemo(() => getSortValueFromQueryParams(queryParams, SORT_KEY), []);
  const initialPageQueryParams = useMemo(() => getPageValueFromQueryParams(queryParams, PAGE_KEY), []);
  const initialFiltersQueryParams = useMemo(
    () =>
      getFiltersFromQueryParams(queryParams, {
        pagingKey: PAGE_KEY,
        sortKey: SORT_KEY,
      }),
    [],
  );
  const initialViewQueryParams = useMemo(() => getViewKeyFromQueryParams(queryParams, VIEW_KEY), []);

  function setSortingQueryParams(sortRules: string[]) {
    add({
      [SORT_KEY]: sortRules,
    });
  }

  function setPagingQueryParams(currentPage: number) {
    add({
      [PAGE_KEY]: currentPage,
    });
  }

  function setViewQueryParams(viewKey: string) {
    add({
      [VIEW_KEY]: viewKey,
    });
  }

  function setFiltersQueryParams(filters: Record<string, any>) {
    const sortRules = getSortValueFromQueryParams(queryParams, SORT_KEY);
    const currentPage = getPageValueFromQueryParams(queryParams, PAGE_KEY);
    const viewKey = getViewKeyFromQueryParams(queryParams, VIEW_KEY);
    /* Unset all previous query filters to avoid duplications */
    removeAll();

    /* Restore the view query param */
    if (viewKey) {
      setViewQueryParams(viewKey);
    }

    /* Restore the sort query param */
    if (sortRules) {
      setSortingQueryParams(sortRules);
    }

    /* Restore the page query param */
    if (currentPage) {
      setPagingQueryParams(currentPage);
    }

    add(filters);
  }

  return {
    initialSortQueryParams,
    initialPageQueryParams,
    initialFiltersQueryParams,
    initialViewQueryParams,
    setSortingQueryParams,
    setPagingQueryParams,
    setViewQueryParams,
    setFiltersQueryParams,
  };
};
