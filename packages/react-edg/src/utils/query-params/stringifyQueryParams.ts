import { stringify } from 'query-string';

import type { StringifyOptions } from 'query-string';

export function stringifyQueryParams(queryParams: Record<string, any>, stringifyOptions: StringifyOptions): string {
  return stringify(queryParams, stringifyOptions);
}
