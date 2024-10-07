import type { DataGridFilterChips } from '@datagrid/types';

export interface CollapsedFiltersChipsProps {
  filtersChips: DataGridFilterChips[];
  removeFilter: (filterChips: DataGridFilterChips) => () => void;
}
