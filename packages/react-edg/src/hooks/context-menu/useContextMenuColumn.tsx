import { TextColumn } from '@datagrid/column-builders';
import { DataGridContextMenu } from '@datagrid/components';
import { CONTEXT_MENU_COLUMN_CLASS } from '@datagrid/constants';
import { useMemo } from 'react';

import type { ContextMenuConfig, DataGridColumn, TableData } from '@datagrid/types';

type UseConfiguredColumnsArgs<TData extends TableData> = {
  contextMenu?: ContextMenuConfig<TData>;
};

export const useContextMenuColumn = <TData extends TableData>({
  contextMenu = {},
}: UseConfiguredColumnsArgs<TData>): DataGridColumn<TData> | null => {
  const { hidden: hideContextMenu = false } = contextMenu;
  const renderContextMenu = !hideContextMenu && contextMenu.getItems;

  const ContextMenuColumn = useMemo(
    () =>
      new TextColumn<TData>({
        key: 'ContextColumn',
        fixed: 'right',
        width: 24,
        className: CONTEXT_MENU_COLUMN_CLASS,
      })
        .useRender(
          (_, data) =>
            renderContextMenu && (
              <DataGridContextMenu data={data} loading={contextMenu.loading} getItems={contextMenu.getItems!} />
            ),
        )
        .useNotSortable()
        .getColumn(),
    [contextMenu, renderContextMenu],
  );

  return renderContextMenu ? ContextMenuColumn : null;
};
