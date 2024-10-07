import { Styled } from './CardCover.styles';

import type { CardCoverProps } from './CardCover.types';

export const CardCover: React.FC<CardCoverProps> = ({ url, icon, backgroundColor, style }) => {
  if (url) {
    return <Styled.CoverImage src={url} style={style} />;
  }

  if (icon) {
    return (
      <Styled.CoverIcon background={backgroundColor}>
        <div>{icon}</div>
      </Styled.CoverIcon>
    );
  }

  return <Styled.CoverImage />;
};
