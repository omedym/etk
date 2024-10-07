import { stringifyQueryParams, parseQueryParams, flattenObject } from '@datagrid/utils/query-params';
import { useDebounce, useUpdateEffect } from 'ahooks';
import { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import type { ParseOptions, StringifyOptions } from 'query-string';

const PARSE_OPTIONS: ParseOptions = {
  arrayFormat: 'comma',
  parseBooleans: true,
  decode: false,
};

const STRINGIFY_OPTIONS: StringifyOptions = {
  arrayFormat: 'comma',
  encode: false,
};

const sortQueryParams = (order: string[]) => (a: string, b: string) => {
  if (!order.includes(a) || !order.includes(b)) {
    return 0;
  }

  return order.indexOf(a) - order.indexOf(b);
};

type SearchParamsActions = {
  removeAll: () => void;
  add: (params: Record<string, any>) => void;
};

type UseURLQueryParamsArgs = {
  queryOrder?: string[];
  ignoreDecodeKeys?: string[];
};

export const useURLQueryParams = ({
  queryOrder,
  ignoreDecodeKeys,
}: UseURLQueryParamsArgs): [Record<string, any>, SearchParamsActions] => {
  const [queryParams, setQueryParams] = useState(parseQueryParams(PARSE_OPTIONS, ignoreDecodeKeys));
  const debouncedValue = useDebounce(queryParams, { wait: 200 });
  const { replace } = useHistory();
  const { pathname } = useLocation<Location>();

  const stringifyOptions = useMemo(
    () => ({
      ...STRINGIFY_OPTIONS,
      ...(queryOrder
        ? {
            sort: sortQueryParams(queryOrder),
          }
        : {}),
    }),
    [queryOrder],
  );

  useUpdateEffect(() => {
    replace(`${pathname}?${stringifyQueryParams(flattenObject(queryParams), stringifyOptions)}`);
  }, [debouncedValue]);

  function removeAll() {
    setQueryParams({});
  }

  function add(params: Record<string, any>): void {
    setQueryParams((prev) => ({
      ...prev,
      ...params,
    }));
  }

  return [
    queryParams,
    {
      add,
      removeAll,
    },
  ];
};
