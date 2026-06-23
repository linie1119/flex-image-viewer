import React, { createContext, useContext, useReducer } from "react";

import type { ViewerState, ViewerAction } from "@/types";

const ZOOM_STEP = 0.1;
const MIN_SCALE = 0.1;
const MAX_SCALE = 8;

export const ViewerStateContext = createContext<ViewerState | null>(null);
export const ViewerDispatchContext =
  createContext<React.Dispatch<ViewerAction> | null>(null);

export function useViewerState(): ViewerState {
  const context = useContext(ViewerStateContext);
  if (!context) {
    throw new Error("useViewerState must be used within a ViewerProvider");
  }
  return context;
}

export function useViewerDispatch(): React.Dispatch<ViewerAction> {
  const context = useContext(ViewerDispatchContext);
  if (!context) {
    throw new Error("useViewerDispatch must be used within a ViewerProvider");
  }
  return context;
}

export function viewerReducer(
  state: ViewerState,
  action: ViewerAction,
): ViewerState {
  switch (action.type) {
    case "SET_CURRENT_INDEX":
      return { ...state, currentIndex: action.payload };
    case "PREV_IMAGE": {
      const total = state.filesLength;
      if (total <= 1) return state;
      let index = state.currentIndex - 1;
      if (state.loop && index < 1) {
        index = total;
      } else if (index < 1) {
        index = 1;
      }
      return { ...state, currentIndex: index };
    }
    case "NEXT_IMAGE": {
      const total = state.filesLength;
      if (total <= 1) return state;
      let index = state.currentIndex + 1;
      if (state.loop && index > total) {
        index = 1;
      } else if (index > total) {
        index = total;
      }
      return { ...state, currentIndex: index };
    }
    case "SET_LOOP":
      return { ...state, loop: action.payload };
    case "ROTATE_LEFT": {
      const { index } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, angle: (opt.angle - 90 + 360) % 360 } : opt,
      );
      return { ...state, imageOptions: newOptions };
    }
    case "ROTATE_RIGHT": {
      const { index } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, angle: (opt.angle + 90) % 360 } : opt,
      );
      return { ...state, imageOptions: newOptions };
    }
    case "SET_ZOOM": {
      const { index, scale } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, scale, isAdapt: false } : opt,
      );
      return { ...state, imageOptions: newOptions };
    }
    case "ZOOM_IN": {
      const { index, step = ZOOM_STEP } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index
          ? {
              ...opt,
              scale: Math.min(MAX_SCALE, opt.scale + step),
              isAdapt: false,
            }
          : opt,
      );
      return { ...state, imageOptions: newOptions };
    }
    case "ZOOM_OUT": {
      const { index, step = ZOOM_STEP } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index
          ? {
              ...opt,
              scale: Math.max(MIN_SCALE, opt.scale - step),
              isAdapt: false,
            }
          : opt,
      );
      return { ...state, imageOptions: newOptions };
    }
    case "ADAPT_ZOOM": {
      const { index, scale } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, scale, isAdapt: true } : opt,
      );
      return { ...state, imageOptions: newOptions };
    }
    case "CLEAR_IMAGE": {
      const { index, angle, scale } = action.payload;
      const newOptions = state.imageOptions.map((opt, i) =>
        i === index ? { ...opt, angle, scale, isAdapt: true } : opt,
      );
      return { ...state, imageOptions: newOptions };
    }
    case "TOGGLE_INFO":
      return { ...state, infoVisible: !state.infoVisible };
    case "TOGGLE_THUMBNAIL":
      return { ...state, thumbnailVisible: !state.thumbnailVisible };
    case "INITIALIZE_FILES": {
      const { files } = action.payload;
      const count = files.length;
      return {
        ...state,
        filesLength: count,
        files,
        imageOptions: Array.from({ length: count }, (_, i) => ({
          angle: files[i]?.angle ?? 0,
          scale: files[i]?.scale ?? 1,
          isAdapt: true,
        })),
      };
    }
    case "UPDATE_FILE": {
      const { index, file } = action.payload;
      const newFiles = state.files.map((f, i) =>
        i === index ? { ...f, ...file } : f,
      );
      return { ...state, files: newFiles };
    }
    default:
      return state;
  }
}

function createInitialState(
  initialCurrent = 1,
  initialFilesLength = 0,
): ViewerState {
  return {
    currentIndex: initialCurrent,
    filesLength: initialFilesLength,
    imageOptions: [],
    infoVisible: false,
    thumbnailVisible: false,
    loop: false,
    files: [],
  };
}

export interface ViewerProviderProps {
  children: React.ReactNode;
  initialCurrent?: number;
  initialFilesLength?: number;
}

export function ViewerProvider({
  children,
  initialCurrent = 1,
  initialFilesLength = 0,
}: ViewerProviderProps) {
  const [state, dispatch] = useReducer(
    viewerReducer,
    createInitialState(initialCurrent, initialFilesLength),
  );

  return (
    <ViewerStateContext.Provider value={state}>
      <ViewerDispatchContext.Provider value={dispatch}>
        {children}
      </ViewerDispatchContext.Provider>
    </ViewerStateContext.Provider>
  );
}
