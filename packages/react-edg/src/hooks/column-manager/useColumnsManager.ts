import { transformColumnsToOptions, getVisibleColumnOptions } from '@datagrid/utils/columns';
import { useEffect, useMemo, useState } from 'react';

import type { DataGridColumn, DataGridColumnCheckboxOption, TableData } from '@datagrid/types';
import type { Dispatch, SetStateAction } from 'react';

type UseColumnsManagerReturn<T extends TableData> = {
  searchValue: string;
  defaultColumnsOptions: DataGridColumnCheckboxOption[];
  visibleColumnOptions: DataGridColumnCheckboxOption[];
  onSearchChange: (value: string) => void;
  getManagedColumns: () => DataGridColumn<T>[];
  resetVisibleColumnOptions: () => void;
  setVisibleColumnOptions: Dispatch<SetStateAction<DataGridColumnCheckboxOption[]>>;
};

export const useColumnsManager = <T extends TableData>(
  columns: DataGridColumn<T>[],
  defaultColumns: DataGridColumn<T>[],
): UseColumnsManagerReturn<T> => {
  const columnOptions = useMemo(() => transformColumnsToOptions(columns), [columns]);
  const defaultColumnsOptions = useMemo(() => transformColumnsToOptions(defaultColumns), [defaultColumns]);

  const [searchValue, setSearchValue] = useState<string>('');
  const [visibleColumnOptions, setVisibleColumnOptions] = useState(getVisibleColumnOptions(columnOptions));

  useEffect(() => {
    setVisibleColumnOptions(getVisibleColumnOptions(columnOptions));
  }, [columnOptions]);

  const getManagedColumns = (): DataGridColumn<T>[] => {
    const visibleColumnValues = visibleColumnOptions.map(({ value }) => value);

    const sortedColumns = columns
      .map((column) => {
        const sortIndex = visibleColumnValues.indexOf(column.key);
        const isVisible = sortIndex !== -1;

        const updatedColumn: DataGridColumn<T> = {
          ...column,
          hidden: !isVisible,
          fixed: isVisible ? visibleColumnOptions[sortIndex].pinned : false,
        };

        return { column: updatedColumn, sortIndex };
      })
      .sort((a, b) => a.sortIndex - b.sortIndex)
      .map(({ column }) => column);

    return sortedColumns;
  };

  const resetVisibleColumnOptions = () => {
    setVisibleColumnOptions(getVisibleColumnOptions(columnOptions));
  };

  return {
    searchValue,
    visibleColumnOptions,
    defaultColumnsOptions,
    getManagedColumns,
    resetVisibleColumnOptions,
    setVisibleColumnOptions,
    onSearchChange: setSearchValue,
  };
};
