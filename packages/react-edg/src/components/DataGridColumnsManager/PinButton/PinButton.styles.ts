import { Button } from 'antd';
import styled, { css } from 'styled-components';

const ActiveStyles = css`
  svg {
    color: ${({ theme }) => theme.token.primary.base} !important;
  }
`;

const PinButton = styled(Button)<{ isActive: boolean }>`
  ${({ isActive }) => isActive && ActiveStyles};
`;

export const Styled = { PinButton };
