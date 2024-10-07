import { Input } from 'antd';
import { createElement } from 'react';

import { BaseFilter } from './BaseFilter';

import type { InputProps } from 'antd';

/**
 * Represents a TextFilter class builder.
 */
export class TextFilter extends BaseFilter {
  /**
   * Configures the TextFilter to use an Input component for rendering. Applies the LIKE comparison method.
   * @param props Optional props to be passed to the Input component.
   * @returns The current instance of the TextFilter.
   */
  useInput(props?: InputProps): this {
    this.useRender(({ onChange, defaultValue, value }) =>
      createElement(Input, {
        onChange: (event) => onChange?.(event.target.value),
        defaultValue,
        value,
        ...props,
      }),
    );

    return this.useLikeComparison();
  }
}
