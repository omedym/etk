import { BaseColumn } from './BaseColumn';

/**
 * Represents a column builder for Data Grid that displays text values.
 * @template TData - The type of data in the data grid.
 */
export class TextColumn<TData extends Record<string, any>, TValue = any> extends BaseColumn<TData, TValue> {}
