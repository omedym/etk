import { toArray } from '@datagrid/utils/common';
import { getInComparison, getIsComparison, getLikeComparison } from '@datagrid/utils/comparisons';
import { getQueryVariableForOptionsFetch } from '@datagrid/utils/data-fetch';
import { isFilterEmpty } from '@datagrid/utils/filters';
import { removeFilter, removeFilterByValue } from '@datagrid/utils/filters/filter-chips';

import type {
  BaseFilterConstructorArgs,
  ComparisonFn,
  FetchOptionsFn,
  FilterRenderType,
  FilterValue,
  DataGridFilterChips,
  FilterOptionDataType,
  FilterOptionType,
  IsFilterEmptyFn,
  DataGridFilter,
  ToFilterChipsFn,
  FilterArgumentToFieldMapper as FilterArgToFieldMapper,
  FilterInfinityOptionsFetch,
  InfinityFetchOptions,
} from '@datagrid/types';

/**
 * Base abstract class builder for building filters in Data Grid.
 */
export abstract class BaseFilter {
  /**
   * The filter render function.
   */
  protected render?: FilterRenderType;

  /**
   * The label of the filter.
   */
  protected label?: string;

  /*
   * The placeholder for the filter.
   */
  protected placeholder?: string;

  /*
   * The icon for the filter label.
   */
  protected labelIcon?: React.ReactNode;

  /**
   * The flex width of the filter.
   */
  protected width?: string | number;

  /**
   * The key of the column associated with the filter.
   */
  protected columnKey?: React.Key;

  /**
   * The comparison function to generate filter parameters for nestjs-query request.
   */
  private comparisonFn: ComparisonFn;

  /**
   * Indicates whether the filter should be shown in the filters panel.
   */
  private showInFiltersPanel: boolean;

  /**
   * Indicates whether the filter should be shown in the filters toolbar.
   */
  private showInFiltersToolbar: boolean;

  /**
   * The options for the filter if filter .
   */
  protected options?: FilterOptionType[];

  private fetchOptions?: FetchOptionsFn;

  private infinityFetchOptions?: InfinityFetchOptions;

  private filterArgToFieldMapper?: FilterArgToFieldMapper;

  /**
   * The base fetch variables for the filter.
   */
  private baseFetchVariables?: Record<string, any>;

  /**
   * The default value for the filter.
   */
  protected defaultValue?: FilterValue;

  /**
   * The function used to transform the filter value to search query parameters.
   */
  private toFilterParams: (value: FilterValue) => any;

  /**
   * The function used to transform the search query parameters parameters back to filter value.
   */
  private fromFilterParams: (value: FilterValue) => any;

  /**
   * The function used to transform the filter value to filter chips object array.
   */
  private toFilterChips: ToFilterChipsFn;

  /**
   * The function used to check if the filter is in empty state.
   */
  private isFilterEmpty: IsFilterEmptyFn;

  /**
   * Constructs a new instance of Filter builder.
   * @param filter - The base filter configuration.
   */
  constructor(filter?: BaseFilterConstructorArgs) {
    this.showInFiltersPanel = true;
    this.showInFiltersToolbar = false;
    this.toFilterParams = ({ value }) => value;
    this.fromFilterParams = (value) => value;
    this.comparisonFn = (columnKey: string, value: FilterValue) => ({ [columnKey]: value });
    this.toFilterChips = (value: FilterValue) => [this.getBaseFilterChips(value)];
    this.isFilterEmpty = (value: FilterValue) => isFilterEmpty(value);
    Object.assign(this, filter);
  }

  /**
   * Sets the label of the filter.
   * @param label - The label of the filter.
   * @returns The instance of the BaseFilter class.
   */
  useLabel(label: string): this {
    this.label = label;

    return this;
  }

  /**
   * Sets the icon for the filter label.
   * @param icon - The icon for the filter label.
   * @returns The instance of the BaseFilter class.
   */
  useLabelIcon(icon: React.ReactNode): this {
    this.labelIcon = icon;

    return this;
  }

