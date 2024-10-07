import type { DataGridColumnCheckboxOption } from '@datagrid/types';

export interface GroupedColumnsProps {
  columns: DataGridColumnCheckboxOption[];
  selectedColumns: DataGridColumnCheckboxOption[];
  onChange: (selectedColumns: DataGridColumnCheckboxOption[]) => void;
}
