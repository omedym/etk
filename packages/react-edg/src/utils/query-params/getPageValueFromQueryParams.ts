export function getPageValueFromQueryParams(queryParams: Record<string, string>, key: string): number {
  const currentPage = queryParams[key];

  return currentPage ? Number(currentPage) : 1;
}
