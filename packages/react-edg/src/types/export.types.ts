import type { DocumentNode } from '@apollo/client';

export type DataExportHandler<TData> = (
  query: DocumentNode,
  variables: Record<string, any>,
  excludeKeys?: (keyof TData)[],
) => Promise<any>;
