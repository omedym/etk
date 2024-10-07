import { cloneDeep } from 'lodash';
import { useCallback, useMemo } from 'react';

import type { DataGridColumnCheckboxOption, PinStatus } from '@datagrid/types';
import type { Dispatch, SetStateAction } from 'react';

type OnPinSortFunc = (newPinned: DataGridColumnCheckboxOption[]) => void;
type OnPinnedChange = (pinStatus: PinStatus) => (index: number, pinned: PinStatus) => void;
type UseColumnsManagerSort = (params: {
  selectedColumns: DataGridColumnCheckboxOption[];
  setSelectedColumns: Dispatch<SetStateAction<DataGridColumnCheckboxOption[]>>;
}) => {
  leftPinnedColumns: DataGridColumnCheckboxOption[];
  unpinnedColumns: DataGridColumnCheckboxOption[];
  rightPinnedColumns: DataGridColumnCheckboxOption[];
  onLeftPinnedSort: OnPinSortFunc;
  onUnpinnedSort: OnPinSortFunc;
  onRightPinnedSort: OnPinSortFunc;
  onPinnedChange: OnPinnedChange;
  orderPinnedColumns: (columns: DataGridColumnCheckboxOption[]) => DataGridColumnCheckboxOption[];
};

export const useColumnsManagerSort: UseColumnsManagerSort = ({ selectedColumns, setSelectedColumns }) => {
  const sortPinnedColumns = useCallback(
    (columns: DataGridColumnCheckboxOption[]) =>
      columns.reduce<[DataGridColumnCheckboxOption[], DataGridColumnCheckboxOption[], DataGridColumnCheckboxOption[]]>(
        (prevColumns, column) => {
          const [leftPinned, unpinned, rightPinned] = prevColumns;
          if (!column.pinned) {
            const newUnpinned = [...unpinned, column];
            return [leftPinned, newUnpinned, rightPinned];
          }

          if (column.pinned === 'left') {
            const newLeftPinned = [...leftPinned, column];
            return [newLeftPinned, unpinned, rightPinned];
          }

          const newRightPinned = [...rightPinned, column];
          return [leftPinned, unpinned, newRightPinned];
        },
        [[], [], []],
      ),
    [],
  );

  const [leftPinnedColumns, unpinnedColumns, rightPinnedColumns] = useMemo(
    () => sortPinnedColumns(selectedColumns),
    [selectedColumns, sortPinnedColumns],
  );

  const onLeftPinnedSort: OnPinSortFunc = (newPinned) => {
    setSelectedColumns([...newPinned, ...unpinnedColumns, ...rightPinnedColumns]);
  };

  const onRightPinnedSort: OnPinSortFunc = (newPinned) => {
    setSelectedColumns([...leftPinnedColumns, ...unpinnedColumns, ...newPinned]);
  };

  const onUnpinnedSort: OnPinSortFunc = (newUnpinned) => {
    setSelectedColumns([...leftPinnedColumns, ...newUnpinned, ...rightPinnedColumns]);
  };

  const orderPinnedColumns = (columns: DataGridColumnCheckboxOption[]): DataGridColumnCheckboxOption[] => {
    const [leftPinned, sortedUnpinned, rightPinned] = sortPinnedColumns(columns);
    return [...leftPinned, ...sortedUnpinned, ...rightPinned];
  };

  const onPinnedChange: OnPinnedChange = (pinStatus) => (index, pinned) => {
    const unmutedLeft = cloneDeep(leftPinnedColumns);
    const unmutedUnpinned = cloneDeep(unpinnedColumns);
    const unmutedRight = cloneDeep(rightPinnedColumns);

    if (pinStatus === 'left') {
      unmutedLeft[index].pinned = pinned;
    } else if (pinStatus === 'right') {
      unmutedRight[index].pinned = pinned;
    } else {
      unmutedUnpinned[index].pinned = pinned;
    }

    setSelectedColumns(orderPinnedColumns([...unmutedLeft, ...unmutedUnpinned, ...unmutedRight]));
  };

  return {
    leftPinnedColumns,
    unpinnedColumns,
    rightPinnedColumns,
    onLeftPinnedSort,
    onUnpinnedSort,
    onRightPinnedSort,
    onPinnedChange,
    orderPinnedColumns,
  };
};
