import { Space as AntdSpace, Typography } from 'antd';
import styled from 'styled-components';

const Space = styled(AntdSpace)<{ itemWidth?: string }>`
  width: 100%;

  .ant-space-item > div:not(.icon) {
    width: ${({ itemWidth }) => itemWidth ?? '100%'};
  }

  /* For showing blue color on selected item */
  .ant-select-arrow,
  .ant-select-selection-item {
    color: ${({ theme }) => theme.token.primary.base};
  }
`;

const Label = styled(Typography.Text)`
  font-size: 12px;
`;

const LabelIcon = styled.div`
  cursor: pointer;
  svg {
    color: ${({ theme }) => theme.token.text.tertiary};
  }
`;

export const Styled = { Space, Label, LabelIcon };
