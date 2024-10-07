import { DateTime, Duration } from 'luxon';

/** Return a DateTime when input value can be either a DateTime or String */
export const forDateTime = (value: DateTime | string): DateTime => {
  return (value == typeof 'DateTime' ? value : DateTime.fromISO(value as string)) as DateTime;
};

/** Return a Duration when input value can be either a Duration or String */
export const forDuration = (value: Duration | string): Duration => {
  return (value == typeof 'Duration' ? value : Duration.fromISO(value as string)) as Duration;
};
