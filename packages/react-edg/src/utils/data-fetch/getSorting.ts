import { SortDirectionEnum, SortNullsEnum } from '@datagrid/types';
import { isArray, isEmpty } from 'lodash';

import type { TableSorter, DataGridSorting } from '@datagrid/types';

export function getSorting<TData>(sorter: TableSorter<TData>, fieldsMap: Record<string, any>): DataGridSorting[] {
  if (isEmpty(sorter)) {
    return [];
  }

  return (isArray(sorter) ? sorter : [sorter]).reduce<DataGridSorting[]>((sortingRules, { columnKey, order }) => {
    if (!order || !columnKey) {
      return sortingRules;
    }

    const key = columnKey.toString();

    return [
      ...sortingRules,
      {
        field: fieldsMap[key],
        direction: SortDirectionEnum[order],
        nulls: SortNullsEnum.Last,
      },
    ];
  }, []);
}
