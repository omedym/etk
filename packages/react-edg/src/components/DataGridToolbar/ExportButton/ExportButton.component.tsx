import { faFileDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

import { BaseButton } from '../BaseButton';

import type { ExportButtonProps } from './ExportButton.types';

export const ExportButton: React.FC<ExportButtonProps> = ({ onDataExport }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    await onDataExport?.();
    setLoading(false);
  };

  return (
    <BaseButton onClick={handleExport} icon={<FontAwesomeIcon icon={faFileDownload} />} loading={loading}>
      Export
    </BaseButton>
  );
};
