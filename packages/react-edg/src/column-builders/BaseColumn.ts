import { ellipsisRenderer } from '@datagrid/column-renderers';
import { isNull, isString } from 'lodash';

import type { BaseFilter } from '@datagrid/filter-builders';
import type { ColumnRenderFn, SortOrder, DataGridColumn, PinStatus } from '@datagrid/types';

/**
 * Abstract base class for building data grid column.
 *
 * @template TData - The type of data that Data Grid represents.
 * @category Column Builders
 */
export abstract class BaseColumn<TData extends Record<string, any>, TValue = any> {
  protected column: DataGridColumn<TData>;

  /**
   * Creates a basic definition for the column that will be used in the Data Grid.
   *
   * @param config - The configuration for the column based on AntD Column definition with additional parameters.
   */
  constructor(config: DataGridColumn<TData>) {
    this.column = {
      align: 'left',
      sorter: true,
      width: (config.title?.toString().length ?? 1) * 15,
      ...config,
      dataIndex: config.dataIndex ?? config.key,
    };
  }

  /**
   * Sets the multiple sort option for the column.
   * Make possible to sort multiple columns at a same time.
   *
   * @param priority - The priority of the multiple sort.
   * @returns The current instance of BaseColumn.
   */
  useMultipleSort(priority?: number): this {
    this.column.sorter = {
      multiple: priority ?? 1,
    };

    return this;
  }

  /**
   * Sets the default sort order for the column.
   *
   * @param sortOrder - The default sort order.
   * @returns The current instance of BaseColumn.
   */
  useDefaultSortOrder(sortOrder: SortOrder): this {
    this.column.defaultSortOrder = sortOrder;

    return this;
  }

  /**
   * Disables sorting for the column.
   *
   * @returns The current instance of BaseColumn.
   */
  useNotSortable(): this {
    this.column.sorter = false;

    return this;
  }

  /**
   * Shows the column in the table.
   *
   * @returns The current instance of BaseColumn.
   */
  useShowInTable(): this {
    this.column.hidden = false;

    return this;
  }

  /**
   * Hides the column in the table.
   *
   * @returns The current instance of BaseColumn.
   */
  useHideInTable(): this {
    this.column.hidden = true;

    return this;
  }

  /**
   * Sets the column to be fixed in the table.
   *
   * @param fixed - The pin status for the column. Can be 'left', 'right' or false.
   * @returns The current instance of BaseColumn.
   */
  useFixedInTable(fixed: PinStatus): this {
    this.column.fixed = fixed;

    return this;
  }

  /**
   * Enables ellipsis for the column.
   *
   * @returns The current instance of BaseColumn.
   */
  useEllipsis(): this {
    this.column.ellipsis = true;
    this.column.onCell = () => ({ style: { maxWidth: 1 } });
    this.useRender((value) => ellipsisRenderer(value as string));

    return this;
  }

  /**
   * Sets the filter for the column.
   *
   * @param filter - The filter builder that will be used for the column.
   * @returns The current instance of BaseColumn.
   */
  useFilter(filter: BaseFilter): this {
    this.column.filter = filter.useColumnKey(this.column.key);

    return this;
  }

  /**
   * Sets the group name for the column that will grouped columns by in the columns manager.
   *
   * @param group - The group name for the column.
   * @returns The current instance of BaseColumn.
   */
  useGroup(group: string): this {
    this.column.group = group;

    return this;
  }

  /**
   * Sets the transform function for the column on empty values.
   *
   * @returns The current instance of BaseColumn.
   */
  useEmptyTransform(): this {
    this.column.transformValue = (value: any) => value || '-';

    return this;
  }

  /**
   * Transforms the value before rendering.
   * @param transformFn
   * @returns The current instance of BaseColumn.
   */
  useValueTransform(transformFn: (value: any, record: TData) => TValue): this {
    this.column.transformValue = transformFn;

    return this;
  }

  /**
   * Sets the JSON value transformer for the column. It helps to transform JSON string value into object.
   *
   * @returns The current instance of BaseColumn.
   */
  useJsonValueTransform(): this {
    this.column.transformValue = (value: string) => JSON.parse(value);

    return this;
  }

  /**
   * Sets the string transformer for the column. It helps to transform value into string.
   *
   * @returns The current instance of BaseColumn.
   */
  useStringTransform(): this {
    this.column.transformValue = (value: any) => value.toString();

    return this;
  }

  /**
   * Sets the number transformer for the column. It helps to transform value into number.
   *
   * @returns The current instance of BaseColumn.
   */
  useNumberTransform(): this {
    this.column.transformValue = (value: any) => Number(value);

    return this;
  }

  /**
   * Sets the render function for the column and transforms the value before rendering.
   * If the value is null or empty string, it will use the empty value render function.
   *
   * @param renderFn - The render function for the column.
   * @returns The current instance of BaseColumn.
   */
  useRender(renderFn: ColumnRenderFn<TData, TValue>): this {
    this.column.render = (value, record, index) => {
      const transformedValue = this.column.transformValue?.(value, record) ?? value;
      const isEmptyString = isString(transformedValue) && transformedValue === '';

      if (isNull(transformedValue) || isEmptyString) {
        return this.column.emptyValueRender?.(transformedValue, record, index);
      }

      return renderFn(transformedValue, record, index);
    };

    return this;
  }

  /**
   * Sets the empty value render function for the column.
   *
   * @param emptyRenderFn - The function to be used for rendering empty values.
   * @returns The instance of the `BaseColumn` class.
   */
  useEmptyValueRender(emptyRenderFn: ColumnRenderFn<TData, null | string>): this {
    this.column.emptyValueRender = emptyRenderFn;

    if (!this.column.render) {
      this.column.render = (value, record, index) => {
        const transformedValue = this.column.transformValue?.(value, record) ?? value;
        const isEmptyString = isString(transformedValue) && transformedValue === '';

        return isNull(transformedValue) || isEmptyString
          ? emptyRenderFn(transformedValue, record, index)
          : transformedValue;
      };
    }

    return this;
  }

  /**
   * Returns the built column.
   *
   * @remarks
   * This method should only be called at the level of DataGrid components.
   * This is necessary to save the original column builder and be able to update it inside DataGrid and transform it into an AntD column just before rendering.
   *
   * @returns The column for the DataGrid based on AntD column definition with additional parameters.
   */
  getColumn(): DataGridColumn<TData> {
    return this.column;
  }
}
