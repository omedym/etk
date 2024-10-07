import { DataGridModal } from '@datagrid/components';
import { useColumnsManager } from '@datagrid/hooks/column-manager';

import { ColumnsManager } from '../ColumnsManager';

import type { ColumnsManagerModalProps } from './ColumnsManagerModal.types';
import type { TableData } from '@datagrid/types';
import type { ReactElement } from 'react';

export const ColumnsManagerModal = <T extends TableData>({
  showModal,
  columns,
  defaultColumns,
  onSave,
  onClose,
}: ColumnsManagerModalProps<T>): ReactElement => {
  const {
    searchValue,
    visibleColumnOptions,
    defaultColumnsOptions,
    onSearchChange,
    getManagedColumns,
    resetVisibleColumnOptions,
    setVisibleColumnOptions,
  } = useColumnsManager(columns, defaultColumns);

  const closeModal = () => {
    onClose?.();
    onSearchChange('');
  };

  const saveChanges = () => {
    const managedColumns = getManagedColumns();
    onSave?.(managedColumns);
    closeModal();
  };

  const resetToDefault = () => {
    // The spread operator is intentionally used to force 'columnsManager' render
    onSave?.([...defaultColumns]);
    closeModal();
  };

  const cancelChanges = () => {
    resetVisibleColumnOptions();
    closeModal();
  };

  return (
    <DataGridModal
      open={showModal}
      title="Manage columns"
      resetLabel="Default"
      onReset={resetToDefault}
      onCancel={cancelChanges}
      onApply={saveChanges}
      bodyStyle={{ overflowY: 'auto', maxHeight: '60vh' }}
    >
      <ColumnsManager
        columns={defaultColumnsOptions}
        searchValue={searchValue}
        selectedColumns={visibleColumnOptions}
        onSearchChange={onSearchChange}
        setSelectedColumns={setVisibleColumnOptions}
      />
    </DataGridModal>
  );
};
