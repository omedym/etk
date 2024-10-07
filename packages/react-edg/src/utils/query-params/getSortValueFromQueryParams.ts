import { isArray } from 'lodash';

export function getSortValueFromQueryParams(queryParams: Record<string, any>, key: string): string[] {
  const sortValue = queryParams[key];

  if (!sortValue) {
    return [];
  }

  return isArray(sortValue) ? sortValue : [sortValue];
}
