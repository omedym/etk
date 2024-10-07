import { Badge } from 'antd';

import { Styled } from './ViewModeButton.styles';

import type { ButtonProps } from 'antd';
import type { FC } from 'react';

interface ViewModeButtonProps extends ButtonProps {
  isActive?: boolean;
}

export const ViewModeButton: FC<ViewModeButtonProps> = ({ isActive, children, ...rest }) => {
  return (
    <Badge dot={isActive} offset={[-5, 5]} color="blue">
      <Styled.Button isActive={isActive} {...rest}>
        {children}
      </Styled.Button>
    </Badge>
  );
};
