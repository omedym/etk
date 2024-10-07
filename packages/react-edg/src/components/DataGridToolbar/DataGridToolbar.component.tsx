import { ColumnsManagerModal } from '@datagrid/components';
import { useSelectMode } from '@datagrid/hooks/selection';
import { useDataGridTheme } from '@datagrid/theme/hooks';
import { ViewMode } from '@datagrid/types';
import { faColumns, faGripHorizontal, faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Space } from 'antd';
import { useState } from 'react';

import { ActionButton } from './ActionButton';
import { BaseButton } from './BaseButton';
import { Styled } from './DataGridToolbar.styles';
import { ExportButton } from './ExportButton';
import { FiltersButton } from './FiltersButton';
import { SelectButton } from './SelectButton';
import { ViewModeButton } from './ViewModeButton';

import type { DataGridToolbarProps } from './DataGridToolbar.types';
import type { TableData } from '@datagrid/types';
import type { ReactElement } from 'react';

export const DataGridToolbar = <T extends TableData>({
  viewMode,
  toolbarConfig,
  columns,
  defaultColumns,
  filtersPanelOpen,
  actionButton,
  onColumnsManagerSave,
  onViewModeChange,
  renderSelectableActions,
  onFiltersPanelOpen,
  onDataExport,
}: DataGridToolbarProps<T>): ReactElement | null => {
  const [showColumnsManagerModal, setShowColumnsManagerModal] = useState(false);
  const { selectModeEnabled, selectModeUnavailable, enableSelectMode, disableSelectMode } = useSelectMode();
  const theme = useDataGridTheme();

  const handlePanelToggle = () => {
    onFiltersPanelOpen(!filtersPanelOpen);
  };

  if (!toolbarConfig) {
    return null;
  }

  const showLeftContent = toolbarConfig.showCard && toolbarConfig.showList;
  const showColumnsManager = toolbarConfig.showColumnsManager && viewMode !== ViewMode.Card && !selectModeEnabled;
  const showDataExport = Boolean(onDataExport) && !selectModeEnabled;

  const showSelectAction = !selectModeUnavailable;

  return (
    <Styled.Toolbar justify="space-between" wrap theme={theme}>
      <Styled.ToolbarSection>
        {actionButton && <ActionButton {...actionButton} />}

        {showLeftContent && !selectModeEnabled && (
          <>
            <ViewModeButton
              isActive={viewMode === ViewMode.List}
              icon={<FontAwesomeIcon icon={faList} />}
              onClick={() => onViewModeChange(ViewMode.List)}
            >
              List
            </ViewModeButton>

            <ViewModeButton
              isActive={viewMode === ViewMode.Card}
              icon={<FontAwesomeIcon icon={faGripHorizontal} />}
              onClick={() => onViewModeChange(ViewMode.Card)}
            >
              Card
            </ViewModeButton>
          </>
        )}
      </Styled.ToolbarSection>

      <Styled.ToolbarSection>
        <FiltersButton onClick={handlePanelToggle} />

        {showColumnsManager && (
          <>
            <BaseButton icon={<FontAwesomeIcon icon={faColumns} />} onClick={() => setShowColumnsManagerModal(true)}>
              Manage columns
            </BaseButton>

            <ColumnsManagerModal
              showModal={showColumnsManagerModal}
              columns={columns}
              defaultColumns={defaultColumns}
              onSave={onColumnsManagerSave}
              onClose={() => setShowColumnsManagerModal(false)}
            />
          </>
        )}
        {showDataExport && <ExportButton onDataExport={onDataExport} />}
        {renderSelectableActions && <Space>{renderSelectableActions()}</Space>}
        {showSelectAction && (
          <SelectButton
            selectModeEnabled={selectModeEnabled}
            enableSelectMode={enableSelectMode}
            disableSelectMode={disableSelectMode}
          />
        )}
      </Styled.ToolbarSection>
    </Styled.Toolbar>
  );
};
