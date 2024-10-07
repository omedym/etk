import { useColumnsManagerSort } from '@datagrid/hooks/column-manager';
import { useDataGridTheme } from '@datagrid/theme/hooks';
import { Input } from 'antd';
import { useMemo } from 'react';

import { GroupedColumns } from '../GroupedColumns';
import { SelectedColumns } from '../SelectedColumns';
import { StyledSortableContainer } from '../SortableContainer';
import { StyledSortableItem } from '../SortableItem';

import { Styled } from './ColumnsManager.styles';

import type { ColumnsManagerProps } from './ColumnsManager.types';

export const ColumnsManager: React.FC<ColumnsManagerProps> = ({
  columns,
  searchValue,
  selectedColumns,
  onSearchChange,
  setSelectedColumns,
}) => {
  const {
    leftPinnedColumns,
    unpinnedColumns,
    rightPinnedColumns,
    onLeftPinnedSort,
    onUnpinnedSort,
    onRightPinnedSort,
    onPinnedChange,
    orderPinnedColumns,
  } = useColumnsManagerSort({ selectedColumns, setSelectedColumns });
  const theme = useDataGridTheme();

  const pinnedColumnsSize: [number, number] = [leftPinnedColumns.length, rightPinnedColumns.length];

  const filteredColumns = useMemo(() => {
    return columns.filter(({ label }) =>
      // Retain optional chaining to ensure that if the column lacks a title, column will be invisible
      (label as string)?.toLocaleLowerCase().includes(searchValue.toLocaleLowerCase()),
    );
  }, [columns, searchValue]);

  return (
    <Styled.Container>
      <Styled.LeftContent>
        <Input.Search
          placeholder="Search for column"
          allowClear
          style={{ marginBottom: 10 }}
          value={searchValue}
          onChange={({ target }) => onSearchChange(target.value)}
        />
        <GroupedColumns
          selectedColumns={selectedColumns}
          columns={filteredColumns ?? columns}
          onChange={(newSelectedColumns) => setSelectedColumns(orderPinnedColumns(newSelectedColumns))}
        />
      </Styled.LeftContent>

      <Styled.RightContent>
        <Styled.Label theme={theme}>Selected Columns ({selectedColumns.length})</Styled.Label>

        <StyledSortableContainer.Container>
          <StyledSortableItem.SelectedColumn>Name</StyledSortableItem.SelectedColumn>

          {leftPinnedColumns.length ? (
            <SelectedColumns
              selectedColumns={leftPinnedColumns}
              setSelectedColumns={onLeftPinnedSort}
              onPinnedChange={onPinnedChange('left')}
              pinnedColumnsSize={pinnedColumnsSize}
            />
          ) : null}

          <SelectedColumns
            selectedColumns={unpinnedColumns}
            setSelectedColumns={onUnpinnedSort}
            onPinnedChange={onPinnedChange(false)}
            pinnedColumnsSize={pinnedColumnsSize}
          />

          {rightPinnedColumns.length ? (
            <SelectedColumns
              selectedColumns={rightPinnedColumns}
              setSelectedColumns={onRightPinnedSort}
              onPinnedChange={onPinnedChange('right')}
              pinnedColumnsSize={pinnedColumnsSize}
            />
          ) : null}
        </StyledSortableContainer.Container>
      </Styled.RightContent>
    </Styled.Container>
  );
};
