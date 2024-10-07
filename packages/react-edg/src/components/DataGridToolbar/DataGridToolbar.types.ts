import type { ActionButton, DataGridColumn, DataGridToolbarConfig, TableData, ViewMode } from '@datagrid/types';

/**
 * Props for the DataGridToolbar component.
 */
export interface DataGridToolbarProps<T extends TableData> {
  /**
   * The current view mode of the data grid.
   */
  viewMode?: ViewMode;
  /**
   * Configuration for the data grid toolbar.
   */
  toolbarConfig: DataGridToolbarConfig | undefined;
  /**
   * The columns of the data grid.
   */
  columns: DataGridColumn<T>[];
  /**
   * The default columns of the data grid.
   */
  defaultColumns: DataGridColumn<T>[];
  /**
   * Indicates whether the filters panel is open.
   */
  filtersPanelOpen: boolean;
  /**
   * The action button for the data grid toolbar.
   */
  actionButton?: ActionButton;
  /**
   * A function that renders selectable actions for the data grid toolbar.
   */
  renderSelectableActions?: (() => React.ReactNode) | null;
  /**
   * A callback function that is called when the columns are saved in the columns manager.
   * @param columns - The updated columns.
   */
  onColumnsManagerSave: (columns: DataGridColumn<T>[]) => void;
  /**
   * A callback function that is called when the view mode is changed.
   * @param view - The new view mode.
   */
  onViewModeChange: (view: ViewMode) => void;
  /**
   * Callback function to handle the opening/closing of the filters panel.
   * @param open - Indicates whether the filters panel should be open.
   */
  onFiltersPanelOpen: (open: boolean) => void;
  /**
   * A function that exports the data from the data grid.
   */
  onDataExport?: () => Promise<void>;
}
