import { Search } from '@datagrid/components/filters';
import { LogicalOperatorEnum } from '@datagrid/types';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'antd';
import { createElement } from 'react';

import { getLikeComparison } from '../utils/comparisons';

import { BaseFilter } from './BaseFilter';

import type { BaseFilterConstructorArgs } from '@datagrid/types';

interface SearchFilterConstructorArgs extends BaseFilterConstructorArgs {
  description?: string;
  minSearchLength?: number;
  queryKeys?: string[];
}

/**
 * Represents a SearchFilter class builder.
 */
export class SearchFilter extends BaseFilter {
  /**
   * The column keys associated with the search query request.
   */
  protected queryKeys?: string[];

  /**
   * Minimum length to trigger the search.
   */
  protected minSearchLength?: number;

  private description?: string;

  constructor(filterArgs?: SearchFilterConstructorArgs) {
    super(filterArgs ?? {});

    this.label = filterArgs?.label ?? 'Search By';
    this.description = filterArgs?.description;
    this.minSearchLength = filterArgs?.minSearchLength;
    this.queryKeys = filterArgs?.queryKeys;
    this.placeholder = filterArgs?.placeholder;

    if (this.description) {
      this.setLabelIcon();
    }

    this.useShowInFiltersPanel(false);
    this.useShowInFiltersToolbar(true);
  }

  private setLabelIcon(): void {
    const iconElement = createElement(FontAwesomeIcon, { icon: faInfoCircle });
    const tooltipElement = createElement(Tooltip, { title: this.description }, iconElement);
    this.useLabelIcon(tooltipElement);
  }

  /**
   * Sets the column keys associated with the query request. When not provided, the _SearchFilter_ will use the default `columnKey` value.
   * @default columnKey
   * @param queryKeys - The query column keys.
   * @returns he instance of the BaseFilter class.
   */
  useSearchQueryKeys(queryKeys: string[]): this {
    this.queryKeys = queryKeys;

    return this;
  }

  /**
   * Sets the minimum length to trigger the search.
   * @param minSearchLength - The minimum length to trigger the search.
   * @returns The instance of the SearchFilter class.
   */
  useMinSearchLength(minSearchLength: number): this {
    this.minSearchLength = minSearchLength;

    return this;
  }

  /**
   * Configures the SearchFilter to use a Search component for rendering. Applies the LIKE comparison method.
   * @returns The current instance of the SearchFilter.
   */
  useSearchInput(): this {
    this.useRender(({ onChange, defaultValue, value, disabled }) =>
      createElement(Search, {
        defaultValue,
        value,
        onChange,
        disabled,
        placeholder: this.placeholder,
        minSearchLength: this.minSearchLength,
      }),
    );

    this.useComparisonFunction((_, value) => {
      if (!this.queryKeys?.length) {
        return getLikeComparison(this.columnKey as string, value);
      }

      if (this.queryKeys.length === 1) {
        return getLikeComparison(this.queryKeys[0], value);
      }

      return {
        [LogicalOperatorEnum.or]: this.queryKeys.map((key) => getLikeComparison(key, value)),
      };
    });

    return this;
  }
}
