import { Button } from 'antd';
import styled, { css } from 'styled-components';

import type { ButtonProps } from 'antd';

export const BASE_BUTTON_FONT_SIZE = 13;

export const BASE_BUTTON_STYLES = css`
  font-size: ${BASE_BUTTON_FONT_SIZE}px;
  height: auto;
  padding: 4px 8px;
`;

export const BaseButton = styled(Button).attrs(({ type = 'text' }) => ({ type }) as ButtonProps)`
  ${BASE_BUTTON_STYLES}
`;
