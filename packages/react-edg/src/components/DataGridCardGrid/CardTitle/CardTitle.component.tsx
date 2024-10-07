import { Styled } from './CardTitle.styles';

import type { CardTitleProps } from './CardTitle.types';

export const CardTitle: React.FC<CardTitleProps> = ({ icon, status, title }) => {
  return (
    <Styled.CardTitle>
      {status && <Styled.StatusContainer>{status}</Styled.StatusContainer>}
      {icon && <Styled.TypeContainer>{icon}</Styled.TypeContainer>}
      <Styled.Title className="cardTitle__title">{title}</Styled.Title>
    </Styled.CardTitle>
  );
};
