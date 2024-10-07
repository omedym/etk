import { usePaginationPageStyle } from '@datagrid/hooks/styles';

import type { TablePaginationConfig } from '@datagrid/types';

type UsePagination = (args: {
  total: number | undefined;
  paging: TablePaginationConfig;
  initialPageQueryParams: number;
}) => TablePaginationConfig;

export const usePagination: UsePagination = ({ total, paging, initialPageQueryParams }) => {
  const getPageStyles = usePaginationPageStyle(paging.current);

  const format = (value = 0) => Intl.NumberFormat().format(value);

  const showTotal = (pagesTotal: number, range: number[]) => {
    const start = range[1] > paging.pageSize! - 1 ? `${format(range[0])}-` : '';
    const rangeStr = `${start}${format(range[1])}`;

    return (
      <span>
        Showing {rangeStr} of {format(pagesTotal)}
      </span>
    );
  };

  const pagination: TablePaginationConfig = {
    total,
    showTotal,
    current: paging.current,
    pageSize: paging.pageSize,
    defaultCurrent: initialPageQueryParams,
    showQuickJumper: false,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '30'],
    size: 'small',
    itemRender: (page, type, originalElement) => {
      return type === 'page' ? <span style={getPageStyles(page)}>{format(page)}</span> : originalElement;
    },
  };

  return pagination;
};
