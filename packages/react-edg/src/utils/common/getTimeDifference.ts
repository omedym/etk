import { DateTime } from 'luxon';

const getTimelapseFormatted = (timeUnit: number, timeUnitLabel: string) => {
  const isPast = Math.sign(timeUnit) === -1;
  const timelapse = `${Math.abs(timeUnit)} ${timeUnitLabel}${Math.abs(timeUnit) > 1 ? 's' : ''}`;
  return isPast ? `${timelapse} ago` : `In ${timelapse}`;
};

export const getTimeDifference = (date: string): string => {
  if (!date) {
    return '';
  }

  const formattedDate = DateTime.fromJSDate(new Date(date));
  const differenceFromNow = formattedDate.diffNow(['years', 'months', 'days', 'hours', 'minutes', 'seconds']);

  const { years, months, days, hours, minutes, seconds } = differenceFromNow;

  if (Math.round(Math.abs(years)) > 0) return getTimelapseFormatted(Math.round(years), 'year');

  if (Math.round(Math.abs(months)) > 0) return getTimelapseFormatted(Math.round(months), 'month');

  if (Math.round(Math.abs(days)) > 0) return getTimelapseFormatted(Math.round(days), 'day');

  if (Math.round(Math.abs(hours)) > 0) return getTimelapseFormatted(Math.round(hours), 'hour');

  if (Math.round(Math.abs(minutes)) > 0) return getTimelapseFormatted(Math.round(minutes), 'minute');

  if (Math.round(Math.abs(seconds)) > 0) return getTimelapseFormatted(Math.round(seconds), 'second');

  if (Math.round(Math.abs(seconds)) === 0) return 'Just now';

  return 'Never';
};
