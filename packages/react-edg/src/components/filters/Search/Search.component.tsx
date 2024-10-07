import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useDebounceFn, useUpdateEffect } from 'ahooks';
import React, { useState } from 'react';

import { Styled } from './Search.styles';

import type { SearchProps } from './Search.types';

export const Search: React.FC<SearchProps> = ({
  defaultValue,
  value,
  disabled,
  placeholder,
  onChange,
  minSearchLength = 3,
}) => {
  const [currentValue, setCurrentValue] = useState(value ?? '');
  const { run: debounceOnChange } = useDebounceFn(
    (value: string) => {
      onChange?.(value);
    },
    {
      wait: 200,
    },
  );

  useUpdateEffect(() => {
    if (currentValue.length >= minSearchLength || currentValue.length === 0) {
      debounceOnChange(currentValue);
    }
  }, [currentValue]);

  useUpdateEffect(() => {
    setCurrentValue(value ?? '');
  }, [value]);

  return (
    <Styled.SearchInput
      defaultValue={defaultValue}
      value={currentValue}
      allowClear
      disabled={disabled}
      placeholder={placeholder}
      onChange={(event) => setCurrentValue(event.target.value)}
      addonBefore={<FontAwesomeIcon icon={faSearch} />}
    />
  );
};
