import { NoValuesCell } from '@datagrid/components/table-cells';
import { DEFAULT_TIMEZONE } from '@datagrid/constants';
import { Popover } from 'antd';
import { DateTime } from 'luxon';

import type { ReactNode } from 'react';

/**
 * Renders a datetime value in a cell with an optional tooltip.
 * @param timestamp - The timestamp to render.
 * @param recentHours - The number of recent hours to consider.
 * @param noValueLabel - The label to display when the timestamp is empty.
 * @returns The rendered datetime cell.
 */
export const datetimeRenderer = (timestamp: string, recentHours = 24, noValueLabel: string | ReactNode = 'Never') => {
  if (!timestamp) {
    return <NoValuesCell>{noValueLabel}</NoValuesCell>;
  }

  // Display timestamp as "Oct 14, 1983 1:30 PM" in cell with a more specific
  // tooltip of "Tuesday, October 14, 1983 at 1:30:23 PM EDT"
  const tsUtc = DateTime.fromISO(timestamp);
  const tsLocal = tsUtc.setZone(DEFAULT_TIMEZONE);
  const cellValue = tsLocal.toFormat('LLL dd, yyyy h:mm a');
  const cellTooltip = `${tsLocal.toLocaleString(DateTime.DATE_HUGE)} at ${tsLocal.toLocaleString(
    DateTime.TIME_WITH_SHORT_OFFSET,
  )}`;

  const hoursAgo = Math.abs(tsUtc.diffNow('hour').hours);

  return (
    <Popover content={cellTooltip}>
      <span style={hoursAgo < recentHours ? { fontWeight: 'bolder' } : {}}>{cellValue}</span>
    </Popover>
  );
};
