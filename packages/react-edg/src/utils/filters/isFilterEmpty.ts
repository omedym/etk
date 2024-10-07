import { isEmpty, isNil, isObject, isString } from 'lodash';

export const isFilterEmpty = (filterValue: unknown): boolean => {
  if (isObject(filterValue) || isString(filterValue)) {
    return isEmpty(filterValue);
  }

  return isNil(filterValue);
};
