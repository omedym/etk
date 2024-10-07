import { durationTimeRenderer, wholeNumberRenderer } from '@datagrid/column-renderers';

import { BaseColumn } from './BaseColumn';

/**
 * Represents a column builder for Data Grid that displays numeric values.
 * @template TData - The type of data in the data grid.
 */
export class NumberColumn<TData extends Record<string, any>> extends BaseColumn<TData> {
  /**
   * Sets the render function for displaying duration time values in the column.
   * @returns The current instance of the NumberColumn.
   */
  useDurationTimeRender(): this {
    return this.useRender((value) => durationTimeRenderer(value));
  }

  /**
   * Sets the render function for displaying numeric values with commas separators in the column.
   * @returns The current instance of the NumberColumn.
   */
  useWholeNumberRender(): this {
    return this.useRender((value) => wholeNumberRenderer(value));
  }
}
