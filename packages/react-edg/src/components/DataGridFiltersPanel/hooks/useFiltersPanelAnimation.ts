import { useDataGridTheme } from '@datagrid/theme/hooks';
import { useSpring } from '@react-spring/web';
import { useSize } from 'ahooks';
import { useMemo } from 'react';

import type { FiltersPanelAnimation } from '@datagrid/types';

type UseFiltersPanelAnimationParams = {
  isOpen: boolean;
  containerWidth: number;
};

type UseFiltersPanelAnimation = (params: UseFiltersPanelAnimationParams) => FiltersPanelAnimation;

export const useFiltersPanelAnimation: UseFiltersPanelAnimation = ({ containerWidth, isOpen }) => {
  const { width: screenWidth = 0 } = useSize(document.querySelector('body')) ?? {};
  const { breakpoint } = useDataGridTheme();

  const springStyles = useMemo(() => {
    const isTablet = screenWidth <= breakpoint.tablet;
    const panelWidth = isTablet ? screenWidth : containerWidth;

    return {
      from: { width: 0, opacity: 0 },
      to: { width: isOpen ? panelWidth : 0, opacity: isOpen ? 1 : 0 },
    };
  }, [screenWidth, containerWidth, isOpen]);

  const animatedStyles = useSpring(springStyles);

  return animatedStyles;
};
