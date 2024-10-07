import { NoValuesCell } from '@datagrid/components/table-cells';
import { DEFAULT_TIMEZONE } from '@datagrid/constants';
import { getTimeDifference } from '@datagrid/utils/common';
import { Popover } from 'antd';
import { DateTime } from 'luxon';

import type { ReactNode } from 'react';

export const timeAgoRenderer = (
  timestamp: string,
  recentHours = 24,
  noValueLabel: string | ReactNode = 'None',
): ReactNode => {
  if (!timestamp) {
    return <NoValuesCell>{noValueLabel}</NoValuesCell>;
  }

  // Display timestamp as "Oct 14, 1983 1:30 PM" in cell with a more specific
  // tooltip of "Tuesday, October 14, 1983 at 1:30:23 PM EDT"
  const tsUtc = DateTime.fromISO(timestamp);
  const tsLocal = tsUtc.setZone(DEFAULT_TIMEZONE);
  const cellValue = getTimeDifference(timestamp);
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
