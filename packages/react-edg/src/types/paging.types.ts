import type { TablePaginationConfig as AntdTablePaginationConfig } from 'antd';

export type Paging = {
  first: number;
  after?: string;
};

export type TablePaginationConfig = AntdTablePaginationConfig;
