import { isArray, set } from 'lodash';

import type { ComparisonFilter } from '@datagrid/types';

export const getComparisonObject = (
  dataField: string | string[],
  comparisonValue: Record<string, any>,
): ComparisonFilter => {
  const field = isArray(dataField) ? dataField : [dataField];
  const nestedObject = field.reduceRight((acc, key) => ({ [key]: acc }), {});

  return set(nestedObject, field, comparisonValue);
};
