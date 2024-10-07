import { DataGridFilterItem } from '@datagrid/components';
import { useFilters } from '@datagrid/hooks/filters';
import { useSelectMode } from '@datagrid/hooks/selection';
import { getValidFilters } from '@datagrid/utils/filters';
import { Col } from 'antd';
import React from 'react';

import type { PinnedFiltersProps } from './PinnedFilters.types';
import type { DataGridFilterValue } from '@datagrid/types';

export const PinnedFilters: React.FC<PinnedFiltersProps> = ({ onSelectedFiltersChange }) => {
  const { selectModeEnabled } = useSelectMode();
  const { filtersMap, selectedFilters, pinnedFilters, updateSelectedFilters } = useFilters();

  const handleFilterChange = (columnKey: React.Key, value: DataGridFilterValue) => {
    const validFilters = getValidFilters(
      {
        ...selectedFilters,
        [columnKey]: value,
      },
      filtersMap,
    );
    updateSelectedFilters(validFilters);
    onSelectedFiltersChange();
  };

  return (
    <>
      {pinnedFilters.map((columnKey) => (
        <Col key={columnKey} flex={filtersMap[columnKey].width}>
          <DataGridFilterItem
            width="200px"
            filter={filtersMap[columnKey]}
            defaultValue={selectedFilters[columnKey]?.value}
            value={selectedFilters[columnKey]?.value}
            disabled={selectModeEnabled}
            onChange={handleFilterChange}
          />
        </Col>
      ))}
    </>
  );
};
