export const flattenObject = (obj: Record<string, any>, prefix = ''): Record<string, string> => {
  let result: Record<string, any> = {};

  Object.keys(obj).forEach((key) => {
    const currentPrefix = prefix ? `${prefix}.${key}` : key;

    if (typeof obj[key] === 'object' && obj[key] !== null) {
      if (Array.isArray(obj[key])) {
        // If the value is an array, use original value
        result[currentPrefix] = obj[key];
      } else {
        // If the value is an object, recursively flatten it
        const deeper = flattenObject(obj[key], currentPrefix);
        result = { ...result, ...deeper };
      }
    } else {
      result[currentPrefix] = obj[key]?.toString();
    }
  });

  return result;
};
