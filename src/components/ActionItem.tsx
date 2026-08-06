import React from 'react';
import Tooltip from 'rc-tooltip';

export interface ActionItemProps {
  tooltip?: string;
  tooltipPlacement?: 'topRight' | 'bottomRight' | 'topLeft' | 'bottomLeft';
  children: React.ReactNode;
  onClick?: () => void;
}

export default function ActionItem({
  tooltip,
  tooltipPlacement = 'topRight',
  children,
  onClick,
}: ActionItemProps) {
  const item = (
    <li className="flex-image-viewer-action-item" onClick={onClick}>
      {children}
    </li>
  );

  if (tooltip) {
    return (
      <Tooltip overlay={tooltip} placement={tooltipPlacement} showArrow={false}>
        {item}
      </Tooltip>
    );
  }

  return item;
}
