import type { DocumentNode } from '@apollo/client';
import type { BaseColumn } from '@datagrid/column-builders';
import type {
  ContextMenuConfig,
  DataGridBulkActionsConfig,
  DataGridToolbarConfig,
  DataExportHandler,
  CardItem,
  TableData,
  ViewConfig,
  ActionButton,
} from '@datagrid/types';
import type { TableProps } from 'antd';

/**
 * Props for the DataGrid component.
 */
export interface DataGridProps<TData extends TableData> extends Omit<TableProps<TData>, 'columns' | 'title'> {
  /**
   * A unique key for the component.
   */
  key?: React.Key;
  title?: string;
  /**
   * An array of column builders to define the columns of the data grid.
   */
  columnBuilders: BaseColumn<TData>[];
  /**
   * The request configuration for fetching data from the server.
   */
  request: {
    /**
     * The GraphQL query.
     */
    query: DocumentNode;
    /**
     * The key in the response data object that contains the data grid data.
     */
    dataKey: string;
    /**
     * Optional params for the GraphQL query.
     */
    queryParams?: Record<string, any>;
  };
  /**
   * Toolbar buttons configuration. On `false`, the toolbar won't display on the _DataGrid_.
   *
   * Config values `showList`, `showCard` and `showColumnsManager` are _true_ as default.
   * So in order to hide them you must explicitly set their value to false.
   */
  toolbarConfig?: DataGridToolbarConfig;
  /**
   * Configuration for the context menu.
   */
  contextMenu?: ContextMenuConfig<TData>;
  /**
   * Card item component to render each row in card view.
   */
  CardItem?: CardItem<TData>;
  /**
   * An array of views to be displayed in the toolbar. Or a single view object to change the `Default View` label.
   */
  views?: ViewConfig[];
  /**
   * Action button to be displayed in the toolbar. Used to add custom actions like modals.
   */
  actionButton?: ActionButton;
  /**
   * Configuration for bulk actions in the toolbar during item selection.
   */
  bulkActions?: DataGridBulkActionsConfig;
  /**
   * Callback function triggered when a row is clicked.
   */
  onRowClick?: (data: TData) => void;
  /**
   * Handler function for exporting data.
   */
  onDataExport?: DataExportHandler<TData>;
}
