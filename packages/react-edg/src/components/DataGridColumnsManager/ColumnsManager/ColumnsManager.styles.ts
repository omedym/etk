import styled from 'styled-components';

import type { DataGridTheme } from '@datagrid/theme/types';

const Container = styled.div`
  display: flex;
  gap: 32px;
`;

const LeftContent = styled.div`
  flex: 1;
`;

const RightContent = styled.div`
  flex: 1;
`;

const Label = styled.label<{ theme: DataGridTheme }>`
  color: ${({ theme }) => theme.token.text.secondary};
  font-size: 12px;
  display: block;
  margin-bottom: 10px;
`;

export const Styled = {
  Container,
  Label,
  LeftContent,
  RightContent,
};
