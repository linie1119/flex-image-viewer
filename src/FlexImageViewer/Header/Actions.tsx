// src/FlexImageViewer/Header/Actions.tsx
import React from 'react';

import { useViewerState, useViewerDispatch } from '@/context/ViewerContext';
import { BaseActions } from '@/components';

import type { BaseActionItem } from '@/components';
import type { FileData } from '@/types';

type ActionKey = 'rotateLeft' | 'rotateRight' | 'clear' | 'close';

export interface HeaderActionsProps<T extends FileData> {
  rotate?: number;
  updateCurrentFile?: (file: Partial<T>) => void;
  renderAction?: (
    actions: Record<ActionKey, React.ReactNode>,
    context: { rotate: number; updateCurrentFile: (file: Partial<T>) => void }
  ) => React.ReactNode;
  onClear?: () => void;
  onClose?: (e: React.MouseEvent) => void;
}

const HEADER_ITEMS: BaseActionItem[] = [
  {
    key: 'rotateLeft',
    type: 'icon',
    tooltipKey: 'rotateLeft',
    iconName: 'RotateLeft',
    tooltipPlacement: 'bottomRight',
  },
  {
    key: 'rotateRight',
    type: 'icon',
    tooltipKey: 'rotateRight',
    iconName: 'RotateRight',
    tooltipPlacement: 'bottomRight',
  },
  {
    key: 'clear',
    type: 'icon',
    tooltipKey: 'clear',
    iconName: 'Clear',
    tooltipPlacement: 'bottomRight',
  },
  {
    key: 'close',
    type: 'icon',
    tooltipKey: 'close',
    iconName: 'Close',
    tooltipPlacement: 'bottomRight',
  },
];

function Actions<T>(props: HeaderActionsProps<T>) {
  const { rotate = 0, updateCurrentFile, renderAction, onClear, onClose } = props;
  const dispatch = useViewerDispatch();
  const state = useViewerState();
  const index = state.currentIndex - 1;

  const handleAction = (key: string, _value?: unknown, event?: React.MouseEvent) => {
    switch (key) {
      case 'rotateLeft':
        dispatch({ type: 'ROTATE_LEFT', payload: { index } });
        break;
      case 'rotateRight':
        dispatch({ type: 'ROTATE_RIGHT', payload: { index } });
        break;
      case 'clear':
        onClear?.();
        break;
      case 'close':
        onClose?.(event!);
        break;
    }
  };

  const context = {
    rotate,
    updateCurrentFile: updateCurrentFile ?? (() => {}),
    onClear,
    onClose,
  };

  return (
    <BaseActions
      items={HEADER_ITEMS}
      contextValues={context}
      renderAction={renderAction}
      onAction={handleAction}
    />
  );
}

export default Actions;
