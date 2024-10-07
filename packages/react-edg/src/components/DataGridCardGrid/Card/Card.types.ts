import type { ContextMenuConfig, CardItemConfig, TableData } from '@datagrid/types';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';

export interface CardProps<TData extends TableData> extends CardItemConfig<TData> {
  data: TData;
  checked?: boolean;
  contextMenu?: ContextMenuConfig<TData>;
  onSelect?: (e: CheckboxChangeEvent) => void;
  onClick?: (data: TData) => void;
}
