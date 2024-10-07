import type { DataGridFilter, DataGridFilterValue, FilterValue } from '@datagrid/types';

/**
 * Props for the DataGridFilterItem component.
 */
export interface DataGridFilterItemProps {
  /**
   * The default value for the filter.
   */
  defaultValue?: FilterValue;
  /**
   * The current value for the filter.
   */
  value?: FilterValue;
  /**
   * Determines if the filter is pinned.
   */
  pinned?: boolean;
  /**
   * Determines if the filter is in a loading state.
   */
  loading?: boolean;
  /**
   * Determines if the filter is disabled.
   */
  disabled?: boolean;
  /**
   * The filter used for constructing the filter component.
   */
  filter: DataGridFilter;
  /**
   * The width of the filter item.
   */
  width?: string;
  /**
   * Callback function invoked when the filter value changes.
   * @param columnKey - The key of the column associated with the filter.
   * @param value - The new filter value.
   */
  onChange: (columnKey: React.Key, value: DataGridFilterValue) => void;
}
