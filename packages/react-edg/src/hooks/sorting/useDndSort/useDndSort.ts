import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';

import type { GetSortEndValues, OnSortStart, UseDndSortParams, UseDndSortReturn } from './useDndSort.types';
import type { UniqueIdentifier } from '@dnd-kit/core';

export const useDndSort = <T>({ data, id }: UseDndSortParams<T>): UseDndSortReturn<T> => {
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const onSortStart: OnSortStart = ({ active }) => {
    setActiveId(active.id);
  };

  const getSortEndValues: GetSortEndValues<T> = ({ over, active }) => {
    if (over && active?.id !== over?.id) {
      const oldIndex = data.findIndex((item) => item[id] === active.id);
      const newIndex = data.findIndex((item) => item[id] === over.id);

      return arrayMove(data, oldIndex, newIndex);
    }

    return data;
  };

  const getIndex = (currentId: UniqueIdentifier) => {
    return data.findIndex((item) => item[id] === currentId);
  };

  const activeIndex = activeId ? getIndex(activeId) : -1;
  const draggedColumn = data[activeIndex];

  return { draggedColumn, onSortStart, getSortEndValues };
};
