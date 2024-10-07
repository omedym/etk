import { faEllipsisV, faThumbtack } from '@fortawesome/free-solid-svg-icons';

import type { PinStatus } from '@datagrid/types';
import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';

export const getPinIconProps = (pinStatus?: PinStatus): FontAwesomeIconProps => {
  if (!pinStatus) {
    return { icon: faEllipsisV };
  }

  if (pinStatus === 'left') {
    return { icon: faThumbtack, transform: { rotate: 90 } };
  }

  return { icon: faThumbtack, transform: { rotate: 270 } };
};
