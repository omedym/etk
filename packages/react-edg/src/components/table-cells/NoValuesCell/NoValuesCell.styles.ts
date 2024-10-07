import styled from 'styled-components';

const Container = styled.div<{ color?: string }>`
  font-size: smaller;
  text-transform: uppercase;
  color: ${({ color }) => color};
`;

export const Styled = {
  Container,
};
