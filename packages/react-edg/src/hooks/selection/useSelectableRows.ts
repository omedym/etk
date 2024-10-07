import { DataGridBulkActions } from '@datagrid/components';
import { createElement, useEffect, useState } from 'react';

import { useSelectMode } from './useSelectMode';

import type { DataGridBulkActionsConfig, TableData } from '@datagrid/types';
import type { TableRowSelection } from 'antd/es/table/interface';
import type { Key } from 'react';

type UseSelectableRowsReturn<TData extends TableData> = {
  rowSelection: TableRowSelection<TData> | undefined;
  renderSelectableActions: () => React.ReactNode | null;
};

export const useSelectableRows = <TData extends TableData>(
  bulkActions: DataGridBulkActionsConfig | undefined,
): UseSelectableRowsReturn<TData> => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const { selectModeEnabled, selectModeDisabled, initSelectMode, resetSelectMode } = useSelectMode();

  useEffect(() => {
    resetSelectMode();

    if (bulkActions) {
      initSelectMode();
    }
  }, []);

  useEffect(() => {
    if (selectModeDisabled && selectedRowKeys.length) {
      setSelectedRowKeys([]);
    }
  }, [selectModeDisabled]);

  const rowSelection: TableRowSelection<TData> = {
    preserveSelectedRowKeys: true,
    fixed: true,
    selectedRowKeys,
    onChange: setSelectedRowKeys,
  };

  const renderSelectableActions = () => {
    if (!bulkActions) {
      return null;
    }

    // not show any action if we don't have elements selected
    if (!selectedRowKeys.length) {
      return null;
    }

    return createElement(DataGridBulkActions, {
      selectedItems: selectedRowKeys,
      bulkActionsConfig: bulkActions(selectedRowKeys),
    });
  };

  return {
    rowSelection: bulkActions && selectModeEnabled ? rowSelection : undefined,
    renderSelectableActions,
  };
};
