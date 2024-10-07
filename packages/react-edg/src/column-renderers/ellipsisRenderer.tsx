import { Tooltip } from 'antd';

export const ellipsisRenderer = (text: string): React.ReactNode => {
  if (text.length < 2) {
    return text;
  }

  return (
    <Tooltip title={text}>
      <div
        style={{
          textOverflow: 'ellipsis',
          overflow: 'hidden',
        }}
      >
        {text}
      </div>
    </Tooltip>
  );
};
