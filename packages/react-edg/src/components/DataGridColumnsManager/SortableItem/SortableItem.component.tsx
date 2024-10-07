import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { faGripLines, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Space } from 'antd';

import { PinButton } from '../PinButton';

import { Styled } from './SortableItem.styles';

import type { SortableElementProps } from './SortableItem.types';
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities';
import type { FC } from 'react';

const DragHandle: FC<SyntheticListenerMap> = (props) => (
  <Styled.DragHandle {...props}>
    <FontAwesomeIcon icon={faGripLines} />
  </Styled.DragHandle>
);

export const SortableItem: FC<SortableElementProps> = ({
  id,
  pinnedColumnsSize = [0, 0],
  pinStatus,
  value,
  onRemove,
  onPinnedChange,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Styled.SelectedColumn ref={setNodeRef} {...attributes} style={style} isDragging={isDragging}>
      <Styled.Content>
        <Space>
          <DragHandle {...listeners} />

          {value}
        </Space>

        <div>
          <PinButton pinStatus={pinStatus} pinColumnsSize={pinnedColumnsSize} onPinnedChange={onPinnedChange} />

          <Button size="small" icon={<FontAwesomeIcon icon={faTimes} />} variant="text" onClick={onRemove} />
        </div>
      </Styled.Content>
    </Styled.SelectedColumn>
  );
};
