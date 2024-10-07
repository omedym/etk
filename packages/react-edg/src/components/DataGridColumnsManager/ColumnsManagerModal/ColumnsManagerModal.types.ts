import type { DataGridColumn, TableData } from '@datagrid/types';

/**
 * Props for the ColumnsManagerModal component.
 */
export interface ColumnsManagerModalProps<T extends TableData> {
  /**
   * Determines whether the modal is shown or hidden.
   */
  showModal?: boolean;
  /**
   * The list of columns to display in the columns manager.
   */
  columns: DataGridColumn<T>[];
  /**
   * The list of default columns.
   */
  defaultColumns: DataGridColumn<T>[];
  /**
   * Callback function that is called when the user saves the newly configured columns.
   * @param columns - The updated list of columns.
   */
  onSave?: (columns: DataGridColumn<T>[]) => void;
  /**
   * Callback function that is called when the user closes the modal.
   */
  onClose?: () => void;
}
