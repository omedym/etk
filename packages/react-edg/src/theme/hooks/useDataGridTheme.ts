import { theme as antdTheme } from 'antd';
import { useMemo } from 'react';

import { generateDataGridTheme } from '../utils/generateDataGridTheme';

export const useDataGridTheme = () => {
  const { token } = antdTheme.useToken();

  return useMemo(() => generateDataGridTheme(token), [token]);
};
