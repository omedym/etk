import styled from 'styled-components';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  grid-gap: 1rem;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const GridItem = styled.div`
  display: flex;
`;

export const Styled = {
  Grid,
  GridItem,
};
