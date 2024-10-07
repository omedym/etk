export type DataGridContextMenuItem<TData> = {
  label: React.ReactNode;
  icon?: React.ReactNode;
  hidden?: boolean;
  disabled?: boolean;
  action?: (data: TData) => void;
};

export type ContextMenuConfig<TData> = {
  /** Hide context menu */
  hidden?: boolean;
  loading?: boolean;
  /** Context menu items configuration */
  getItems?: (data: TData) => DataGridContextMenuItem<TData>[];
};
