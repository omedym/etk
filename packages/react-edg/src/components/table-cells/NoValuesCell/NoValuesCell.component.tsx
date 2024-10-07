import { Styled } from './NoValuesCell.styles';

import type { NoValuesCellProps } from './NoValuesCell.types';

export const NoValuesCell: React.FC<NoValuesCellProps> = ({ children, color, style }) => {
  return (
    <Styled.Container color={color} style={style}>
      {children ?? '\u25cb'}
    </Styled.Container>
  );
};
