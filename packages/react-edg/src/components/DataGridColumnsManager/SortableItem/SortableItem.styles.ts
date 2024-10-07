import styled from 'styled-components';

const SelectedColumn = styled.div<{ isDragging?: boolean }>`
  background: ${({ theme }) => theme.token.background.layout};
  font-weight: bold;
  padding: 6px 12px;
  border-radius: 4px;

  svg {
    color: ${({ theme }) => theme.token.text.tertiary};
  }

  ${({ isDragging }) => isDragging && 'opacity: 0'}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DragHandle = styled.div`
  display: inline-block;
  cursor: row-resize;
`;

export const Styled = {
  DragHandle,
  Content,
  SelectedColumn,
};
