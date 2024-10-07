import { Row } from 'antd';

import { PinnedFilters } from './PinnedFilters';

import type { DataGridFiltersToolbarProps } from './DataGridFiltersToolbar.types';

export const DataGridFiltersToolbar: React.FC<DataGridFiltersToolbarProps> = ({ onSelectedFiltersChange }) => {
  return (
    <Row align="bottom" gutter={[8, 8]}>
      <PinnedFilters onSelectedFiltersChange={onSelectedFiltersChange} />
    </Row>
  );
};
