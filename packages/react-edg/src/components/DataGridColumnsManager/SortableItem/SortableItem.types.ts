import type { PinStatus } from '@datagrid/types';
import type { ReactNode } from 'react';

export type SortableElementProps = {
  id: string;
  value: ReactNode;
  pinnedColumnsSize?: [number, number];
  pinStatus?: PinStatus;
  onRemove?: () => void;
  onPinnedChange?: (pinStatus: PinStatus) => void;
};
