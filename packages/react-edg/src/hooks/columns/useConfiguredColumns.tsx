import { disableSortingForColumns } from '@datagrid/utils/columns';
import { useMemo } from 'react';

import { useContextMenuColumn } from '../context-menu';
import { useSelectMode } from '../selection';

import type { ContextMenuConfig, DataGridColumn, TableData } from '@datagrid/types';

type UseConfiguredColumnsArgs<TData extends TableData> = {
  columns: DataGridColumn<TData>[];
  contextMenu?: ContextMenuConfig<TData>;
};

export const useConfiguredColumns = <TData extends TableData>({
  columns: initialColumns,
  contextMenu = {},
}: UseConfiguredColumnsArgs<TData>): DataGridColumn<TData>[] => {
  const { selectModeEnabled } = useSelectMode();
  const ContextMenuColumn = useContextMenuColumn({
    contextMenu,
  });

  const configuredColumns: DataGridColumn<TData>[] = useMemo(() => {
    const columns = [...initialColumns, ...(ContextMenuColumn && !selectModeEnabled ? [ContextMenuColumn] : [])];

    return selectModeEnabled ? disableSortingForColumns(columns) : columns;
  }, [ContextMenuColumn, initialColumns, selectModeEnabled]);

  return configuredColumns;
};
