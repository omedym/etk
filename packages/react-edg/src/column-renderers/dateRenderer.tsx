import { NoValuesCell } from '@datagrid/components/table-cells';
import { DEFAULT_TIMEZONE } from '@datagrid/constants';
import { Popover } from 'antd';
import { DateTime } from 'luxon';

import type { ReactNode } from 'react';

/**
 * Renders a date value in a specific format with a tooltip.
 *
 * @param timestamp - The timestamp to be rendered as a date.
 * @param zeroLabel - The label to be displayed when the timestamp is invalid or zero. Defaults to 'NEVER'.
 * @param noValueLabel - The label to be displayed when there is no value for the timestamp. Defaults to 'NEVER'.
 * @returns The JSX element representing the rendered date value with a tooltip.
 */
export const dateRenderer = (
  timestamp: string,
  zeroLabel: string | ReactNode = 'NEVER',
  noValueLabel: string | ReactNode = 'NEVER',
): JSX.Element => {
  // Display timestamp as "14 Oct 2020" in cell with a more specific
  // tooltip of "Tuesday, October 14, 1983 at 1:30:23 PM EDT"
  const tsUtc = DateTime.fromISO(timestamp);

  if (!tsUtc.isValid) {
    return <NoValuesCell>{zeroLabel ?? noValueLabel}</NoValuesCell>;
  }

  const tsLocal = tsUtc.setZone(DEFAULT_TIMEZONE);
  const cellValue = tsLocal.toFormat('dd LLL yyyy');
  const cellTooltip = `${tsLocal.toLocaleString(DateTime.DATE_HUGE)} at ${tsLocal.toLocaleString(
    DateTime.TIME_WITH_SHORT_OFFSET,
  )}`;

  return <Popover content={cellTooltip}>{cellValue}</Popover>;
};
