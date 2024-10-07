import { useState } from 'react';

/**
 * Hook that provides a table key and a function to update it and keep uniq to force table rerender.
 *
 * @param initKey - The initial key value (optional).
 * @returns An object containing the current table key and a function to update it.
 */
export const useTableKey = (initKey?: React.Key) => {
  const defaultTableKey = 'initial';
  const [tableKey, setTableKey] = useState<React.Key>(initKey ?? defaultTableKey);

  function updateTableKey(key: React.Key) {
    let newKey = key;

    if (newKey === tableKey) {
      newKey += '-reset';
    }

    setTableKey(newKey);
  }

  return {
    tableKey,
    setTableKey: updateTableKey,
  };
};
