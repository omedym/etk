export const getTextWidth = (text: string, font = 'Lexend'): number => {
  const canvas = document.createElement('canvas');

  const context = canvas.getContext('2d')!;
  context.font = font;

  return context.measureText(text).width;
};
