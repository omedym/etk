import type { DataGridFilter, DataGridFiltersType } from '@datagrid/types';

interface FilterActions {
  updateFilterItem: (columnKey: React.Key, filterItemData: Partial<DataGridFilter>) => void;
  updateSelectedFilters: (newSelectedFilters: DataGridFiltersType) => void;
  updatePinnedFilters: (pinnedFilters: React.Key[]) => void;
  initFiltersStore: (args: Omit<FiltersStore, 'actions'>) => void;
  resetFiltersStore: () => void;
}

export interface FiltersStore {
  filters: DataGridFilter[];
  defaultFilters: DataGridFiltersType;
  selectedFilters: DataGridFiltersType;
  queryFilters: DataGridFiltersType;
  pinnedFilters: React.Key[];
  actions: FilterActions;
}
