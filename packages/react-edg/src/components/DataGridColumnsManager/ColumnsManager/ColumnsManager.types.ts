import type { DataGridColumnCheckboxOption } from '@datagrid/types';
import type { Dispatch, SetStateAction } from 'react';

/**
 * Props for the ColumnsManager component.
 */
export interface ColumnsManagerProps {
  /**
   * The list of all available columns.
   */
  columns: DataGridColumnCheckboxOption[];

  /**
   * The list of selected columns.
   */
  selectedColumns: DataGridColumnCheckboxOption[];

  /**
   * Value of current search filter input.
   */
  searchValue: string;

  /**
   * Callback function to update the selected columns.
   */
  setSelectedColumns: Dispatch<SetStateAction<DataGridColumnCheckboxOption[]>>;

  /**
   * Callback function to update the search filter input value.
   */
  onSearchChange: (value: string) => void;
}
