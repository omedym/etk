import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';

import { DEVTOOLS_NAME, STORE } from '../devtools.constants';

import type { ErrorStore } from './errorStore.types';

const useStore = create(
  devtools<ErrorStore>(
    (set, get) => ({
      errors: [],
      actions: {
        setError: (error) => set({ errors: [...get().errors, error] }),
        clearErrors: () => set({ errors: [] }),
      },
    }),
    { name: DEVTOOLS_NAME, store: STORE.Error },
  ),
);

type UseErrorStore = () => {
  errors: ErrorStore['errors'];
} & ErrorStore['actions'];

export const useErrorStore: UseErrorStore = () => {
  const errorStore = useStore((state) => ({ errors: state.errors, ...state.actions }), shallow);

  return {
    ...errorStore,
  };
};
