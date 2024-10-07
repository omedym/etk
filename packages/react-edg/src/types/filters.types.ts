import type { ComparisonFilter } from './comparison.types';
import type { Paging } from './paging.types';
import type { DefaultOptionType } from 'antd/es/select';

export type FilterOptionDataType = Record<string, any> | undefined;

export interface FilterOptionType<TData extends FilterOptionDataType = FilterOptionDataType> extends DefaultOptionType {
  data?: TData;
}

export type FetchOptionsFn<TData extends FilterOptionDataType = FilterOptionDataType> = (
  variables?: Record<string, any>,
) => Promise<FilterOptionType<TData>[]>;

export type InfinityFetchOptions<TData extends FilterOptionDataType = FilterOptionDataType> = (
  queryVariables: {
    filters: ComparisonFilter[];
    paging: Paging;
  },
  signal?: AbortSignal,
) => Promise<FilterOptionType<TData>[]>;

export type InfinityFetchOptionsVariables = {
  substring?: string;
  defaultValue?: string[];
  page?: number;
  [key: string]: any;
};

// Describes function that fetches filter options in filter component
export type FilterInfinityOptionsFetch<TData extends FilterOptionDataType = FilterOptionDataType> = (
  args: InfinityFetchOptionsVariables,
  signal?: AbortSignal,
) => Promise<FilterOptionType<TData>[]>;

// Provides ability to map filter value to field value
export type FilterArgumentToFieldMapper = {
  substring: string | string[];
  defaultValue: string | string[];
};

export type ToFilterChipsFn = (value: FilterValue, options?: FilterOptionType[]) => DataGridFilterChips[];

export type ComparisonFn = (columnKey: string, value: any) => any;

export type IsFilterEmptyFn = (value: FilterValue) => boolean;

export type FilterRenderArgs<TData extends FilterOptionDataType = FilterOptionDataType> = {
  defaultValue?: FilterValue;
  value?: FilterValue;
  options?: FilterOptionType<TData>[];
  selectedOptions?: FilterOptionType<TData>[];
  loading?: boolean;
  disabled?: boolean;
  fetchOptions?: FetchOptionsFn<TData>;
  infinityFetchOptions?: FilterInfinityOptionsFetch<TData>;
  onChange?: (value: FilterValue) => void;
  updateLoading?: (loading: boolean) => void;
  updateOptions?: (newOptions: FilterOptionType<TData>[]) => void;
  updateSelectedOptions?: (newOptions: FilterOptionType<TData>[]) => void;
};

export type FilterRenderType<TData extends FilterOptionDataType = FilterOptionDataType> = (
  args: FilterRenderArgs<TData>,
) => JSX.Element;

export type BaseFilterConstructorArgs = {
  component?: JSX.Element;
  comparisonFn?: ComparisonFn;
  columnKey?: string | number;
  label?: string;
  placeholder?: string;
  width?: string | number;
};

export type FilterValue = any;

export type DataGridFilterChips = {
  columnKey: React.Key;
  label: string;
  data: {
    value: any;
    label: string;
  };
  removeFilter: (
    selectedFilters: DataGridFiltersType,
    columnKey: React.Key,
    value?: FilterValue,
  ) => DataGridFiltersType;
};

export type DataGridFilterValue = {
  value: FilterValue;
  comparisonFn: ComparisonFn;
};

export type DataGridFiltersType = Record<React.Key, DataGridFilterValue>;

export enum LogicalOperatorEnum {
  and = 'and',
  or = 'or',
}

export type DataGridFilter = {
  columnKey: React.Key;
  label: string;
  labelIcon?: React.ReactNode;
  value?: FilterValue;
  defaultValue?: FilterValue;
  options?: FilterOptionType[];
  // Provides ability to persist selected options during dynamic filters fetch (e.g. Async Select)
  selectedOptions?: FilterOptionType[];
  width?: string | number;
  showInPanel: boolean;
  showInToolbar: boolean;
  loading?: boolean;
  isFilterEmpty: IsFilterEmptyFn;
  fetchOptions?: FetchOptionsFn;
  infinityFetchOptions?: FilterInfinityOptionsFetch;
  comparisonFn: ComparisonFn;
  render?: FilterRenderType;
  toFilterChips: ToFilterChipsFn;
  toFilterParams: (value: FilterValue) => Record<string, any>;
  fromFilterParams: (params: Record<string, any>) => FilterValue;
};
