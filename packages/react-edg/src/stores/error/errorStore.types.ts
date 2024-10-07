import type { ApolloError } from '@apollo/client';

interface ErrorActions {
  setError: (error: ApolloError) => void;
  clearErrors: () => void;
}

export interface ErrorStore {
  errors: ApolloError[];
  actions: ErrorActions;
}
