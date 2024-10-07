import { defaultToolbarConfig } from '@datagrid/constants';

import type { DataGridToolbarConfig } from '@datagrid/types';

export const getToolbarConfig = (
  toolbarConfig: DataGridToolbarConfig,
  hasGridElement: boolean,
): DataGridToolbarConfig => {
  if (toolbarConfig === false) {
    return toolbarConfig;
  }

  return {
    ...defaultToolbarConfig,
    ...toolbarConfig,
    ...(hasGridElement ? { showCard: toolbarConfig.showCard } : { showCard: false }),
  };
};
