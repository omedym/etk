import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'antd';
import React from 'react';

import { BASE_BUTTON_FONT_SIZE, BaseButton } from '../BaseButton';

import type { SelectButtonProps } from './SelectButton.types';

export const SelectButton: React.FC<SelectButtonProps> = ({
  selectModeEnabled,
  disableSelectMode,
  enableSelectMode,
}) => {
  if (selectModeEnabled) {
    return (
      <Button type="link" style={{ fontSize: BASE_BUTTON_FONT_SIZE }} onClick={disableSelectMode}>
        Done
      </Button>
    );
  }

  return (
    <BaseButton icon={<FontAwesomeIcon icon={faCheck} />} onClick={enableSelectMode}>
      Select
    </BaseButton>
  );
};
