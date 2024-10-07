import { InputNumber } from 'antd';
import { createElement } from 'react';

import { BaseFilter } from './BaseFilter';

import type { InputNumberProps } from 'antd';

/**
 * NumericFilter class represents a filter builder for numeric values.
 */
export class NumericFilter extends BaseFilter {
  /**
   * Configures the filter to use a NumberInput as component render. Transforms value to number in fromFilterParams and uses IN comparison method.
   * @param props - Optional props to pass to the NumberInput component.
   * @returns The current instance of NumericFilter.
   */
  useNumberInput(props?: InputNumberProps): this {
    this.useRender(({ onChange, defaultValue, value }) =>
      createElement(InputNumber, {
        onChange,
        defaultValue,
        value,
        ...props,
      }),
    );

    const fromFilterParams = (value: string) => Number(value);

    return this.useFromFilterParams(fromFilterParams).useInComparison();
  }
}
