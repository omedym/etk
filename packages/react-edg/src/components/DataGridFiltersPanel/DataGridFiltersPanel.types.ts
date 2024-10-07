/**
 * Props for the DataGridFiltersPanel component.
 */
export interface DataGridFiltersPanelProps {
  /**
   * Determines whether the filters panel is open or closed.
   */
  open: boolean;
  /**
   * Callback function called when the filters panel is closed.
   */
  onClose: () => void;
  /**
   * Callback function to be called when the selected filters are changed.
   */
  onSelectedFiltersChange: () => void;
}
