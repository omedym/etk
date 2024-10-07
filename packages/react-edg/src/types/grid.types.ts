import type { TableData } from './data.types';
import type { DataGridCardCoverProps, DataGridCardTitleProps } from '@datagrid/components';
import type { FC, ReactNode } from 'react';

export type CardItemConfig<TData extends TableData> = {
  title?: (data: TData) => DataGridCardTitleProps;
  renderTitle?: (data: TData) => ReactNode;
  renderBody?: (data: TData) => ReactNode;
  cover?: (data: TData) => DataGridCardCoverProps;
  renderCover?: (data: TData) => ReactNode;
};

export type CardItem<TData extends TableData> = CardItemConfig<TData> | FC<TData>;
