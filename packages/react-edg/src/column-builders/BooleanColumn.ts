import { BaseColumn } from './BaseColumn';

/**
 * Represents a column builder that handles rendering of boolean values.
 * @template TData - The type of data that Data Grid represents.
 * @category Column Builders
 */
export class BooleanColumn<TData extends Record<string, any>> extends BaseColumn<TData> {
  /**
   * Sets the render function to display 'Yes' for true values and 'No' for false values.
   * @returns The current instance of the BooleanColumn.
   */
  useYesNoRender(valueChecker?: (value: any, record: TData) => boolean): this {
    return this.useRender((value, record) => {
      const result = valueChecker?.(value, record) ?? value;
      return result ? 'Yes' : 'No';
    });
  }
}
