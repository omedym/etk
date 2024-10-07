import type { DataGridColumnCheckboxOption } from '@datagrid/types';

export const getColumnsGroupedByCategory = (
  columns: DataGridColumnCheckboxOption[],
): Record<string, DataGridColumnCheckboxOption[]> =>
  columns.reduce<Record<string, DataGridColumnCheckboxOption[]>>((groupedOptions, option) => {
    const { group } = option;

    const groupOptions = groupedOptions[group] || [];

    return {
      ...groupedOptions,
      [group]: [...groupOptions, option],
    };
  }, {});
