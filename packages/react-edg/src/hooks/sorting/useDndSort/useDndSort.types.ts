import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';

export type OnSortStart = (dragData: DragStartEvent) => void;
export type GetSortEndValues<T> = (dragData: DragEndEvent) => T[];

export type UseDndSortParams<T> = { data: T[]; id: keyof T };

export type UseDndSortReturn<T> = {
  draggedColumn: T | undefined;
  onSortStart: OnSortStart;
  getSortEndValues: GetSortEndValues<T>;
};
