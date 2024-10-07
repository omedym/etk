import type { BulkAction } from '@datagrid/types';

/**
 * Props for the DataGridBulkActions component.
 */
export interface DataGridBulkActionsProps {
  /**
   * An array of keys representing the selected items in the data grid.
   */
  selectedItems: React.Key[];
  /**
   * Configuration for available bulk actions in the data grid.
   */
  bulkActionsConfig: BulkAction[];
}
