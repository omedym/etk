import { useFilters } from '@datagrid/hooks/filters';
import { useSelectMode } from '@datagrid/hooks/selection';
import { useDataGridViews } from '@datagrid/hooks/views';
import { useDataGridTheme } from '@datagrid/theme/hooks';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Space, Dropdown } from 'antd';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';

import { Styled } from './DataGridViewSelect.styles';

import type { DataGridViewSelectProps } from './DataGridViewSelect.types';
import type { TableData } from '@datagrid/types';
import type { MenuProps } from 'antd';

export const DataGridViewSelect = <TData extends TableData>({
  selectedView,
  defaultViewKey: _defaultViewKey,
  viewsConfig,
  columns,
  querySorting,
  onViewChange,
  onViewInit,
}: DataGridViewSelectProps<TData>): JSX.Element => {
  const theme = useDataGridTheme();
  const { filtersMap, queryFilters } = useFilters();
  const { selectModeEnabled } = useSelectMode();
  const { defaultViewKey, viewSelectOptions, dataGridViewsMap } = useDataGridViews({
    defaultViewKey: _defaultViewKey,
    viewsConfig,
    filtersMap,
    columns,
  });

  const selectedViewKey = selectedView?.key;

  useEffect(() => {
    const view = dataGridViewsMap[defaultViewKey];
    let initialView = { ...view };

    if (!isEmpty(queryFilters)) {
      initialView = {
        ...initialView,
        selectedFilters: queryFilters,
      };
    }

    if (!isEmpty(querySorting)) {
      const columnsWithQuerySorting = initialView.columns.map((column) => {
        const defaultSortOrder = querySorting.find((sortRule) => sortRule.columnKey === column.key)?.order ?? null;
        return { ...column, defaultSortOrder };
      });

      initialView = {
        ...initialView,
        columns: columnsWithQuerySorting,
        sorting: querySorting,
      };
    }

    onViewInit?.(view, initialView);
  }, []);

  const changeView = (viewKey: string) => {
    const view = dataGridViewsMap[viewKey];
    onViewChange?.(view);
  };

  const items: MenuProps['items'] = viewSelectOptions.map(({ key, label, value }) => ({
    key,
    label,
    onClick: () => changeView(value),
    style: selectedViewKey === value ? { background: theme.token.background.info } : {},
  }));

  const selectedLabel = viewSelectOptions.find((option) => option.value === selectedViewKey)?.label;

  return (
    <Dropdown menu={{ items }} disabled={selectModeEnabled}>
      <Space align="baseline">
        <Styled.ViewTitle level={4}>{selectedLabel}</Styled.ViewTitle>
        <FontAwesomeIcon color={theme.token.text.quaternary} icon={faChevronDown} />
      </Space>
    </Dropdown>
  );
};
