import type { DataGridFilterChips } from '@datagrid/types';

export interface FilterChipsItemProps extends DataGridFilterChips {
  closable?: boolean;
  onFilterChipsRemove: () => void;
}
