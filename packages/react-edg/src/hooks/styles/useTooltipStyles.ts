import { useDataGridTheme } from '@datagrid/theme/hooks';
import { useMemo } from 'react';

import type { TooltipProps } from 'antd';

export const useTooltipStyles = (overlay: string): TooltipProps => {
  const theme = useDataGridTheme();

  const tooltipProps: TooltipProps = useMemo(
    () => ({
      overlay,
      overlayInnerStyle: {
        minHeight: 'auto',
        padding: '2px 6px',
        fontSize: 12,
        backgroundColor: theme.token.background.mask,
      },
      arrow: false,
    }),
    [overlay],
  );

  return tooltipProps;
};
