import { useEffect, useState, useCallback } from "react";

import { useViewerState, useViewerDispatch } from "@/context/ViewerContext";
import { Icon, Image } from "@/components";

import type { ImageProps } from "@/components";

export interface ContentProps<T> extends Pick<ImageProps<T>, 'getSrc'> {
  preload?: boolean;
  wheelZoom?: boolean;
  wheelZoomStep?: number;
  onClose?: () => void;
}

function Content<T>(props: ContentProps<T>) {
  const { preload = true, wheelZoom, wheelZoomStep, getSrc } = props;

  const state = useViewerState();
  const dispatch = useViewerDispatch();

  const current = state.currentIndex;
  const files = state.files;
  const imageOptions = state.imageOptions;

  const [displayIndices, setDisplayIndices] = useState<number[]>([]);

  useEffect(() => {
    const index = current - 1;
    if (!files || files.length === 0) {
      setDisplayIndices([]);
      return;
    }

    let list = [];
    if (preload) {
      const prevIndex = index > 0 ? index - 1 : null;
      const nextIndex = index < files.length - 1 ? index + 1 : null;
      list = [prevIndex, index, nextIndex];
    } else {
      list = [index];
    }
    const newIndices = list.filter(
      (idx): idx is number => idx !== null,
    );

    setDisplayIndices(newIndices);
  }, [current, files, preload]);

  const index = current - 1;

  const handleAdapt = useCallback(
    (zoom: number) => {
      dispatch({ type: "ADAPT_ZOOM", payload: { index, scale: zoom } });
    },
    [dispatch, index],
  );

  const handleWheelZoom = useCallback(
    (scale: number) => {
      dispatch({ type: "SET_ZOOM", payload: { index, scale } });
    },
    [dispatch, index],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          dispatch({ type: "PREV_IMAGE" });
          break;
        case "ArrowRight":
          e.preventDefault();
          dispatch({ type: "NEXT_IMAGE" });
          break;
        case "+":
        case "=":
          e.preventDefault();
          dispatch({ type: "ZOOM_IN", payload: { index, step: 0.1 } });
          break;
        case "-":
          e.preventDefault();
          dispatch({ type: "ZOOM_OUT", payload: { index, step: 0.1 } });
          break;
        case "r":
        case "R":
          e.preventDefault();
          {
            const file = files[index];
            dispatch({
              type: "CLEAR_IMAGE",
              payload: {
                index,
                angle: file?.angle ?? 0,
                scale: file?.scale ?? 1,
              },
            });
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [dispatch, index, files]);

  return (
    <main className="flex-image-viewer-content" aria-label="图片内容">
      <div className="flex-image-viewer-content-tool-left">
        <span
          onClick={() => dispatch({ type: "PREV_IMAGE" })}
          aria-label="上一张图片"
          role="button"
          tabIndex={0}
        >
          <Icon name="ArrowLeft" />
        </span>
      </div>
      <div className="flex-image-viewer-content-image">
        {displayIndices.map((displayIndex) => {
          const isVisible = displayIndex === index;
          return (
            <Image
              key={displayIndex}
              file={files?.[displayIndex]}
              scale={imageOptions?.[displayIndex]?.scale}
              angle={imageOptions?.[displayIndex]?.angle}
              isAdapt={imageOptions?.[displayIndex]?.isAdapt}
              onAdapt={handleAdapt}
              wheelZoom={wheelZoom}
              wheelZoomStep={wheelZoomStep}
              onWheelZoom={handleWheelZoom}
              getSrc={getSrc}
              style={{ display: isVisible ? "flex" : "none" }}
            />
          );
        })}
      </div>
      <div className="flex-image-viewer-content-tool-right">
        <span
          onClick={() => dispatch({ type: "NEXT_IMAGE" })}
          aria-label="下一张图片"
          role="button"
          tabIndex={0}
        >
          <Icon name="ArrowRight" />
        </span>
      </div>
    </main>
  );
}

export default Content;
