import { Popover } from 'antd';
import { Duration } from 'luxon';

const invalidDuration = <span title="no seconds" />;

/**
 * Renders a number converted to a duration in hours, minutes, and seconds.
 * @param val - The number of seconds to render.
 * @returns The rendered duration cell.
 */
export const durationTimeRenderer = (val: string): JSX.Element => {
  if (!val) {
    return invalidDuration;
  }

  const numberSec = Number(val);

  if (Number.isNaN(numberSec)) {
    return invalidDuration;
  }

  const roundedSec = Math.round(numberSec);

  const duration = Duration.fromObject({ seconds: roundedSec }).shiftTo('hours', 'minutes', 'seconds');

  const hours = duration.hours > 0 ? `${duration.hours}h ` : '';
  const minutes = duration.minutes > 0 ? `${duration.minutes}m ` : '';
  const seconds = duration.seconds > 0 ? `${duration.seconds}s` : '';

  const cellValue = `${hours}${minutes}${seconds}`;

  const cellTooltip = `${roundedSec.toLocaleString()} seconds`;

  return <Popover content={cellTooltip}>{cellValue}</Popover>;
};
