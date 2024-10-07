import { useDataGridTheme } from '@datagrid/theme/hooks';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Spin, Dropdown } from 'antd';

import type { DataGridContextMenuProps } from './DataGridContextMenu.types';
import type { TableData } from '@datagrid/types';
import type { ItemType } from 'antd/es/menu/interface';

export const DataGridContextMenu = <TData extends TableData>({
  icon,
  data,
  getItems,
  loading = false,
}: DataGridContextMenuProps<TData>): JSX.Element => {
  const theme = useDataGridTheme();

  const MenuItems = getItems(data)
    .filter(({ hidden }) => !hidden)
    .map<ItemType>(({ label, icon: itemIcon, disabled, action }, ind) => ({
      key: `${label}_${ind}`,
      label,
      icon: itemIcon,
      disabled,
      onClick: () => action?.(data),
      style: {
        color: theme.token.text[disabled ? 'disabled' : 'base'],
      },
    }));

  const dropdownRender = (menu: React.ReactNode) => (
    <Spin spinning={loading} delay={500}>
      {menu}
    </Spin>
  );

  return (
    <Dropdown
      menu={{
        onClick: (e) => e.domEvent.stopPropagation(),
        items: MenuItems,
      }}
      dropdownRender={dropdownRender}
    >
      <Button
        type="text"
        onClick={(e) => e.stopPropagation()}
        icon={icon ?? <FontAwesomeIcon color={theme.token.text.tertiary} icon={faEllipsisV} />}
      />
    </Dropdown>
  );
};
