// src/FlexImageViewer/Footer/Actions.tsx
import React from 'react';

import { BaseActions } from '@/components';
import { useViewerState, useViewerDispatch } from '@/context/ViewerContext';

import type { BaseActionItem } from '@/components';
import type { FileData } from '@/types';

// Re-defining types locally if not exported from separate file for self-containment based on prompt input
type ActionKey =
  | 'thumbnail'
  | 'info'
  | 'zoomAdapt'
  | 'zoomSelect'
  | 'zoomOut'
  | 'zoomSlider'
  | 'zoomIn';

export interface FooterActionsProps<T extends FileData> {
  zoom?: number;
  updateCurrentFile?: (file: Partial<T>) => void;
  renderAction?: (
    actions: Record<ActionKey, React.ReactNode>,
    context: { zoom: number; updateCurrentFile: (file: Partial<T>) => void }
  ) => React.ReactNode;
}

const FOOTER_ITEMS: BaseActionItem[] = [
  {
    key: 'thumbnail',
    type: 'icon',
    tooltipKey: 'thumbnail',
    iconName: 'Thumbnail',
  },
  { key: 'info', type: 'icon', tooltipKey: 'info', iconName: 'Info' },
  {
    key: 'zoomAdapt',
    type: 'icon',
    tooltipKey: 'zoomAdapt',
    iconName: 'ZoomAdapt',
  },
  { key: 'zoomSelect', type: 'select', valueKey: 'zoom' },
  { key: 'zoomOut', type: 'icon', tooltipKey: 'zoomOut', iconName: 'ZoomOut' },
  { key: 'zoomSlider', type: 'slider', valueKey: 'zoom' },
  { key: 'zoomIn', type: 'icon', tooltipKey: 'zoomIn', iconName: 'ZoomIn' },
];

function Actions<T>(props: FooterActionsProps<T>) {
  const { zoom = 1, updateCurrentFile, renderAction } = props;
  const dispatch = useViewerDispatch();
  const state = useViewerState();
  const index = state.currentIndex - 1;

  const handleAction = (key: string, value?: unknown, _event?: React.MouseEvent) => {
    switch (key) {
      case 'thumbnail':
        dispatch({ type: 'TOGGLE_THUMBNAIL' });
        break;
      case 'info':
        dispatch({ type: 'TOGGLE_INFO' });
        break;
      case 'zoomAdapt':
        dispatch({ type: 'ADAPT_ZOOM', payload: { index, scale: zoom / 100 } });
        break;
      case 'zoomSelect':
      case 'zoomSlider':
        if (value !== undefined) {
          dispatch({
            type: 'SET_ZOOM',
            payload: { index, scale: (value as number) / 100 },
          });
        }
        break;
      case 'zoomOut':
        dispatch({ type: 'ZOOM_OUT', payload: { index, step: 0.1 } });
        break;
      case 'zoomIn':
        dispatch({ type: 'ZOOM_IN', payload: { index, step: 0.1 } });
        break;
    }
  };

  const context = {
    zoom,
    updateCurrentFile: updateCurrentFile ?? (() => {}),
  };

  return (
    <BaseActions
      items={FOOTER_ITEMS}
      contextValues={context}
      renderAction={renderAction}
      onAction={handleAction}
    />
  );
}

export default Actions;
