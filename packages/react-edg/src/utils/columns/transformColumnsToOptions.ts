import { DEFAULT_COLUMN_GROUP } from '@datagrid/constants';

import type { DataGridColumn, DataGridColumnCheckboxOption, TableData } from '@datagrid/types';

export const getVisibleColumnOptions = (
  checkboxOptions: DataGridColumnCheckboxOption[],
): DataGridColumnCheckboxOption[] => {
  return checkboxOptions.filter(({ visible }) => visible);
};

export const transformColumnsToOptions = <T extends TableData>(
  columns: DataGridColumn<T>[],
): DataGridColumnCheckboxOption[] => {
  return columns.map(({ title, rawTitle, key, hidden, group, fixed = false }) => ({
    value: key,
    label: rawTitle ?? title,
    visible: !hidden,
    group: group ?? DEFAULT_COLUMN_GROUP,
    // table column allows true as fixed value, which pins to left, added due types collision
    pinned: fixed === true ? 'left' : fixed,
  }));
};
