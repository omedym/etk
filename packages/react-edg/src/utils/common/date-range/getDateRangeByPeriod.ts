/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { PeriodEnum } from '@datagrid/types';
import { DateTime } from 'luxon';

import { getDateRangeByRollingTime } from './getDateRangeByRollingTime';

import type { DateRangePeriod, RollingTimeEnum } from '@datagrid/types';

export const getDateRangeByPeriod = (period: PeriodEnum, value: DateRangePeriod['value']): string[] | null => {
  if (period === PeriodEnum.AllTime) {
    return null;
  }

  if (period === PeriodEnum.CustomTimePeriod) {
    return value as string[];
  }

  if (period === PeriodEnum.RollingTimePeriod) {
    return getDateRangeByRollingTime(value as RollingTimeEnum);
  }

  const dateRanges = {
    [PeriodEnum.Today]: [DateTime.now(), DateTime.now()],
    [PeriodEnum.Yesterday]: [DateTime.local().minus({ days: 1 }), DateTime.local().minus({ days: 1 })],
    [PeriodEnum.ThisWeek]: [DateTime.local().startOf('week'), DateTime.local().endOf('week')],
    [PeriodEnum.ThisMonth]: [DateTime.local().startOf('month'), DateTime.local().endOf('month')],
    [PeriodEnum.ThisQuarter]: [DateTime.local().startOf('quarter'), DateTime.local().endOf('quarter')],
    [PeriodEnum.ThisYear]: [DateTime.local().startOf('year'), DateTime.local().endOf('year')],
    [PeriodEnum.LastWeek]: [
      DateTime.local().minus({ weeks: 1 }).startOf('week'),
      DateTime.local().minus({ weeks: 1 }).endOf('week'),
    ],
    [PeriodEnum.LastMonth]: [
      DateTime.local().minus({ months: 1 }).startOf('month'),
      DateTime.local().minus({ months: 1 }).endOf('month'),
    ],
    [PeriodEnum.LastQuarter]: [
      DateTime.local().minus({ quarters: 1 }).startOf('quarter'),
      DateTime.local().minus({ quarters: 1 }).endOf('quarter'),
    ],
    [PeriodEnum.LastYear]: [
      DateTime.local().minus({ years: 1 }).startOf('year'),
      DateTime.local().minus({ years: 1 }).endOf('year'),
    ],
  };

  const dateRange = dateRanges[period] || [DateTime.now(), DateTime.now()];

  return [dateRange[0].toISODate(), dateRange[1].toISODate()];
};
