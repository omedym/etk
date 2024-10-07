import { useErrorHandling } from '@datagrid/hooks/base';
import { useFiltersStore } from '@datagrid/stores/filters';
import { useDataGridTheme } from '@datagrid/theme/hooks';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Space } from 'antd';
import { useEffect } from 'react';

import { Styled } from './DataGridFilterItem.styles';

import type { DataGridFilterItemProps } from './DataGridFilterItem.types';
import type { FilterOptionType, FilterValue } from '@datagrid/types';

export const DataGridFilterItem: React.FC<DataGridFilterItemProps> = ({
  defaultValue,
  value,
  pinned,
  disabled,
  filter,
  width,
  onChange,
}) => {
  const theme = useDataGridTheme();
  const { updateFilterItem } = useFiltersStore();
  const { setError } = useErrorHandling();

  const updateFilterOptions = (options: FilterOptionType[]) => {
    updateFilterItem(filter.columnKey, { options });
  };

  const updateFilterSelectedOptions = (selectedOptions: FilterOptionType[]) => {
    updateFilterItem(filter.columnKey, { selectedOptions });
  };

  const updateFilterLoading = (loading: boolean) => {
    updateFilterItem(filter.columnKey, { loading });
  };

  const loadInitialOptions = async () => {
    if (!filter.fetchOptions) {
      return;
    }

    updateFilterLoading(true);

    await filter
      .fetchOptions()
      .then((options) => updateFilterOptions(options))
      .catch(setError);

    updateFilterLoading(false);
  };

  useEffect(() => void loadInitialOptions(), []);

  const handleFilterChange = (value: FilterValue) => {
    if (!filter.columnKey) {
      return;
    }

    onChange(filter.columnKey, {
      value,
      comparisonFn: filter.comparisonFn,
    });
  };

  return (
    <Styled.Space direction="vertical" size={2} itemWidth={width}>
      <Space size={4}>
        {pinned && <FontAwesomeIcon icon={faThumbtack} size="xs" color={theme.token.text.tertiary} />}
        <Styled.Label>{filter.label}</Styled.Label>
        <Styled.LabelIcon className="icon">{filter.labelIcon}</Styled.LabelIcon>
      </Space>
      {filter.render?.({
        defaultValue,
        value,
        options: filter.options,
        selectedOptions: filter.selectedOptions,
        loading: filter.loading,
        disabled,
        fetchOptions: filter.fetchOptions,
        infinityFetchOptions: filter.infinityFetchOptions,
        onChange: handleFilterChange,
        updateLoading: updateFilterLoading,
        updateOptions: updateFilterOptions,
        updateSelectedOptions: updateFilterSelectedOptions,
      })}
    </Styled.Space>
  );
};
