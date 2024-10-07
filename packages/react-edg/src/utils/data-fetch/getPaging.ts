import { Buffer } from 'buffer';

import type { Paging, TablePaginationConfig } from '@datagrid/types';

export function getPaging({ pageSize = 10, current }: TablePaginationConfig): Paging {
  return {
    first: pageSize,
    // do not send after parameter on first page
    ...(current !== 1
      ? { after: Buffer.from(`arrayconnection:${pageSize * (current! - 1) - 1}`).toString('base64') }
      : {}),
  };
}
