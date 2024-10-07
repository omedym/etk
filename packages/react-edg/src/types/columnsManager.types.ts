import type { CheckboxOptionType as AntdCheckboxOptionType } from 'antd';

export type PinStatus = 'left' | 'right' | false;

export type DataGridColumnCheckboxValue = AntdCheckboxOptionType['value'];

export interface DataGridColumnCheckboxOption extends AntdCheckboxOptionType {
  visible: boolean | undefined;
  group: string;
  pinned: PinStatus;
}
