import { CONTEXT_MENU_COLUMN_CLASS } from '@datagrid/constants';
import styled from 'styled-components';

const CONTEXT_MENU_PADDING = 8;

const Wrapper = styled.div<{ clickable?: boolean }>`
  tbody tr {
    cursor: ${({ clickable }) => (clickable ? 'pointer' : 'default')};
  }

  tbody > tr:hover > td {
    background: ${({ theme }) => theme.token.background.layout} !important;
  }

  .${CONTEXT_MENU_COLUMN_CLASS} {
    padding-left: ${CONTEXT_MENU_PADDING}px !important;
    padding-right: ${CONTEXT_MENU_PADDING}px !important;
  }
`;

export const Styled = {
  Wrapper,
};
