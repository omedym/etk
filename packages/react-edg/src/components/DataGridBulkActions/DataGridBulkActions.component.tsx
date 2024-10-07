import { Button, Space } from 'antd';

import type { DataGridBulkActionsProps } from './DataGridBulkActions.types';

export const DataGridBulkActions: React.FC<DataGridBulkActionsProps> = ({ bulkActionsConfig, selectedItems }) => {
  return (
    <Space size="small">
      {bulkActionsConfig.map(({ key, label, icon, action }) => (
        <Button key={key} icon={icon} onClick={() => action?.()}>
          {label} ({selectedItems.length})
        </Button>
      ))}
    </Space>
  );
};
