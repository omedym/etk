import type { SVGProps } from 'react';

export const FilterBarIcon = <T extends SVGSVGElement>(props: SVGProps<T>): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" {...props}>
    <path d="M24 3.5c0 .83-.67 1.5-1.5 1.5h-21C.67 5 0 4.33 0 3.5S.67 2 1.5 2h21c.83 0 1.5.67 1.5 1.5ZM14.5 20h-5c-.83 0-1.5.67-1.5 1.5S8.67 23 9.5 23h5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5Zm4-9h-13c-.83 0-1.5.67-1.5 1.5S4.67 14 5.5 14h13c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5Z" />
  </svg>
);
