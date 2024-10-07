import styled from 'styled-components';

const Cover = styled.div`
  padding-top: 56.25%;
  border-radius: 6px 6px 0 0;
`;

const CoverImage = styled(Cover)<{ src?: string }>`
  background-image: ${({ src }) => `url(${src})`};
  background-position: top;
  background-size: cover;
`;

const CoverIcon = styled(Cover)<{ background?: string }>`
  background: ${({ background, theme }) => background ?? theme.token.text.quaternary};
  position: relative;

  > div {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

export const Styled = {
  CoverImage,
  CoverIcon,
};
