import React from 'react';

import { useViewerState } from '@/context/ViewerContext';

import type { FileData } from '@/types';

import Actions from './Actions';

import type { HeaderActionsProps } from './Actions';

export interface HeaderProps<T extends FileData> {
  renderAction?: HeaderActionsProps<T>['renderAction'];
  onClose?: (e: React.MouseEvent) => void;
  onClear?: () => void;
  updateCurrentFile?: HeaderActionsProps<T>['updateCurrentFile'];
}

function Header<T extends FileData>({
  renderAction,
  onClose,
  onClear,
  updateCurrentFile,
}: HeaderProps<T>) {
  const state = useViewerState();
  const current = state.currentIndex;
  const total = state.filesLength;
  const name = state.files[current]?.name;
  const rotate = state.imageOptions[current]?.angle ?? 0;

  return (
    <header className="flex-image-viewer-header">
      <div className="flex-image-viewer-header-title">
        <div>
          {current + 1}/{total}
        </div>
        <div className="flex-image-viewer-header-name">{name}</div>
      </div>
      <Actions
        rotate={rotate}
        renderAction={renderAction}
        onClose={onClose}
        onClear={onClear}
        updateCurrentFile={updateCurrentFile}
      />
    </header>
  );
}

export default Header;
