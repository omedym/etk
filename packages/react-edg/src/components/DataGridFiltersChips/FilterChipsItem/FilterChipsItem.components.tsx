import { Styled } from './FilterChipsItem.styles';

import type { FilterChipsItemProps } from './FilterChipsItem.types';

export const FilterChipsItem: React.FC<FilterChipsItemProps> = ({
  label,
  data,
  closable = true,
  onFilterChipsRemove,
}) => {
  const handleOnClose = (event: React.MouseEvent<HTMLElement>) => {
    event.preventDefault();
    onFilterChipsRemove();
  };

  return (
    <Styled.Tag onClose={handleOnClose} closeIcon={closable}>
      {label}: {data.label ?? data.value}
    </Styled.Tag>
  );
};
