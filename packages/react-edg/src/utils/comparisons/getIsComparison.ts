import { ComparisonOperatorEnum } from '@datagrid/types';

import { getComparisonObject } from './getComparisonObject';

import type { ComparisonFilter } from '@datagrid/types';

export const getIsComparison = (dataField: string | string[], value: boolean): ComparisonFilter =>
  getComparisonObject(dataField, { [ComparisonOperatorEnum.is]: value });
