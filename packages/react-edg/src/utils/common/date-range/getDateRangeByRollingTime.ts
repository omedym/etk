/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { RollingTimeEnum } from '@datagrid/types';
import { DateTime } from 'luxon';

export const getDateRangeByRollingTime = (rollingTime: RollingTimeEnum): string[] => {
  switch (rollingTime) {
    case RollingTimeEnum.Last7Days:
      return [DateTime.local().minus({ days: 7 }).toISODate(), DateTime.now().toISODate()];
    case RollingTimeEnum.Last14Days:
      return [DateTime.local().minus({ days: 14 }).toISODate(), DateTime.now().toISODate()];
    case RollingTimeEnum.Last30Days:
      return [DateTime.local().minus({ days: 30 }).toISODate(), DateTime.now().toISODate()];
    case RollingTimeEnum.Last60Days:
      return [DateTime.local().minus({ days: 60 }).toISODate(), DateTime.now().toISODate()];
    case RollingTimeEnum.Last90Days:
      return [DateTime.local().minus({ days: 90 }).toISODate(), DateTime.now().toISODate()];
    case RollingTimeEnum.Last365Days:
      return [DateTime.local().minus({ days: 365 }).toISODate(), DateTime.now().toISODate()];
    default:
      return [];
  }
};
