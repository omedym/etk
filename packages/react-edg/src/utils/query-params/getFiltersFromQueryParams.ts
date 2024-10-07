import { omit } from 'lodash';

export function getFiltersFromQueryParams(
  queryParams: Record<string, any>,
  keys: { sortKey: string; pagingKey: string },
): Record<string, any> {
  return omit(queryParams, [keys.sortKey, keys.pagingKey]);
}