  /**
   * Sets the width of the filter.
   * @param width - The width of the filter.
   * @returns The instance of the BaseFilter class.
   */
  useWidth(width: string | number): this {
    this.width = width;

    return this;
  }

  /**
   * Sets the column key associated with the filter.
   * @param key - The column key.
   * @returns The instance of the BaseFilter class.
   */
  useColumnKey(key: React.Key): this {
    this.columnKey = key;

    return this;
  }

  /**
   * Sets whether the filter should be shown in the filters panel.
   * @param show - Indicates whether the filter should be shown.
   * @returns The instance of the BaseFilter class.
   */
  useShowInFiltersPanel(show: boolean): this {
    this.showInFiltersPanel = show;

    return this;
  }

  /**
   * Sets whether the filter should be shown in the filters toolbar.
   * @param show - Indicates whether the filter should be shown; uses 'true' by default.
   * @returns The instance of the BaseFilter class.
   */
  useShowInFiltersToolbar(show = true): this {
    this.showInFiltersToolbar = show;

    return this;
  }

  /**
   * Sets the options for the filter.
   * @param options - The options for the filter.
   * @returns The instance of the BaseFilter class.
   */
  useOptions(options: FilterOptionType[]): this {
    this.options = options;

    // Set default transform to Filter Chips for filters with options
    this.useOptionsFilterChips();

    return this;
  }

  /**
   * Sets the default value for the filter.
   */
  useDefaultValue(defaultValue: FilterValue): this {
    this.defaultValue = defaultValue;

    return this;
  }

  /**
   * Sets the comparison function used to generate filter parameters for nestjs-query request.
   * @param comparisonFn - The comparison function.
   * @returns The instance of the BaseFilter class.
   */
  useComparisonFunction(comparisonFn: ComparisonFn): this {
    this.comparisonFn = comparisonFn;

    return this;
  }

  /**
   * Sets the fetch options function to fetch options from external resource.
   * @param fetchOptions - The fetch options function.
   * @returns The instance of the BaseFilter class.
   */
  useFetchOptions<TData extends FilterOptionDataType>(fetchOptions: FetchOptionsFn<TData>): this {
    this.fetchOptions = fetchOptions;
    // Set default transform to Filter Chips for filter with options
    this.useOptionsFilterChips();

    return this;
  }

  useBaseFetchVariables(baseFetchVariables: Record<string, any>): this {
    this.baseFetchVariables = baseFetchVariables;

    return this;
  }

  useInfinityFetchOptions<TData extends FilterOptionDataType>(
    infinityFetchOptions: InfinityFetchOptions<TData>,
    filterArgToFieldMapper: FilterArgToFieldMapper,
  ): this {
    this.infinityFetchOptions = infinityFetchOptions;
    this.filterArgToFieldMapper = filterArgToFieldMapper;
    // Set default transform to Filter Chips for filter with options
    this.useOptionsFilterChips();

    return this;
  }

  /**
   * Sets the render function for the filter.
   * @param render - The render function.
   * @returns The instance of the BaseFilter class.
   */
  useRender<TData extends FilterOptionDataType>(render: FilterRenderType<TData>): this {
    this.render = render as typeof this.render;

    return this;
  }

  /**
   * Sets the function used to transform the filter value to filter search parameters.
   * @param toFilterParamsFn - The function used to transform the filter value.
   * @returns The instance of the BaseFilter class.
   */
  useToFilterParams(toFilterParamsFn: (value: FilterValue) => any): this {
    this.toFilterParams = toFilterParamsFn;

    return this;
  }

  /**
   * Sets the function used to transform the filter search parameters back to filter value.
   * @param fromFilterParamsFn - The function used to transform the filter search parameters.
   * @returns The instance of the BaseFilter class.
   */
  useFromFilterParams(fromFilterParamsFn: (value: FilterValue) => any): this {
    this.fromFilterParams = fromFilterParamsFn;

    return this;
  }

  /**
   * Returns the base filter chips object for the filter value.
   * @param value The filter value.
   * @returns The base filter chips object.
   */
  private getBaseFilterChips(value: FilterValue): DataGridFilterChips {
    return {
      columnKey: this.columnKey!,
      label: this.label!,
      data: {
        value,
        label: value,
      },
      removeFilter,
    };
  }

