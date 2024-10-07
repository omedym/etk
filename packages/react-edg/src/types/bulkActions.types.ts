import type { Key, ReactNode } from 'react';

export type BulkAction = {
  key: string;
  label: string;
  icon?: ReactNode;
  action?: () => void;
};

export type DataGridBulkActionsConfig = (selectedIds: Key[]) => BulkAction[];
