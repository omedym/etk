import { decodeURIComponentSafe } from '@datagrid/utils/query-params';
import { isArray, isString } from 'lodash';

import type { ParsedQuery } from 'query-string';

export const getQueryValue = (parsedParams: ParsedQuery, queryKey: string, ignoreDecodeKeys?: string[]) => {
  const value = parsedParams[queryKey];

  const valueIsStringArray = isArray(value) && value.length > 0 && isString(value[0]);
  const valueIsString = isString(value);

  if (ignoreDecodeKeys?.includes(queryKey)) {
    return value;
  }

  if (valueIsStringArray) {
    return value.map((v) => decodeURIComponentSafe(v ?? ''));
  }

  if (valueIsString) {
    return decodeURIComponentSafe(value);
  }

  return value;
};
