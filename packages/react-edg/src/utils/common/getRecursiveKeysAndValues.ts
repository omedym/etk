import { isArray, isObject } from 'lodash';

export const getRecursiveKeys = (obj: Record<string, any>, keyStr = ''): string[] => {
  return Object.entries(obj).map(([key, val]) => {
    const nestedPropStr = keyStr + (keyStr ? '.' : '') + key;
    if (isObject(val) && !isArray(val)) {
      return getRecursiveKeys(val, nestedPropStr)[0];
    }

    return nestedPropStr;
  });
};

export const getRecursiveValue = (obj: Record<string, any>, key: string): any => {
  if (key.includes('.')) {
    const splitKey = key.split(/\.(.*)/s);
    const [primaryKey, recursiveKeys] = splitKey;
    return getRecursiveValue(obj[primaryKey], recursiveKeys);
  }

  return obj[key];
};