  /**
   * Sets the function used to transform the filter value to filter chips objects array.
   * @param toFilterChips - The function used to transform the filter value to filter chips objects array
   * @returns The instance of the BaseFilter class.
   */
  useToFilterChips(toFilterChips: (value: FilterValue) => DataGridFilterChips[]): this {
    this.toFilterChips = toFilterChips;

    return this;
  }

  /**
   * Sets the data label for the filter chips.
   * @param getFilterChipsDataLabel - A function that takes a filter value and returns the label for the filter chips.
   * @returns The instance of the BaseFilter class.
   */
  useFilterChipsDataLabel(getFilterChipsDataLabel: (value: FilterValue) => DataGridFilterChips['data']['label']): this {
    this.useToFilterChips((filterValue: FilterValue) => [
      {
        ...this.getBaseFilterChips(filterValue),
        data: {
          value: filterValue,
          label: getFilterChipsDataLabel(filterValue),
        },
      },
    ]);

    return this;
  }

  useOptionsFilterChips(): this {
    const toFilterChips: ToFilterChipsFn = (filterValue: any[], options) => {
      return toArray(filterValue).map<DataGridFilterChips>((valueEl) => ({
        ...this.getBaseFilterChips(valueEl),
        data: {
          value: valueEl,
          label: options?.find((option) => option.value === valueEl)?.label ?? valueEl,
        },
        removeFilter: removeFilterByValue,
      }));
    };

    this.useToFilterChips(toFilterChips);
    return this;
  }

  /**
   * Sets the IN comparison function to be used in the filter.
   * @returns The current instance of the BaseFilter.
   */
  useInComparison(): this {
    return this.useComparisonFunction(getInComparison);
  }

  /**
   * Sets the LIKE comparison function to be used in the filter.
   * @returns The current instance of the BaseFilter.
   */
  useLikeComparison(): this {
    return this.useComparisonFunction(getLikeComparison);
  }

  /**
   * Sets the IS comparison function to be used in the filter.
   * @returns The current instance of the BaseFilter.
   */
  useIsComparison(): this {
    return this.useComparisonFunction(getIsComparison);
  }

  /**
   * Sets the `isFilterEmpty` function for the filter.
   * The `isFilterEmpty` function is used to determine if the filter is empty.
   * @param isFilterEmptyFn - The function that determines if the filter is empty.
   * @returns The current instance of the BaseFilter.
   */
  useIsFilterEmpty(isFilterEmptyFn: IsFilterEmptyFn): this {
    this.isFilterEmpty = (value) => isFilterEmptyFn(value) || isFilterEmpty(value);

    return this;
  }

  private getFilterInfinityOptionsFetch(): FilterInfinityOptionsFetch | undefined {
    if (!this.infinityFetchOptions) {
      return undefined;
    }

    return (args, signal) => {
      // Transform filter arguments to query variables
      const queryVariables = getQueryVariableForOptionsFetch(args, this.filterArgToFieldMapper!);
      return this.infinityFetchOptions!(queryVariables, signal);
    };
  }

  private getFilterOptionsFetch(): FetchOptionsFn | undefined {
    if (!this.fetchOptions) {
      return undefined;
    }

    return async () => {
      const options = await this.fetchOptions!(this.baseFetchVariables);
      return options;
    };
  }

  buildFilter(): DataGridFilter {
    return {
      columnKey: this.columnKey!,
      label: this.label!,
      labelIcon: this.labelIcon,
      options: this.options,
      showInPanel: this.showInFiltersPanel,
      showInToolbar: this.showInFiltersToolbar,
      defaultValue: this.defaultValue,
      loading: false,
      width: this.width,
      isFilterEmpty: this.isFilterEmpty,
      comparisonFn: this.comparisonFn,
      fetchOptions: this.getFilterOptionsFetch(),
      infinityFetchOptions: this.getFilterInfinityOptionsFetch(),
      toFilterParams: this.toFilterParams,
      fromFilterParams: this.fromFilterParams,
      render: this.render,
      toFilterChips: this.toFilterChips,
    };
  }
}
