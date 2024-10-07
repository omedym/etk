import { Tag as AntdTag } from 'antd';
import styled from 'styled-components';

const Tag = styled(AntdTag)`
  background-color: ${({ theme }) => theme.token.background.primary};
  color: ${({ theme }) => theme.token.primary.base};
  border: none;
  padding: 2px 6px;

  .ant-tag-close-icon {
    color: ${({ theme }) => theme.token.primary.base};

    &:hover {
      color: ${({ theme }) => theme.token.primary.hover};
    }
  }
`;

export const Styled = {
  Tag,
};
