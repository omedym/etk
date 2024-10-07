import type { PinStatus } from '@datagrid/types';

export interface PinButtonProps {
  pinStatus: PinStatus | undefined;
  pinColumnsSize: [number, number];
  onPinnedChange?: (pinStatus: PinStatus) => void;
}
