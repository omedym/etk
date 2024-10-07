import { DEFAULT_COLUMN_GROUP } from '@datagrid/constants';
import { getColumnsGroupedByCategory } from '@datagrid/utils/column-manager';
import { Space, Typography } from 'antd';
import { useMemo, useRef } from 'react';

import { Styled } from './GroupedColumns.styles';

import type { GroupedColumnsProps } from './GroupedColumns.types';
import type { DataGridColumnCheckboxValue, PinStatus } from '@datagrid/types';

export const GroupedColumns: React.FC<GroupedColumnsProps> = ({ columns, selectedColumns, onChange }) => {
  const columnsGroupedByCategory = useMemo(() => getColumnsGroupedByCategory(columns), [columns]);
  const selectedColumnsGroupedByCategory = useMemo(
    () => getColumnsGroupedByCategory(selectedColumns),
    [selectedColumns],
  );

  const sortedGroups = useMemo(() => {
    return Object.keys(columnsGroupedByCategory).sort((a, b) => {
      if (a === DEFAULT_COLUMN_GROUP) return 1;
      if (b === DEFAULT_COLUMN_GROUP) return -1;
      return a.localeCompare(b);
    });
  }, [columnsGroupedByCategory]);

  const initialGroupsCountRef = useRef(sortedGroups.length);

  const getUnselectedColumns = () => {
    const columnValues = columns.map(({ value }) => value);
    return selectedColumns.filter(({ value }) => !columnValues.includes(value));
  };

  const getNewlySelectedColumns = (checkedValues: DataGridColumnCheckboxValue[], currentGroup: string) => {
    const selectedColumnValues = new Set(selectedColumns.map(({ value }) => value));

    const columnValues = columns.filter(({ value, group }) => {
      if (group === currentGroup) {
        return checkedValues.includes(value);
      }

      return selectedColumnValues.has(value);
    });

    // if we already have the values selected, we should keep its pinned status
    return columnValues.map((column) => {
      if (selectedColumnValues.has(column.value)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return selectedColumns.find(({ value }) => value === column.value)!;
      }

      return { ...column, pinned: false as PinStatus };
    });
  };

  const onSelectedColumnsChange = (checkedValues: DataGridColumnCheckboxValue[], currentGroup: string) => {
    const unselectedColumns = getUnselectedColumns();
    const newlySelectedColumns = getNewlySelectedColumns(checkedValues, currentGroup);

    onChange([...newlySelectedColumns, ...unselectedColumns]);
  };

  return (
    <Space direction="vertical" size="middle">
      {sortedGroups.map((group) => (
        <Space key={group} direction="vertical">
          {initialGroupsCountRef.current > 1 && (
            <Typography.Text key={group} type="secondary">
              {group}
            </Typography.Text>
          )}
          <Styled.CheckboxGroup
            name={group}
            options={columnsGroupedByCategory[group]}
            value={selectedColumnsGroupedByCategory[group]?.map(({ value }) => value)}
            onChange={(checkedValues) => onSelectedColumnsChange(checkedValues, group)}
          />
        </Space>
      ))}
    </Space>
  );
};
