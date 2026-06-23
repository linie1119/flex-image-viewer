import React, { useEffect, useCallback } from "react";
import { useDeepCompareEffect } from "ahooks";

import {
  ViewerProvider,
  useViewerState,
  useViewerDispatch,
} from "@/context/ViewerContext";
import { useImageOperations } from "@/hooks/useImageOperations";
import Modal from "@/components/Modal";
import Header from "./Header";
import Content from "./Content";
import Info from "./Info";
import Thumbnail from "./Thumbnail";
import Footer from "./Footer";

import type { ImageProps, ModalProps } from "@/components";
import type { FileData } from "@/types";
import type { ThumbnailImageProps } from "@/components/ThumbnailIamge";

import type { HeaderActionsProps } from "./Header/Actions";
import type { FooterActionsProps } from "./Footer/Actions";
import type { InfoProps } from "./Info";
import type { ContentProps } from "./Content";

import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";

import "./index.css";

export interface FlexImageViewerProps<T extends FileData> extends Omit<
  ModalProps,
  "children"
>, InfoProps, Pick<ThumbnailImageProps<T>, 'getThumbnail'>, Pick<ImageProps<T>, 'getSrc'>, Pick<ContentProps<T>, 'wheelZoom' | 'wheelZoomStep' | 'preload'> {
  files?: T[];
  current?: number;
  loop?: boolean;
  onClear?: () => void;
  onIndexChange?: (index: number) => void;
  headerProps?: Pick<HeaderActionsProps<T>, "renderAction">;
  footerProps?: Pick<FooterActionsProps<T>, "renderAction">;
}

function FlexImageViewerInner<T extends FileData>({
  files,
  current = 1,
  loop = false,
  onIndexChange,
  headerProps,
  footerProps,
  onClear,
  onClose,
  wheelZoom = true,
  wheelZoomStep = 0.1,
  renderInfo,
  getSrc,
  getThumbnail,
  preload,
  ...rest
}: FlexImageViewerProps<T>) {
  const state = useViewerState();
  const dispatch = useViewerDispatch();

  const prevCurrentRef = React.useRef(current);
  useEffect(() => {
    if (current !== prevCurrentRef.current) {
      prevCurrentRef.current = current;
      if (current !== state.currentIndex) {
        dispatch({ type: "SET_CURRENT_INDEX", payload: current });
      }
    }
  }, [current, state.currentIndex, dispatch]);

  useEffect(() => {
    if (state.currentIndex !== current && onIndexChange) {
      onIndexChange(state.currentIndex);
    }
  }, [state.currentIndex, current, onIndexChange]);

  useDeepCompareEffect(() => {
    dispatch({ type: "SET_LOOP", payload: loop });
    dispatch({
      type: "INITIALIZE_FILES",
      payload: { files: files ?? [] },
    });
  }, [files, loop]);

  const imageOps = useImageOperations(state, dispatch);

  const handleClear = useCallback(() => {
    imageOps.clear();
    onClear?.();
  }, [imageOps, onClear]);

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  return (
    <Modal onClose={handleClose} {...rest}>
      <div
        className={`flex-image-viewer ${state.thumbnailVisible ? "with-thumbnail" : ""} ${state.infoVisible ? "with-info" : ""}`}
      >
        <Header<T>
          renderAction={headerProps?.renderAction}
          onClose={handleClose}
          onClear={handleClear}
          updateCurrentFile={imageOps.updateCurrentFile}
        />
        <div className="flex-image-viewer-main">
          <Content
            preload={preload}
            wheelZoom={wheelZoom}
            wheelZoomStep={wheelZoomStep}
            getSrc={getSrc}
            onClose={handleClose}
          />
          <Info renderInfo={renderInfo} />
        </div>
        <Thumbnail getThumbnail={getThumbnail} />
        <Footer<T>
          renderAction={footerProps?.renderAction}
          updateCurrentFile={imageOps.updateCurrentFile}
        />
      </div>
    </Modal>
  );
}

function FlexImageViewer<T extends FileData>(props: FlexImageViewerProps<T>) {
  const { current = 1, files } = props;

  return (
    <ViewerProvider
      initialCurrent={current}
      initialFilesLength={files?.length ?? 0}
    >
      <FlexImageViewerInner {...props} />
    </ViewerProvider>
  );
}

export default FlexImageViewer;
