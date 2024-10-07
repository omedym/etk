export function getViewKeyFromQueryParams(queryParams: Record<string, any>, key: string): string {
  const viewKey = queryParams[key];

  return viewKey ?? '';
}
