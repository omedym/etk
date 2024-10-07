import { Typography } from 'antd';
import styled from 'styled-components';

const CardTitle = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

const StatusContainer = styled.span`
  svg {
    font-size: 8px;
  }
`;

const TypeContainer = styled.span`
  svg {
    font-size: 12px;
  }
`;

const Title = styled(Typography.Title)`
  font-size: 14px !important;
  margin-bottom: 0 !important;
  margin-top: 3px;
`;

export const Styled = { Title, CardTitle, StatusContainer, TypeContainer };
