import type { DataGridViewSelectProps } from '../DataGridViewSelect';
import type { TableData, ViewConfig } from '@datagrid/types';

export interface DataGridHeaderProps<TData extends TableData>
  extends Omit<DataGridViewSelectProps<TData>, 'viewsConfig'> {
  viewsConfig?: ViewConfig[];
  title?: string;
  resetToDefault: () => void;
}
