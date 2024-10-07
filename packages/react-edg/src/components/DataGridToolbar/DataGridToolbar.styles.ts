import { Row, Col } from 'antd';
import styled from 'styled-components';

import type { DataGridTheme } from '@datagrid/theme/types';

const Toolbar = styled(Row)<{ theme: DataGridTheme }>`
  padding: 9px 8px;
  background-color: ${({ theme }) => theme.token.background.layout};
  border: solid 1px ${({ theme }) => theme.token.border.secondary};
  border-radius: 8px;
`;

const ToolbarSection = styled(Col)`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const Styled = { Toolbar, ToolbarSection };
