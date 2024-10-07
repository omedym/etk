import { Dropdown } from 'antd';
import styled from 'styled-components';

import { BASE_BUTTON_STYLES } from '../BaseButton';

const DropdownButton = styled(Dropdown.Button)`
  button {
    ${BASE_BUTTON_STYLES}
  }
`;

export const Styled = { DropdownButton };
