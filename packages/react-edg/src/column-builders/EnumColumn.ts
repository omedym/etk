import { BaseColumn } from './BaseColumn';

import type { DataGridEnumColumn, EnumColumnOption } from '@datagrid/types';

/**
 * Represents a column builder for Data Grid that displays enum values.
 * @template TData - The type of data in the data grid.
 */
export class EnumColumn<TData extends Record<string, any>> extends BaseColumn<TData> {
  protected column: DataGridEnumColumn<TData>;

  /**
   * Creates a basic definition for the column that will be used in the Data Grid with additional properties for boolean column.
   *
   * @param {DataGridEnumColumn<TData>} config - The configuration for the boolean column.
   */
  constructor(config: DataGridEnumColumn<TData>) {
    super(config);

    this.column = {
      align: 'center',
      sorter: true,
      ...config,
      dataIndex: config.dataIndex ?? config.key,
    };
  }

  /**
   * Sets the options for the enum column.
   * @param options - The options for the enum column.
   * @returns The current instance of EnumColumn.
   */
  setOptions(options: EnumColumnOption[]): this {
    this.column.options = options;

    return this;
  }

  /**
   * Sets the render function for displaying label of enum column.
   * @returns The current instance of EnumColumn.
   */
  useOptionsRender(): this {
    this.useRender((value) => this.column.options?.find((option) => option.value === value)?.label ?? value);

    return this;
  }
}
