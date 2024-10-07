import type {
  DataGridColumn,
  DataGridFilter,
  DataGridFiltersType,
  DataGridView,
  SorterResult,
  TableData,
  ViewConfig,
} from '@datagrid/types';

export class ConfigToViewAdapter<TData extends TableData> {
  private viewConfig: ViewConfig;

  constructor(viewConfig: ViewConfig) {
    this.viewConfig = viewConfig;
  }

  private getPinnedFilters(): React.Key[] {
    const {
      value: { filters },
    } = this.viewConfig;

    return filters.reduce<React.Key[]>((keys, filterConfig) => {
      if (filterConfig.pinned) {
        return [...keys, filterConfig.key];
      }

      return keys;
    }, []);
  }

  private getViewColumns(columnsMap: Record<string, DataGridColumn<TData>>): DataGridColumn<TData>[] {
    const {
      value: { columns },
    } = this.viewConfig;

    return columns.map<DataGridColumn<TData>>((columnConfig) => {
      const column = columnsMap[columnConfig.key];

      return {
        ...column,
        defaultSortOrder: columnConfig.sortOrder ?? null,

        fixed: columnConfig.pinned,
        hidden: !columnConfig.visible,
      };
    });
  }

  private getViewSorting(columnsMap: Record<string, DataGridColumn<TData>>): SorterResult<TData>[] {
    const {
      value: { columns },
    } = this.viewConfig;

    return columns.reduce<SorterResult<TData>[]>((sorting, column) => {
      if (!column.sortOrder) {
        return sorting;
      }

      const { dataIndex, key } = columnsMap[column.key];

      return [
        ...sorting,
        {
          columnKey: key,
          field: dataIndex ?? key,
          order: column.sortOrder,
        },
      ];
    }, []);
  }

  private getViewFilters(filtersMap: Record<string, DataGridFilter>): DataGridFiltersType {
    const {
      value: { filters },
    } = this.viewConfig;

    return filters.reduce<DataGridFiltersType>((viewFilters, filterConfig) => {
      if (!filterConfig.value) {
        return viewFilters;
      }

      return {
        ...viewFilters,
        [filterConfig.key]: {
          value: filterConfig.value,
          comparisonFn: filtersMap[filterConfig.key].comparisonFn,
        },
      };
    }, {});
  }

  toDataGridView(
    columnsMap: Record<string, DataGridColumn<TData>>,
    filtersMap: Record<string, DataGridFilter>,
  ): DataGridView<TData> {
    const { key } = this.viewConfig;

    return {
      key,
      columns: this.getViewColumns(columnsMap),
      selectedFilters: this.getViewFilters(filtersMap),
      pinnedFilters: this.getPinnedFilters(),
      sorting: this.getViewSorting(columnsMap),
    };
  }
}
