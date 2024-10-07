import { useSelectMode } from '@datagrid/hooks/selection';
import { getTextWidth } from '@datagrid/utils/common';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useSize } from 'ahooks';
import { Button } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

import { FilterChipsItem } from '../FilterChipsItem';

import { Styled } from './CollapsedFiltersChips.styles';

import type { CollapsedFiltersChipsProps } from './CollapsedFiltersChips.types';

export const CollapsedFiltersChips: React.FC<CollapsedFiltersChipsProps> = ({ filtersChips, removeFilter }) => {
  const [showAll, setShowAll] = useState(false);
  const [isOverflowing, setIsOverflowing] = useState(false);
  const { selectModeEnabled } = useSelectMode();

  const chipsFiltersRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLAnchorElement | HTMLButtonElement>(null);

  const maxWidth = useSize(chipsFiltersRef)?.width ?? 0;
  const itemClosable = !selectModeEnabled;

  const displayedFiltersChips = useMemo(() => {
    if (showAll || !isOverflowing) {
      return filtersChips;
    }

    let currentWidth = buttonRef.current?.clientWidth ?? 0;
    let hiddenElementsAmount = 0;

    filtersChips.forEach((filterChips) => {
      const fullLabel = filterChips.label + filterChips.data.label;
      // Approximately calculate the width of the filter chips component
      const chipsWidth = getTextWidth(fullLabel) + 70;

      currentWidth += chipsWidth;

      if (currentWidth > maxWidth) {
        hiddenElementsAmount += 1;
      }
    });

    return filtersChips.slice(0, filtersChips.length - hiddenElementsAmount);
  }, [showAll, isOverflowing, maxWidth, filtersChips]);

  useEffect(() => {
    // Recalculate isOverflowing when all filters chips has been rendered
    if (!chipsFiltersRef.current || displayedFiltersChips.length !== filtersChips.length) {
      return;
    }

    // Approximate height of single row of filters chips without wrap
    const ROW_HEIGHT = 35;

    const containerHeight = chipsFiltersRef.current.scrollHeight;
    const isOverflown = containerHeight > ROW_HEIGHT;
    setIsOverflowing(isOverflown);

    // Reset collapse/uncollapse button state
    if (!isOverflown) {
      setShowAll(false);
    }
  }, [filtersChips, displayedFiltersChips, maxWidth]);

  return (
    <Styled.Container ref={chipsFiltersRef} wrap>
      {displayedFiltersChips.map((filterChips) => (
        <FilterChipsItem
          {...filterChips}
          key={`${filterChips.columnKey}_${filterChips.data.value}`}
          closable={itemClosable}
          onFilterChipsRemove={removeFilter(filterChips)}
        />
      ))}
      {isOverflowing && (
        <Button
          ref={buttonRef}
          type="link"
          icon={<FontAwesomeIcon icon={showAll ? faChevronUp : faChevronDown} />}
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? 'Show less' : 'Show more'}
        </Button>
      )}
    </Styled.Container>
  );
};
