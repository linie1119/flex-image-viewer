import { useCallback } from 'react';

import type { ViewerState, ViewerAction, FileData } from '@/types';

const ZOOM_STEP = 0.1;

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

export function useImageOperations(
  state: ViewerState,
  dispatch: React.Dispatch<ViewerAction>
): ImageOperations {
  const arrayIndex = state.currentIndex - 1;

  const rotateLeft = useCallback(() => {
    dispatch({ type: 'ROTATE_LEFT', payload: { index: arrayIndex } });
  }, [dispatch, arrayIndex]);

  const rotateRight = useCallback(() => {
    dispatch({ type: 'ROTATE_RIGHT', payload: { index: arrayIndex } });
  }, [dispatch, arrayIndex]);

  const setZoom = useCallback(
    (scale: number) => {
      dispatch({ type: 'SET_ZOOM', payload: { index: arrayIndex, scale } });
    },
    [dispatch, arrayIndex]
  );

  const zoomIn = useCallback(
    (step = ZOOM_STEP) => {
      dispatch({ type: 'ZOOM_IN', payload: { index: arrayIndex, step } });
    },
    [dispatch, arrayIndex]
  );

  const zoomOut = useCallback(
    (step = ZOOM_STEP) => {
      dispatch({ type: 'ZOOM_OUT', payload: { index: arrayIndex, step } });
    },
    [dispatch, arrayIndex]
  );

  const adaptZoom = useCallback(
    (scale: number) => {
      dispatch({ type: 'ADAPT_ZOOM', payload: { index: arrayIndex, scale } });
    },
    [dispatch, arrayIndex]
  );

  const clear = useCallback(() => {
    const file = state.files[arrayIndex];
    dispatch({
      type: 'CLEAR_IMAGE',
      payload: {
        index: arrayIndex,
        angle: file?.angle ?? 0,
        scale: file?.scale ?? 1,
      },
    });
  }, [dispatch, arrayIndex, state.files]);

  const updateCurrentFile = useCallback(
    (file: Partial<FileData>) => {
      dispatch({
        type: 'UPDATE_FILE',
        payload: { index: arrayIndex, file },
      });
    },
    [dispatch, arrayIndex]
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
