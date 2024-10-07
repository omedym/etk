import type { DataGridColumn, DataGridView, SorterResult, TableData, ViewConfig } from '@datagrid/types';

/**
 * Props for the DataGridViewSelect component.
 */
export interface DataGridViewSelectProps<TData extends TableData> {
  /**
   * An array of views to be displayed in the select dropdown.
   */
  viewsConfig: ViewConfig[];

  /**
   * The default view to be selected in the dropdown.
   */
  defaultViewKey?: string;

  selectedView?: DataGridView<TData>;
  /**
   * An array of columns of the data grid.
   */
  columns: DataGridColumn<TData>[];

  /**
   * The query sorting in the data grid.
   */
  querySorting: SorterResult<TData>[];

  /**
   * A callback function that is called when the view is changed.
   * @param viewConfig The new view configuration.
   */
  onViewChange?: (viewConfig: DataGridView<TData>) => void;

  /**
   * A callback function that is called when the view is initialized.
   * @param viewConfig The current view configuration.
   * @param initialView The initial view configuration.
   */
  onViewInit?: (viewConfig: DataGridView<TData>, initialView: DataGridView<TData>) => void;
}
