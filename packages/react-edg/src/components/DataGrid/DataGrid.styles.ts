import { Space as DefaultSpace } from 'antd';
import styled from 'styled-components';

import type { SpaceProps } from 'antd';

const Container = styled.div`
  display: flex;
  max-width: 100%;
`;

const Content = styled.div<{ panelSize: number }>`
  width: ${({ panelSize }) => `calc(100% - ${panelSize}px)`};
  max-width: ${({ panelSize }) => `calc(100% - ${panelSize}px)`};
`;

const RightPanel = styled.div<{ width: number }>`
  position: relative;
  display: ${({ width: isVisible }) => (isVisible ? 'block' : 'none')};
  flex: ${({ width }) => `0 0 ${width}px`};
  right: -32px;
`;

const CardGridWrapper = styled.div`
  margin-top: 1rem;
`;

const Space = styled(DefaultSpace).attrs(
  () =>
    ({
      direction: 'vertical',
      style: { width: '100%' },
    }) as SpaceProps,
)``;

export const Styled = {
  Container,
  Content,
  RightPanel,
  CardGridWrapper,
  Space,
};
