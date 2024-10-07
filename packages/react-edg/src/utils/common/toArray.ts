import { isArray, isNil } from 'lodash';

export const toArray = (value: any): any[] => {
  if (isArray(value)) {
    return value;
  }

  if (isNil(value)) {
    return [];
  }

  return [value];
};
