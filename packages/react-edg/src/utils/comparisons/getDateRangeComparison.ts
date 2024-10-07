import { DEFAULT_TIMEZONE } from '@datagrid/constants';
import { ComparisonOperatorEnum, DateRangeComparisonEnum } from '@datagrid/types';
import { getDateRangeByPeriod } from '@datagrid/utils/common';
import { DateTime } from 'luxon';

import { getComparisonObject } from './getComparisonObject';

import type { ComparisonFilter, DateRangeColumnValue } from '@datagrid/types';

export const getDateRangeComparison = (
  columnKey: string,
  { period }: DateRangeColumnValue,
): ComparisonFilter | null => {
  const range = getDateRangeByPeriod(period.periodSelected, period.value);

  if (!range) {
    return null;
  }

  const [lower, upper] = range;
  /*
   * GraphQL query filter requries datetimes to be in UTC format
   * Convert from `DEFAULT_TIMEZONE` zone (2024-05-09) to UTC timezone (2024-05-10T04:00:00.000Z)
   */
  const inclusiveLowerBound = DateTime.fromISO(lower, { zone: DEFAULT_TIMEZONE }).toUTC().toISO()!;
  const inclusiveUpperBound = DateTime.fromISO(upper, { zone: DEFAULT_TIMEZONE }).plus({ days: 1 }).toUTC().toISO()!;

  if (!lower || !upper) {
    return null;
  }

  return getComparisonObject(columnKey, {
    [ComparisonOperatorEnum.between]: {
      [DateRangeComparisonEnum.lower]: inclusiveLowerBound,
      [DateRangeComparisonEnum.upper]: inclusiveUpperBound,
    },
  });
};
