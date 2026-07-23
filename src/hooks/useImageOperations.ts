import { useMemoizedFn } from 'ahooks';

import type { ViewerState, ViewerAction, FileData } from '@/types';

import { ZOOM_STEP } from '@/utils/constant';

export interface ImageOperations {
  rotateLeft: () => void;
  rotateRight: () => void;
  setZoom: (scale: number) => void;
  zoomIn: (step?: number) => void;
  zoomOut: (step?: number) => void;
  adaptZoom: (scale: number) => void;
  clear: () => void;
  updateCurrentFile: (file: Partial<FileData>) => void;
}

export function useImageOperations<T extends FileData>(
  state: ViewerState<T>,
  dispatch: React.Dispatch<ViewerAction<T>>
): ImageOperations {
  const arrayIndex = state.currentIndex;

  const rotateLeft = useMemoizedFn(() => {
    dispatch({ type: 'ROTATE_LEFT', payload: { index: arrayIndex } });
  });

  const rotateRight = useMemoizedFn(() => {
    dispatch({ type: 'ROTATE_RIGHT', payload: { index: arrayIndex } });
  });

  const setZoom = useMemoizedFn(
    (scale: number) => {
      dispatch({ type: 'SET_ZOOM', payload: { index: arrayIndex, scale } });
    }
  );

  const zoomIn = useMemoizedFn(
    (step = ZOOM_STEP) => {
      dispatch({ type: 'ZOOM_IN', payload: { index: arrayIndex, step } });
    }
  );

  const zoomOut = useMemoizedFn(
    (step = ZOOM_STEP) => {
      dispatch({ type: 'ZOOM_OUT', payload: { index: arrayIndex, step } });
    }
  );

  const adaptZoom = useMemoizedFn(
    (scale: number) => {
      dispatch({ type: 'ADAPT_ZOOM', payload: { index: arrayIndex, scale } });
    }
  );

  const clear = useMemoizedFn(() => {
    const file = state.files[arrayIndex];
    dispatch({
      type: 'CLEAR_IMAGE',
      payload: {
        index: arrayIndex,
        angle: file?.angle ?? 0,
        scale: file?.scale ?? 1,
      },
    });
  });

  const updateCurrentFile = useMemoizedFn(
    (file: Partial<FileData>) => {
      dispatch({
        type: 'UPDATE_FILE',
        payload: { index: arrayIndex, file: file as Partial<T> },
      });
    }
  );

  return {
    rotateLeft,
    rotateRight,
    setZoom,
    zoomIn,
    zoomOut,
    adaptZoom,
    clear,
    updateCurrentFile,
  };
}
