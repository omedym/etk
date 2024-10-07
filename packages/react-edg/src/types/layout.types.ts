import type { SpringValues } from '@react-spring/web';

export type DataGridToolbarConfig =
  | false
  | {
      showList?: boolean;
      showCard?: boolean;
      showColumnsManager?: boolean;
    };

export enum ViewMode {
  Card = 'card',
  List = 'list',
}

export enum SelectMode {
  Unavailable = 'unavailable',
  Disabled = 'disabled',
  Enabled = 'enabled',
}

export type FiltersPanelAnimation = SpringValues<{
  opacity: number;
  width: number;
}>;
