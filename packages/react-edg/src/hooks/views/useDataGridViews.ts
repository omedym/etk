import { ConfigToViewAdapter } from '@datagrid/services/views';
import { has } from 'lodash';
import { useMemo } from 'react';

import type {
  DataGridColumn,
  DataGridFilter,
  DataGridView,
  TableData,
  ViewConfig,
  ViewSelectOption,
} from '@datagrid/types';

type UseDataGridViewsArgs<TData> = {
  viewsConfig: ViewConfig[];
  defaultViewKey?: string;
  filtersMap: Record<string, DataGridFilter>;
  columns: DataGridColumn<TData>[];
};

type UseDataGridViewsReturn<TData extends TableData> = {
  viewSelectOptions: ViewSelectOption[];
  defaultViewKey: string;
  dataGridViewsMap: Record<string, DataGridView<TData>>;
};

export const useDataGridViews = <TData extends TableData>({
  viewsConfig,
  defaultViewKey: _defaultViewKey,
  columns,
  filtersMap,
}: UseDataGridViewsArgs<TData>): UseDataGridViewsReturn<TData> => {
  const dataGridViewsMap = useMemo(() => {
    const columnsMap = columns.reduce<Record<string, DataGridColumn<TData>>>(
      (acc, column) => ({
        ...acc,
        [column.key]: column,
      }),
      {},
    );

    return viewsConfig.reduce<Record<string, DataGridView<TData>>>(
      (views, view) => ({
        ...views,
        [view.key]: new ConfigToViewAdapter<TData>(view).toDataGridView(columnsMap, filtersMap),
      }),
      {},
    );
  }, [viewsConfig, filtersMap, columns]);

  const viewSelectOptions = useMemo(
    () =>
      viewsConfig.map((view) => ({
        key: view.key,
        label: view.label,
        value: view.key,
      })),
    [viewsConfig],
  );

  const defaultViewKey = useMemo(() => {
    const firstViewKey = viewsConfig[0].key;

    if (_defaultViewKey) {
      return has(dataGridViewsMap, _defaultViewKey) ? _defaultViewKey : firstViewKey;
    }

    return firstViewKey;
  }, [_defaultViewKey, dataGridViewsMap]);

  return {
    viewSelectOptions,
    defaultViewKey,
    dataGridViewsMap,
  };
};
