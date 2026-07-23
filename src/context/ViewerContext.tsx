import React, { createContext, useContext, useReducer } from 'react';

import type { ViewerState, ViewerAction, FileData } from '@/types';

import { ZOOM_STEP, MIN_SCALE, MAX_SCALE } from '@/utils/constant';

export const ViewerStateContext = createContext<ViewerState<FileData> | null>(null);
export const ViewerDispatchContext = createContext<React.Dispatch<ViewerAction<FileData>> | null>(
  null
);

export function useViewerState<T extends FileData>(): ViewerState<T> {
  const context = useContext(ViewerStateContext);
  if (!context) {
    throw new Error('useViewerState must be used within a ViewerProvider');
  }
  return context as ViewerState<T>;
}

export function useViewerDispatch(): React.Dispatch<ViewerAction<FileData>> {
  const context = useContext(ViewerDispatchContext);
  if (!context) {
    throw new Error('useViewerDispatch must be used within a ViewerProvider');
  }
  return context;
}

export function viewerReducer<T extends FileData>(
  state: ViewerState<T>,
  action: ViewerAction<T>
): ViewerState<T> {
  switch (action.type) {
    case 'SET_CURRENT_INDEX':
      return { ...state, currentIndex: action.payload };
    case 'PREV_IMAGE': {
      const total = state.filesLength;
      if (total <= 1) return state;
      let index = state.currentIndex - 1;
      if (state.loop && index < 0) {
        index = total - 1;
      } else if (index < 0) {
        index = 0;
      }
      return { ...state, currentIndex: index };
    }
    case 'NEXT_IMAGE': {
      const total = state.filesLength;
      if (total <= 1) return state;
      let index = state.currentIndex + 1;
      if (state.loop && index >= total) {
        index = 0;
      } else if (index >= total) {
        index = total - 1;
      }
      return { ...state, currentIndex: index };
    }
    case 'SET_LOOP':
      return { ...state, loop: action.payload };
    case 'ROTATE_LEFT': {
      const { index } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, angle: (opt.angle - 90 + 360) % 360 } : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'ROTATE_RIGHT': {
      const { index } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, angle: (opt.angle + 90) % 360 } : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'SET_ROTATION': {
      const { index, angle } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, angle: angle % 360 } : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'SET_ZOOM': {
      const { index, scale } = action.payload;
      const roundedScale = Math.round(scale * 100) / 100;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, scale: roundedScale, isAdapt: false } : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'ZOOM_IN': {
      const { index, step = ZOOM_STEP } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index
          ? {
              ...opt,
              scale: Math.round(Math.min(MAX_SCALE, opt.scale + step) * 100) / 100,
              isAdapt: false,
            }
          : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'ZOOM_OUT': {
      const { index, step = ZOOM_STEP } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index
          ? {
              ...opt,
              scale: Math.round(Math.max(MIN_SCALE, opt.scale - step) * 100) / 100,
              isAdapt: false,
            }
          : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'ADAPT_ZOOM': {
      const { index, scale } = action.payload;
      const roundedScale = Math.round(scale * 100) / 100;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, scale: roundedScale, isAdapt: true } : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'CLEAR_IMAGE': {
      const { index, angle, scale } = action.payload;
      const roundedScale = Math.round(scale * 100) / 100;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, angle, scale: roundedScale, isAdapt: true } : opt
      );
      return { ...state, imageOptions: newOptions };
    }
    case 'TOGGLE_INFO':
      return { ...state, infoVisible: !state.infoVisible };
    case 'TOGGLE_THUMBNAIL':
      return { ...state, thumbnailVisible: !state.thumbnailVisible };
    case 'INITIALIZE_FILES': {
      const { files } = action.payload;
      const count = files.length;

      const newImageOptions = Array.from({ length: count }, (_, i) => {
        const prevOpt = state.imageOptions[i];
        const fileAngle = files[i]?.angle;
        const fileScale = files[i]?.scale;

        if (fileAngle !== undefined || fileScale !== undefined) {
          return {
            angle: fileAngle ?? 0,
            scale: fileScale !== undefined ? Math.round(fileScale * 100) / 100 : 1,
            isAdapt: true,
          };
        }

        if (prevOpt) {
          return prevOpt;
        }

        return {
          angle: 0,
          scale: 1,
          isAdapt: true,
        };
      });

      return {
        ...state,
        filesLength: count,
        files,
        imageOptions: newImageOptions,
      };
    }
    case 'UPDATE_FILE': {
      const { index, file } = action.payload;
      const newFiles = state.files.map((f, i) => (i === index ? { ...f, ...file } : f));
      return { ...state, files: newFiles };
    }
    default:
      return state;
  }
}

function createInitialState<T extends FileData>(
  initialCurrent = 0,
  initialFilesLength = 0,
  initialThumbnailVisible = false,
  initialInfoVisible = false
): ViewerState<T> {
  return {
    currentIndex: initialCurrent,
    filesLength: initialFilesLength,
    imageOptions: [],
    thumbnailVisible: initialThumbnailVisible,
    infoVisible: initialInfoVisible,
    loop: false,
    files: [],
  };
}

export interface ViewerProviderProps {
  initialCurrent?: number;
  initialFilesLength?: number;
  initialThumbnailVisible?: boolean;
  initialInfoVisible?: boolean;
  children: React.ReactNode;
}

export function ViewerProvider({
  initialCurrent = 0,
  initialFilesLength = 0,
  initialThumbnailVisible = false,
  initialInfoVisible = false,
  children,
}: ViewerProviderProps) {
  const [state, dispatch] = useReducer(
    viewerReducer,
    createInitialState(
      initialCurrent,
      initialFilesLength,
      initialThumbnailVisible,
      initialInfoVisible
    )
  );

  return (
    <ViewerStateContext.Provider value={state}>
      <ViewerDispatchContext.Provider value={dispatch}>{children}</ViewerDispatchContext.Provider>
    </ViewerStateContext.Provider>
  );
}
