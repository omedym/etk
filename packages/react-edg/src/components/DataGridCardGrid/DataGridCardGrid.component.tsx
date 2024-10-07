import { Pagination, Spin } from 'antd';

import { Card } from './Card';
import { Styled } from './DataGridCardGrid.styles';

import type { CardGridProps } from './DataGridCardGrid.types';
import type { TableData } from '@datagrid/types';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import type { ReactElement } from 'react';

export const DataGridCardGrid = <TData extends TableData>({
  rowKey = 'id',
  dataSource,
  CardItem,
  loading,
  pagination,
  rowSelection,
  contextMenu,
  onChange,
  onCardClick,
}: CardGridProps<TData>): ReactElement => {
  const onPaginationChange = (page: number, pageSize: number) => {
    onChange?.({ ...pagination, pageSize, current: page });
  };

  const getRowKey = (row: TData, index?: number): keyof TData => {
    return (typeof rowKey === 'function' ? rowKey(row, index) : rowKey) as keyof TData;
  };

  const onSelect =
    (data: TData) =>
    ({ target }: CheckboxChangeEvent) => {
      if (!rowSelection) {
        return;
      }

      const { selectedRowKeys = [], onChange: onRowSelect } = rowSelection;
      const key = getRowKey(data);

      const selectedItems = target.checked
        ? [...selectedRowKeys, data[key]] // check element
        : selectedRowKeys.filter((value) => value !== data[key]); // uncheck element

      onRowSelect?.(selectedItems, dataSource, { type: 'single' });
    };

  const renderCard = (data: TData) => {
    if (CardItem && !(typeof CardItem === 'object')) {
      return <CardItem {...data} />;
    }

    const key = getRowKey(data);
    const keySet = new Set(rowSelection?.selectedRowKeys);
    return (
      <Card
        data={data}
        checked={keySet.has(data[key])}
        contextMenu={contextMenu}
        onSelect={rowSelection && onSelect(data)}
        onClick={onCardClick}
        {...CardItem}
      />
    );
  };

  const getGridElementKey = (row: TData, index: number) => {
    const id = getRowKey(row, index);
    return `row-${row[id]}-${index}`;
  };

  return (
    <Spin spinning={loading}>
      <Styled.Grid>
        {dataSource.map((value, index) => (
          <Styled.GridItem key={getGridElementKey(value, index)}>{renderCard(value)}</Styled.GridItem>
        ))}
      </Styled.Grid>

      {pagination && <Pagination {...pagination} style={{ float: 'right' }} onChange={onPaginationChange} />}
    </Spin>
  );
};
