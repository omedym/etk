import type { DataResult, PageInfo } from '@datagrid/types';

interface EdgesWithNodesData<T> {
  edges: { node: T }[];
  pageInfo?: PageInfo;
  totalCount?: number;
}

export function extractDataFromEdges<T>(data: EdgesWithNodesData<T>): DataResult<T> {
  const result = {
    data: data.edges.map((edge) => edge.node),
    ...(data?.pageInfo ? { pageInfo: data?.pageInfo } : {}),
    ...(data?.totalCount ? { totalCount: data?.totalCount } : {}),
  };

  return result;
}
