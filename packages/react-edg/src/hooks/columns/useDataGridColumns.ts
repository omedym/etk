import { getColumnsFromColumnBuilders } from '@datagrid/utils/column-builders';
import { getColumnsWithQuerySorting } from '@datagrid/utils/columns';
import { useUpdateEffect } from 'ahooks';
import { cloneDeep } from 'lodash';
import { useMemo, useState } from 'react';

import type { BaseColumn } from '@datagrid/column-builders';
import type { DataGridColumn, TableData } from '@datagrid/types';

type UseDataGridColumnsArgs<TData extends TableData> = {
  columnBuilders: BaseColumn<TData>[];
  initialSortQueryParams: string[];
};

type UseDataGridColumnsReturn<TData extends TableData> = {
  columns: DataGridColumn<TData>[];
  defaultColumns: DataGridColumn<TData>[];
  visibleColumns: DataGridColumn<TData>[];
  columnToFieldMap: Record<string, string>;
  setColumns: (value: DataGridColumn<TData>[]) => void;
};

export const useDataGridColumns = <TData extends TableData>({
  columnBuilders,
  initialSortQueryParams,
}: UseDataGridColumnsArgs<TData>): UseDataGridColumnsReturn<TData> => {
  const defaultColumns: DataGridColumn<TData>[] = useMemo(
    () => getColumnsFromColumnBuilders(cloneDeep(columnBuilders)),
    [columnBuilders],
  );

  const columnsWithInitialSorting: DataGridColumn<TData>[] = useMemo(() => {
    if (!initialSortQueryParams.length) {
      return [...defaultColumns];
    }

    return getColumnsWithQuerySorting(initialSortQueryParams, cloneDeep(columnBuilders));
  }, [initialSortQueryParams, columnBuilders]);

  const [columns, setColumns] = useState<DataGridColumn<TData>[]>(columnsWithInitialSorting);

  useUpdateEffect(() => {
    /* Added flow to reset filters data on parent re-fetch */
    const updatedColumns = columns.map((column) => {
      const defaultColumn = defaultColumns.find((defaultColumn) => defaultColumn.key === column.key);

      return {
        ...column,
        filter: defaultColumn?.filter,
      };
    });

    setColumns(updatedColumns);
  }, [defaultColumns]);

  const visibleColumns = useMemo(() => columns.filter((column) => !column.hidden), [columns]);

  const columnToFieldMap = useMemo(() => {
    return columnBuilders.reduce((fieldsMap, builder) => {
      const column = builder.getColumn();

      return {
        ...fieldsMap,
        [column.key]: column.nodeField ?? column.dataIndex,
      };
    }, {});
  }, [columnBuilders]);

  return {
    columns,
    defaultColumns,
    setColumns,
    visibleColumns,
    columnToFieldMap,
  };
};
