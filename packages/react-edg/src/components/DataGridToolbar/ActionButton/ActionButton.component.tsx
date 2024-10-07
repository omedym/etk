import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Tooltip } from 'antd';

import { BaseButton } from '../BaseButton';

import { Styled } from './ActionButton.styles';

import type { ActionButton as ActionButtonProps } from '@datagrid/types';
import type { ButtonProps } from 'antd';
import type { FC } from 'react';

export const ActionButton: FC<ActionButtonProps> = ({ label, faIcon, items, tooltip, ...props }) => {
  const isDropdown = Boolean(items);
  const buttonProps: ButtonProps = {
    ...props,
    type: 'primary',
    variant: 'solid',
    ...(faIcon ? { icon: <FontAwesomeIcon icon={faIcon} /> } : {}),
  };

  if (isDropdown) {
    return (
      <Tooltip title={tooltip}>
        <Styled.DropdownButton
          menu={{ items }}
          icon={<FontAwesomeIcon icon={faChevronDown} size="sm" />}
          {...buttonProps}
        >
          {label}
        </Styled.DropdownButton>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={tooltip}>
      <BaseButton {...buttonProps}>{label}</BaseButton>
    </Tooltip>
  );
};
