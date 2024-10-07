import { useErrorHandling } from '@datagrid/hooks/base';
import { useKeyPress } from 'ahooks';
import { Alert, List, Space } from 'antd';
import { isString } from 'lodash';
import { useEffect, useState } from 'react';

import type { ServerError } from '@apollo/client';

export const DataGridDevError: React.FC = () => {
  const { errors, clearErrors } = useErrorHandling();
  const [devMode, setDevMode] = useState(false);

  const hasError = errors.length > 0;

  useEffect(() => {
    // Clear errors on component unmount
    return () => {
      if (hasError) {
        clearErrors();
      }
    };
  }, []);

  useKeyPress(['ctrl.alt.d', 'meta.alt.d'], () => {
    setDevMode((prev) => !prev);
  });

  const errorMessages = errors
    .map((error) => {
      if (error.graphQLErrors.length) {
        return error.graphQLErrors;
      }

      if (error.networkError) {
        const result = (error.networkError as ServerError).result;
        return isString(result) ? [{ message: result }] : result.errors;
      }

      if (error.clientErrors.length) {
        return error.clientErrors;
      }

      if (error.message) {
        return [{ message: error.message }];
      }

      return [];
    })
    .flat();

  if (!hasError || !devMode) return null;

  return (
    <Alert
      type="error"
      showIcon
      message={
        <List
          dataSource={errorMessages}
          size="small"
          header={<div style={{ fontWeight: 'bolder' }}>Data Grid Errors:</div>}
          renderItem={(error, index) => (
            <List.Item key={index}>
              <Space align="start">
                <div>{index + 1}:</div>
                <div>{error.message}</div>
              </Space>
            </List.Item>
          )}
        />
      }
    />
  );
};
