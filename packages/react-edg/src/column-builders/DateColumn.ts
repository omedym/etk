import { dateRenderer, datetimeRenderer, timeAgoRenderer } from '@datagrid/column-renderers';

import { BaseColumn } from './BaseColumn';

import type { DataGridColumn } from '@datagrid/types';

/**
 * Represents a column for handling date values. Extends the BaseColumn class.
 * @template TData - The type of data that Data Grid represents.
 * @category Column Builders
 */
export class DateColumn<TData extends Record<string, any>> extends BaseColumn<TData> {
  constructor(column: DataGridColumn<TData>) {
    super(column);
    this.column.align = column.align ?? 'center';
    this.column.width = column.width ?? 140;
  }

  /**
   * Sets the render function for displaying date and time values in the column.
   * @returns The current instance of the DateColumn.
   */
  useDateTimeRender(): this {
    return this.useRender((value) => datetimeRenderer(value));
  }

  /**
   * Sets the render function for displaying date values in the column.
   * @returns The current instance of the DateColumn.
   */
  useDateRender(): this {
    return this.useRender((value) => dateRenderer(value));
  }

  useTimeAgoRender(): this {
    return this.useRender((value) => timeAgoRenderer(value));
  }
}
