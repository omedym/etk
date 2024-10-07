import { useSelectMode } from '@datagrid/hooks/selection';
import { useDataGridTheme } from '@datagrid/theme/hooks';
import { faUndo } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Space } from 'antd';

import { DataGridViewSelect } from '../DataGridViewSelect';

import { Styled } from './DataGridHeader.styles';

import type { DataGridHeaderProps } from './DataGridHeader.types';
import type { TableData } from '@datagrid/types';

export const DataGridHeader = <TData extends TableData>({
  title,
  selectedView,
  viewsConfig,
  resetToDefault,
  ...viewSelectProps
}: DataGridHeaderProps<TData>): JSX.Element | null => {
  const theme = useDataGridTheme();
  const { selectModeEnabled } = useSelectMode();

  const viewsRendered = viewsConfig && viewsConfig.length > 0;

  const handleReset = () => {
    if (viewsRendered && selectedView) {
      const { onViewChange } = viewSelectProps;
      return onViewChange?.(selectedView);
    }

    resetToDefault();
  };

  if (!title && !viewsRendered) {
    return null;
  }

  return (
    <Space direction="vertical">
      <Space align="center" size={4}>
        {viewsRendered ? (
          <DataGridViewSelect viewsConfig={viewsConfig} selectedView={selectedView} {...viewSelectProps} />
        ) : (
          <Styled.Title level={4}>{title}</Styled.Title>
        )}

        <Styled.ResetButton
          type="text"
          icon={<FontAwesomeIcon color={theme.token.text.quaternary} icon={faUndo} />}
          onClick={handleReset}
          disabled={selectModeEnabled}
        />
      </Space>
    </Space>
  );
};
