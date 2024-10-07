import { Input } from 'antd';
import styled from 'styled-components';

const SearchInput = styled(Input)`
  input {
    color: ${({ theme }) => theme.token.primary.base};
  }
`;

export const Styled = { SearchInput };
