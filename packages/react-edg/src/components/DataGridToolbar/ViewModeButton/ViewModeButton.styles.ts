import styled, { css } from 'styled-components';

import { BaseButton } from '../BaseButton';

const Button = styled(BaseButton)<{ isActive?: boolean }>`
  ${({ isActive }) =>
    isActive &&
    css`
      color: ${({ theme }) => theme.token.text.base};
      background: ${({ theme }) => theme.token.background.layout};
    `}
`;

export const Styled = { Button };
