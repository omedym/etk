/**
 * Renders a whole number with commas as thousands separators.
 * @param x - The number to render.
 * @returns - The rendered number with commas.
 */
export const wholeNumberRenderer = (x: number): string => {
  const num = Math.floor(x);
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};
