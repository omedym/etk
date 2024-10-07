import { FILTERS_PANEL } from '@datagrid/constants';
import { animated } from '@react-spring/web';
import styled from 'styled-components';

import type { AnimatedComponent } from '@react-spring/web';

const CONTENT_PADDING = '12px 24px';

const ButtonsContent = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${CONTENT_PADDING};
  border-top: 1px solid ${({ theme }) => theme.token.border.secondary};

  div {
    display: flex;
    gap: 8px;
  }
`;

const Container: AnimatedComponent<'div'> = styled(animated.div)`
  position: fixed;
  top: ${FILTERS_PANEL.headerHeight}px;
  bottom: 0;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.token.background.base};
  border-left: 1px solid ${({ theme }) => theme.token.border.secondary};
  z-index: ${FILTERS_PANEL.zIndex};

  @media only screen and (max-width: ${({ theme }) => theme.breakpoint.tablet}px) {
    top: 0;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${FILTERS_PANEL.headerHeight}px;
  padding: 12px 24px;
  font-weight: bold;
  font-size: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.token.border.secondary};
`;

const ChildrenContainer = styled.div`
  flex: 1;
  padding: ${CONTENT_PADDING};
  overflow: auto;
`;

export const Styled = {
  ButtonsContent,
  Container,
  Header,
  ChildrenContainer,
};
