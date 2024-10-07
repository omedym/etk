import { Button, Typography } from 'antd';
import styled from 'styled-components';

const Title = styled(Typography.Title)`
  margin-bottom: 0 !important;
`;

const ResetButton = styled(Button)`
  font-size: 10px;
  height: auto;
  width: auto !important;
  padding: 2px 4px !important;
  margin-top: 4px;
`;

export const Styled = { ResetButton, Title };
