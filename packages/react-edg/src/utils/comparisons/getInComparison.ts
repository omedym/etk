import { ComparisonOperatorEnum } from '@datagrid/types';
import { isArray } from 'lodash';

import { getComparisonObject } from './getComparisonObject';

import type { ComparisonFilter } from '@datagrid/types';

export const getInComparison = (field: string | string[], fieldValue: string | string[]): ComparisonFilter => {
  const value = isArray(fieldValue) ? fieldValue : [fieldValue];

  return getComparisonObject(field, {
    [ComparisonOperatorEnum.in]: value,
  });
};
