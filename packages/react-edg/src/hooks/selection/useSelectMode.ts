import { useSelectModeStore } from '@datagrid/stores/selectMode';
import { SelectMode } from '@datagrid/types';

type UseSelectModeReturn = {
  selectMode: SelectMode;
  selectModeDisabled: boolean;
  selectModeEnabled: boolean;
  selectModeUnavailable: boolean;
  enableSelectMode: () => void;
  disableSelectMode: () => void;
  resetSelectMode: () => void;
  initSelectMode: () => void;
};

export const useSelectMode = (): UseSelectModeReturn => {
  const store = useSelectModeStore();
  const { selectMode, disableSelectMode } = store;

  return {
    ...store,
    selectModeDisabled: selectMode === SelectMode.Disabled,
    selectModeEnabled: selectMode === SelectMode.Enabled,
    selectModeUnavailable: selectMode === SelectMode.Unavailable,
    initSelectMode: disableSelectMode,
  };
};
