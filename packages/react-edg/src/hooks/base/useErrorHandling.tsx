import { useErrorStore } from '@datagrid/stores/error';
import { notification } from 'antd';

import type { ApolloError } from '@apollo/client';

const ERROR_NOTIFICATION_CONFIG = {
  duration: 0,
  style: {
    backgroundColor: '#fff2f0',
    borderColor: '#ffccc7',
  },
};

export const useErrorHandling = () => {
  const { errors, setError: setErrorToStore, clearErrors } = useErrorStore();

  const showErrorNotification = (message: React.ReactNode) => {
    notification.error({
      message: 'Sorry, an error occurred',
      description: message,
      ...ERROR_NOTIFICATION_CONFIG,
    });
  };

  const setError = (error: ApolloError) => {
    setErrorToStore(error);
    showErrorNotification(error.message);
  };

  return {
    errors,
    setError,
    clearErrors,
  };
};
