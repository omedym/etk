import { DataGridContextMenu } from '@datagrid/components';
import { Checkbox, Space } from 'antd';

import { CardCover } from '../CardCover';
import { CardTitle } from '../CardTitle';

import { Styled } from './Card.styles';

import type { CardProps } from './Card.types';
import type { TableData } from '@datagrid/types';
import type { ReactElement } from 'react';

export const Card = <TData extends TableData>({
  data,
  checked,
  contextMenu,
  onSelect,
  title,
  renderTitle,
  renderBody,
  cover,
  renderCover,
  onClick,
}: CardProps<TData>): ReactElement => {
  const renderCardTitle = () => {
    return (
      <Styled.CardTitleContainer>
        {renderTitle?.(data) ?? <Card.Title {...(title?.(data) ?? {})} />}
        <Space size="small">
          {contextMenu && <DataGridContextMenu data={data} getItems={contextMenu.getItems!} />}
        </Space>
      </Styled.CardTitleContainer>
    );
  };

  return (
    <Styled.Card
      cover={renderCover?.(data) ?? <Card.Cover {...(cover?.(data) ?? {})} />}
      onClick={() => onClick?.(data)}
      clickable={Boolean(onClick)}
    >
      {onSelect && <Checkbox checked={checked} onChange={onSelect} />}

      <Space
        direction="vertical"
        style={{
          width: '100%',
        }}
      >
        {renderCardTitle()}
        {renderBody?.(data)}
      </Space>
    </Styled.Card>
  );
};

Card.Title = CardTitle;
Card.Cover = CardCover;
