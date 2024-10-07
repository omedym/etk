import { useFiltersStore } from '@datagrid/stores/filters';
import { flatten, uniq } from 'lodash';
import { useMemo } from 'react';

import { CollapsedFiltersChips } from './CollapsedFiltersChips';

import type { DataGridFiltersChipsProps } from './DataGridFiltersChips.types';
import type { DataGridFilterChips } from '@datagrid/types';

export const DataGridFiltersChips: React.FC<DataGridFiltersChipsProps> = ({ onSelectedFiltersChange }) => {
  const { selectedFilters, filtersMap, updateSelectedFilters } = useFiltersStore();

  const removeFilter = (filterChips: DataGridFilterChips) => () => {
    const updatedFilters = filterChips.removeFilter(selectedFilters, filterChips.columnKey, filterChips.data.value);
    updateSelectedFilters(updatedFilters);
    onSelectedFiltersChange();
  };

  const filtersChips = useMemo(() => {
    return flatten(
      Object.keys(selectedFilters).map((columnKey) => {
        const filterValue = selectedFilters[columnKey]?.value;

        const filter = filtersMap[columnKey];
        const options = filter?.options ?? [];
        const selectedOptions = filter?.selectedOptions ?? [];
        const filterOptions = uniq([...options, ...selectedOptions]);

        return filtersMap[columnKey].toFilterChips(filterValue, filterOptions);
      }),
    );
  }, [filtersMap, selectedFilters]);

  if (!filtersChips) {
    return null;
  }

  return <CollapsedFiltersChips filtersChips={filtersChips} removeFilter={removeFilter} />;
};
