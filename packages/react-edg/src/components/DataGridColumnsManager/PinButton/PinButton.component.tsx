import { faThumbtack } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Dropdown } from 'antd';

import { Styled } from './PinButton.styles';
import { getPinIconProps } from './utils';

import type { PinButtonProps } from './PinButton.types';
import type { MenuProps } from 'antd';

export const PinButton: React.FC<PinButtonProps> = ({ pinStatus, pinColumnsSize, onPinnedChange }) => {
  const [leftPinnedLength, rightPinnedLength] = pinColumnsSize;

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'left',
      label: 'Pin to left',
      icon: <FontAwesomeIcon {...getPinIconProps('left')} />,
      onClick: () => onPinnedChange?.('left'),
      disabled: pinStatus === 'left' || leftPinnedLength >= 2,
    },
    {
      key: 'right',
      label: 'Pin to right',
      icon: <FontAwesomeIcon {...getPinIconProps('right')} />,
      onClick: () => onPinnedChange?.('right'),
      disabled: pinStatus === 'right' || rightPinnedLength >= 2,
    },
  ];

  return (
    <Dropdown
      menu={{
        items: pinStatus
          ? [
              ...dropdownItems,
              {
                key: 'unpin',
                label: 'Unpin',
                icon: <FontAwesomeIcon icon={faThumbtack} />,
                onClick: () => onPinnedChange?.(false),
              },
            ]
          : dropdownItems,
      }}
    >
      <Styled.PinButton
        size="small"
        isActive={Boolean(pinStatus)}
        icon={<FontAwesomeIcon size="sm" {...getPinIconProps(pinStatus)} />}
        variant="text"
      />
    </Dropdown>
  );
};
