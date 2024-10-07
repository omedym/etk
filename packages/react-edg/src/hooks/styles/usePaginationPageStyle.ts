import { useDataGridTheme } from '@datagrid/theme/hooks';

import type { CSSProperties } from 'react';

type GetPageStyles = (page: number) => CSSProperties;

export const usePaginationPageStyle = (currentPage: number | undefined): GetPageStyles => {
  const theme = useDataGridTheme();

  const defaultStyles: CSSProperties = {
    padding: '0 4px',
  };

  const getPageStyles: GetPageStyles = (page) => {
    return page === currentPage ? { ...defaultStyles, color: theme.token.link.base } : defaultStyles;
  };

  return getPageStyles;
};
