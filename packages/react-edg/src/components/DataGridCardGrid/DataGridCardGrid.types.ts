import type { ContextMenuConfig, CardItem, TableData, TablePaginationConfig } from '@datagrid/types';
import type { TableProps } from 'antd';

/**
 * Props for the CardGrid component.
 */
export interface CardGridProps<TData extends TableData> {
  /**
   * The data source for the CardGrid component.
   */
  dataSource: TData[];

  /**
   * The component used to render each card item in the grid.
   */
  CardItem: CardItem<TData>;

  /**
   * The key to use for identifying each row in the table.
   */
  rowKey?: TableProps<TData>['rowKey'];

  /**
   * Specifies whether the CardGrid component is in a loading state.
   */
  loading?: boolean;

  /**
   * Specifies the pagination configuration for the CardGrid component.
   * Set to `false` to disable pagination.
   */
  pagination?: false | TablePaginationConfig;

  /**
   * Specifies the row selection configuration for the CardGrid component.
   */
  rowSelection?: TableProps<TData>['rowSelection'];

  /**
   * Specifies the context menu configuration for the CardGrid component.
   */
  contextMenu?: ContextMenuConfig<TData>;

  /**
   * Callback function that is called when the pagination changes.
   *
   * @param pagination - The new pagination configuration.
   */
  onChange?: (pagination: TablePaginationConfig) => void;

  /**
   * Callback function that is called when a card item is clicked.
   *
   * @param data - The data of the clicked card item.
   */
  onCardClick?: (data: TData) => void;
}
