import type { SelectMode } from '@datagrid/types';

interface SelectModeActions {
  enableSelectMode: () => void;
  disableSelectMode: () => void;
  resetSelectMode: () => void;
}

export interface SelectModeStore {
  selectMode: SelectMode;
  actions: SelectModeActions;
}
