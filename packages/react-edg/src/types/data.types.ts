export type TableData = Record<string, any>;

export interface PageInfo {
  hasNextPage: boolean;
  lastCursor: number;
  totalCount: number;
}

export interface DataResult<V> {
  data: V[];
  pageInfo?: PageInfo;
  totalCount?: number;
}
