/**
 * Function to decode URI component preventing errors like when using the `%` character.
 * Ref: https://stackoverflow.com/a/54310080
 * @param value - value to decode
 * @returns - value decoded
 */
export const decodeURIComponentSafe = (value: string): string => {
  return decodeURIComponent(value.replace(/%(?![0-9][0-9a-fA-F]+)/g, '%25'));
};
