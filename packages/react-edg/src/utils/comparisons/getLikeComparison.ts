import { ComparisonOperatorEnum } from '@datagrid/types';

import { getComparisonObject } from './getComparisonObject';

import type { ComparisonFilter } from '@datagrid/types';

export const getLikeComparison = (columnKey: string | string[], columnValue: string): ComparisonFilter =>
  getComparisonObject(columnKey, {
    [ComparisonOperatorEnum.like]: `%${columnValue}%`,
  });
