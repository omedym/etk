import { Card as AntdCard } from 'antd';
import styled from 'styled-components';

const Card = styled(AntdCard)<{ clickable: boolean }>`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 0;

  &:hover {
    background: ${({ theme }) => theme.token.background.layout};
    cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
    transition: background 0.3s ease-in-out;

    .cardTitle__title {
      color: ${({ theme }) => theme.token.primary.base};
      transition: color 0.3s ease-in-out;
    }
  }

  .ant-card-head {
    min-height: 36px;
    display: flex;
    align-items: center;
  }

  .ant-card-cover {
    padding: 1px;
  }

  .ant-card-body {
    flex: 1;
    padding: 14px;
  }

  .ant-card-head-title {
    padding: 0;
  }

  .ant-card-head-wrapper {
    width: 100%;
  }

  .ant-checkbox-wrapper {
    position: absolute;
    top: 10px;
    right: 10px;
  }
`;

const CardTitleContainer = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 4px;
  font-size: 14px;
`;

export const Styled = { Card, CardTitleContainer };
