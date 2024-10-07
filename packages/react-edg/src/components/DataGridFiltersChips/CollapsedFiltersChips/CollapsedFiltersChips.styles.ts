import { Space } from 'antd';
import styled from 'styled-components';

const Container = styled(Space)`
  width: 100%;

  .ant-tag {
    margin: 0 !important;
  }

  .ant-btn {
    display: flex;
    flex-direction: row-reverse;
    align-items: center;
    gap: 0.25rem;
    padding: 4px 8px;
  }
`;

export const Styled = {
  Container,
};
