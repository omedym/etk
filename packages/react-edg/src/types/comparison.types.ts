export enum ComparisonOperatorEnum {
  in = 'in',
  like = 'iLike',
  is = 'is',
  gte = 'gte',
  lte = 'lte',
  between = 'between',
}

export enum DateRangeComparisonEnum {
  lower = 'lower',
  upper = 'upper',
}

type DateRangeFilter = {
  [key in DateRangeComparisonEnum]?: string;
};

export type ComparisonFilter = Record<
  string,
  {
    [key in ComparisonOperatorEnum]?: string | string[] | boolean | DateRangeFilter;
  }
>;
