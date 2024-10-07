import { clone, set } from 'lodash';
import { parse } from 'query-string';

import { getQueryValue } from './getQueryValue';

import type { ParseOptions } from 'query-string';

export function parseQueryParams(parseOptions: ParseOptions, ignoreDecodeKeys?: string[]): Record<string, any> {
  const parsedParams = parse(window.location.search, parseOptions);

  return Object.keys(parsedParams).reduce<Record<string, any>>((params, queryKey) => {
    /* Complex query key has a view 'key.subkey.*' */
    const isComplexQueryKey = queryKey.includes('.');
    const queryValue = getQueryValue(parsedParams, queryKey, ignoreDecodeKeys);

    if (!isComplexQueryKey) {
      return {
        ...params,
        [queryKey]: queryValue,
      };
    }

    const complexQueryKeys = queryKey.split('.');

    /* Set the value for very nested keys */
    return set(clone(params), complexQueryKeys, queryValue);
  }, {});
}
