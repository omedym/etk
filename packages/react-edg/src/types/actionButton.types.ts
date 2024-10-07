import type { FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import type { ButtonProps, MenuProps } from 'antd';

type AntdButton = Pick<ButtonProps, 'onClick' | 'disabled'>;

export interface ActionButton extends AntdButton {
  /**
   * The label of the button.
   */
  label: string;
  /**
   * Font awesome icon to display.
   */
  faIcon?: FontAwesomeIconProps['icon'];
  /**
   * The dropdown button props.
   */
  items?: MenuProps['items'];
  /**
   * The tooltip to display.
   */
  tooltip?: string;
}
