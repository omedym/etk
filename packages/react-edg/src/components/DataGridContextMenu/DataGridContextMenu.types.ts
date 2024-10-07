import type { DataGridContextMenuItem } from '@datagrid/types';
import type { ReactNode } from 'react';

/**
 * Props for the DataGridContextMenu component.
 */
export interface DataGridContextMenuProps<TData> {
  /**
   * The icon to be displayed in the context menu.
   */
  icon?: ReactNode;
  /**
   * The data to be passed to the context menu.
   */
  data: TData;
  /**
   * Indicates whether the data is currently being loaded.
   */
  loading?: boolean;
  /**
   * A function that returns an array of context menu items based on the data.
   * @param data The data to generate the context menu items from.
   * @returns An array of context menu items.
   */
  getItems: (data: TData) => DataGridContextMenuItem<TData>[];
}
