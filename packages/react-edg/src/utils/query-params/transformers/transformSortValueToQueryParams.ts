import type { SorterResult } from '@datagrid/types';

export const transformSortValueToQueryParams = <TData>(sorter: SorterResult<TData>[]): string[] => {
  return sorter.reduce<string[]>((sorting, { columnKey, order }) => {
    if (!order) {
      return sorting;
    }

    return [...sorting, `${columnKey}+${order}`];
  }, []);
};
