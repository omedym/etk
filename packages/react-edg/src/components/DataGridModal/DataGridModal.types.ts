import type { ModalProps } from 'antd';

export interface DataGridModalProps extends Omit<ModalProps, 'onOk'> {
  resetLabel?: string;
  onReset?: () => void;
  onApply?: () => void;
}
