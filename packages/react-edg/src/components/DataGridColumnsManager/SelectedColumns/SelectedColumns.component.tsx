import { useDndSort } from '@datagrid/hooks/sorting';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';

import { SortableContainer } from '../SortableContainer';
import { SortableItem } from '../SortableItem';

import type { SelectedColumnsProps } from './SelectedColumns.types';
import type { DataGridColumnCheckboxOption } from '@datagrid/types';
import type { DragEndEvent } from '@dnd-kit/core';

export const SelectedColumns: React.FC<SelectedColumnsProps> = ({
  selectedColumns,
  pinnedColumnsSize,
  onPinnedChange,
  setSelectedColumns,
}) => {
  const { draggedColumn, onSortStart, getSortEndValues } = useDndSort({ data: selectedColumns, id: 'value' });

  const onSortEnd = (data: DragEndEvent) => {
    setSelectedColumns(getSortEndValues(data));
  };

  const onItemRemove = (column: DataGridColumnCheckboxOption) => {
    setSelectedColumns(selectedColumns.filter(({ value }) => column.value !== value));
  };

  return (
    <DndContext onDragStart={onSortStart} onDragEnd={onSortEnd} collisionDetection={closestCenter}>
      <SortableContainer>
        {selectedColumns.map((column, index) => {
          const id = column.value.toString(); // used in SortableContext so don't change
          return (
            <SortableItem
              id={id}
              key={id}
              value={column.label}
              pinStatus={column.pinned}
              pinnedColumnsSize={pinnedColumnsSize}
              onRemove={() => onItemRemove(column)}
              onPinnedChange={(pinStatus) => onPinnedChange(index, pinStatus)}
            />
          );
        })}
      </SortableContainer>

      <DragOverlay>
        {draggedColumn && (
          <SortableItem
            id={draggedColumn.value.toString()}
            value={draggedColumn.label}
            pinStatus={draggedColumn.pinned}
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};
