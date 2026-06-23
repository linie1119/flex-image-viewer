import { useCallback } from "react";

import { useImageOperations } from "./useImageOperations";

import type { ViewerState, ViewerAction } from "@/types";

export interface ViewerController {
  state: ViewerState;
  dispatch: React.Dispatch<ViewerAction>;
  imageOps: ReturnType<typeof useImageOperations>;
  setCurrentIndex: (index: number) => void;
  toggleInfo: () => void;
  toggleThumbnail: () => void;
  initializeFiles: (files: ViewerState["files"]) => void;
}

export function useViewer(
  state: ViewerState,
  dispatch: React.Dispatch<ViewerAction>,
): ViewerController {
  const imageOps = useImageOperations(state, dispatch);

  const setCurrentIndex = useCallback(
    (index: number) => {
      dispatch({ type: "SET_CURRENT_INDEX", payload: index });
    },
    [dispatch],
  );

  const toggleInfo = useCallback(() => {
    dispatch({ type: "TOGGLE_INFO" });
  }, [dispatch]);

  const toggleThumbnail = useCallback(() => {
    dispatch({ type: "TOGGLE_THUMBNAIL" });
  }, [dispatch]);

  const initializeFiles = useCallback(
    (files: ViewerState["files"]) => {
      dispatch({
        type: "INITIALIZE_FILES",
        payload: { files },
      });
    },
    [dispatch],
  );

  return {
    state,
    dispatch,
    imageOps,
    setCurrentIndex,
    toggleInfo,
    toggleThumbnail,
    initializeFiles,
  };
}
