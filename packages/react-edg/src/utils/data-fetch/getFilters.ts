import { isEmpty } from 'lodash';

import type { DataGridFiltersType } from '@datagrid/types';

export function getFilters(filters: DataGridFiltersType, fieldsMap: Record<string, any>): any[] {
  if (isEmpty(filters)) {
    return [];
  }

  const comparisonFilters = Object.keys(filters).reduce<any[]>((prevFilters, columnKey) => {
    const { comparisonFn, value } = filters[columnKey];
    const field = fieldsMap[columnKey];
    const comparisonData = comparisonFn(field, value);

    if (!comparisonData) {
      return prevFilters;
    }

    return [...prevFilters, comparisonData];
  }, []);

  return comparisonFilters;
}
