import { useSelectMode } from '@datagrid/hooks/selection';

import { BaseButton } from '../BaseButton';

import { FilterBarIcon } from './FilterBarIcon.component';

import type { FiltersButtonProps } from './FiltersButton.types';

export const FiltersButton: React.FC<FiltersButtonProps> = ({ onClick: onDisplayFilters }) => {
  const { selectModeEnabled } = useSelectMode();

  return (
    <BaseButton icon={<FilterBarIcon height={10} width={10} />} disabled={selectModeEnabled} onClick={onDisplayFilters}>
      Filters
    </BaseButton>
  );
};
