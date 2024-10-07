export enum PeriodEnum {
  AllTime = 'all-time',
  Today = 'today',
  Yesterday = 'yesterday',
  ThisWeek = 'this-week',
  ThisMonth = 'this-month',
  ThisQuarter = 'this-quarter',
  ThisYear = 'this-year',
  LastWeek = 'last-week',
  LastMonth = 'last-month',
  LastQuarter = 'last-quarter',
  LastYear = 'last-year',
  RollingTimePeriod = 'rolling-time-period',
  CustomTimePeriod = 'custom-time-period',
}

export enum RollingTimeEnum {
  Last7Days = 'last-7-days',
  Last14Days = 'last-14-days',
  Last30Days = 'last-30-days',
  Last60Days = 'last-60-days',
  Last90Days = 'last-90-days',
  Last365Days = 'last-365-days',
}

export type DateRangePeriod = {
  periodSelected: PeriodEnum;
  value: PeriodEnum | RollingTimeEnum | [string, string];
};

export type DateRangeColumnValue = {
  period: DateRangePeriod;
};
