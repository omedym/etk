import type { DataGridColumnCheckboxOption, PinStatus } from '@datagrid/types';

export interface SelectedColumnsProps {
  selectedColumns: DataGridColumnCheckboxOption[];
  /**
   * Set size dimensions for left and right pinned elements.
   */
  pinnedColumnsSize?: [number, number];
  onPinnedChange: (index: number, pinned: PinStatus) => void;
  setSelectedColumns: (columns: DataGridColumnCheckboxOption[]) => void;
}
