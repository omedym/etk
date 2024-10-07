import { Button, Modal as AntdModal } from 'antd';

import { Styled } from './DataGridModal.styles';

import type { DataGridModalProps } from './DataGridModal.types';

export const DataGridModal: React.FC<DataGridModalProps> = ({
  children,
  resetLabel = 'Reset',
  onApply,
  onReset,
  onCancel,
  ...props
}) => {
  return (
    <AntdModal
      width={906}
      onCancel={onCancel}
      footer={
        <Styled.ButtonsContainer>
          <Styled.LeftButtonsContent>
            <Button onClick={onCancel}>Cancel</Button>
          </Styled.LeftButtonsContent>

          <Styled.RightButtonsContent>
            <Button onClick={onReset}>{resetLabel}</Button>
            <Button type="primary" onClick={onApply}>
              Apply
            </Button>
          </Styled.RightButtonsContent>
        </Styled.ButtonsContainer>
      }
      {...props}
    >
      {children}
    </AntdModal>
  );
};
