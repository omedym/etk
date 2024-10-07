import { SelectMode } from '@datagrid/types';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';

import { DEVTOOLS_NAME, STORE } from '../devtools.constants';

import type { SelectModeStore } from './selectModeStore.types';

const useStore = createWithEqualityFn(
  devtools<SelectModeStore>(
    (set) => ({
      selectMode: SelectMode.Unavailable,
      actions: {
        enableSelectMode: () => set({ selectMode: SelectMode.Enabled }),
        disableSelectMode: () => set({ selectMode: SelectMode.Disabled }),
        resetSelectMode: () => set({ selectMode: SelectMode.Unavailable }),
      },
    }),
    { name: DEVTOOLS_NAME, store: STORE.SelectMode },
  ),
  shallow,
);

type UseSelectModeStore = () => {
  selectMode: SelectModeStore['selectMode'];
} & SelectModeStore['actions'];

export const useSelectModeStore: UseSelectModeStore = () => {
  const store = useStore((state) => ({ selectMode: state.selectMode, ...state.actions }));

  return store;
};
