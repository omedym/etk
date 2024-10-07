import { theme as antdTheme } from 'antd';

import { generateDataGridTheme } from './generateDataGridTheme';

export const getDataGridTheme = () => {
  const token = antdTheme.getDesignToken();

  return generateDataGridTheme(token);
};
