import type { DataGridProps } from '../DataGrid/DataGrid.types';
import type { DataGridColumn, TableData } from '@datagrid/types';
import type { TableProps } from 'antd';

export type DataGridTableProps<TData extends TableData> = TableProps<TData> &
  Pick<DataGridProps<TData>, 'onRowClick' | 'contextMenu'> & {
    columns: DataGridColumn<TData>[];
  };
