import React, { useEffect, useImperativeHandle } from 'react';
import { useDeepCompareEffect, useMemoizedFn } from 'ahooks';
import { omit } from 'es-toolkit';

import Modal from '@/components/Modal';
import { ViewerProvider, useViewerState, useViewerDispatch } from '@/context/ViewerContext';
import { useImageOperations } from '@/hooks/useImageOperations';

import type { ModalProps } from '@/components';
import type { FileData, ImageOperationState, ThumbnailViewportChangeCallback } from '@/types';
import type { ThumbnailImageProps } from '@/components/ThumbnailIamge';

import Header from './Header';
import Content from './Content';
import Info from './Info';
import Thumbnail from './Thumbnail';
import Footer from './Footer';

import type { HeaderActionsProps } from './Header/Actions';
import type { FooterActionsProps } from './Footer/Actions';
import type { InfoProps } from './Info';
import type { ContentProps } from './Content';

import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';

import './index.css';

interface FlexImageViewerInnerType {
  <T extends FileData, U = unknown>(
    props: FlexImageViewerProps<T, U> & { ref?: React.Ref<FlexImageViewerRef<T>> }
  ): React.ReactElement;
}

interface FlexImageViewerType {
  <T extends FileData, U = unknown>(
    props: FlexImageViewerProps<T, U> & { ref?: React.Ref<FlexImageViewerRef<T>> }
  ): React.ReactElement;
}

export interface FlexImageViewerRef<T extends FileData = FileData> {
  getState: () => {
    currentIndex: number;
    imageOptions: ImageOperationState[];
    files: T[];
  };
  setZoom: (index: number, scale: number) => void;
  setRotation: (index: number, angle: number) => void;
  refreshFile: (index?: number) => void;
}

export interface FlexImageViewerProps<T extends FileData, U = unknown>
  extends
    Omit<ModalProps, 'children'>,
    InfoProps<T>,
    Pick<ThumbnailImageProps<T, U>, 'resolveFile'>,
    Pick<
      ContentProps<T, U>,
      'wheelZoom' | 'wheelZoomStep' | 'dragPan' | 'preload' | 'disableRightClick'
    > {
  files?: T[];
  current?: number;
  loop?: boolean;
  infoVisible?: boolean;
  thumbnailVisible?: boolean;
  headerProps?: Pick<HeaderActionsProps<T>, 'renderAction'>;
  footerProps?: Pick<FooterActionsProps<T>, 'renderAction'>;
  onClear?: () => void;
  onIndexChange?: (index: number) => void;
  onImageOptionsChange?: (index: number, options: ImageOperationState) => void;
  onThumbnailViewportChange?: ThumbnailViewportChangeCallback;
}

const FlexImageViewerInner = React.forwardRef(function FlexImageViewerInner<
  T extends FileData,
  U = unknown,
>(
  {
    files,
    current = 0,
    loop = false,
    headerProps,
    footerProps,
    wheelZoom = true,
    wheelZoomStep = 0.1,
    dragPan = true,
    preload,
    disableRightClick = false,
    renderInfo,
    resolveFile,
    onIndexChange,
    onImageOptionsChange,
    onClear,
    onClose,
    onThumbnailViewportChange,
  }: FlexImageViewerProps<T, U>,
  ref: React.Ref<FlexImageViewerRef<T>>
) {
  const state = useViewerState<T>();
  const dispatch = useViewerDispatch();

  const prevCurrentRef = React.useRef(current);
  const reportedIndexRef = React.useRef(state.currentIndex);

  useEffect(() => {
    if (current !== prevCurrentRef.current) {
      // 外部 current prop 变化，同步到内部 state
      prevCurrentRef.current = current;
      if (current !== state.currentIndex) {
        dispatch({ type: 'SET_CURRENT_INDEX', payload: current });
      }
    } else if (
      state.currentIndex !== current &&
      state.currentIndex !== reportedIndexRef.current &&
      onIndexChange
    ) {
      // current prop 未变化，但内部 state 变了 → 内部操作触发，通知外部
      reportedIndexRef.current = state.currentIndex;
      onIndexChange(state.currentIndex);
    }
  }, [current, state.currentIndex, dispatch, onIndexChange]);

  const prevImageOptionsRef = React.useRef(state.imageOptions);

  useEffect(() => {
    const currentIndex = state.currentIndex;
    const prevOptions = prevImageOptionsRef.current;
    const currentOptions = state.imageOptions;

    const prevOpt = prevOptions[currentIndex];
    const currOpt = currentOptions[currentIndex];

    if (
      prevOpt &&
      currOpt &&
      (prevOpt.angle !== currOpt.angle ||
        prevOpt.scale !== currOpt.scale ||
        prevOpt.isAdapt !== currOpt.isAdapt)
    ) {
      onImageOptionsChange?.(currentIndex, currOpt);
    }

    prevImageOptionsRef.current = currentOptions;
  }, [state.imageOptions, state.currentIndex, onImageOptionsChange]);

  useDeepCompareEffect(() => {
    dispatch({
      type: 'INITIALIZE_FILES',
      payload: { files: files ?? [] },
    });
  }, [files, dispatch]);

  useEffect(() => {
    dispatch({ type: 'SET_LOOP', payload: loop });
  }, [loop, dispatch]);

  const imageOps = useImageOperations<T>(state, dispatch);

  useImperativeHandle(
    ref,
    () => ({
      getState: () => ({
        currentIndex: state.currentIndex,
        imageOptions: state.imageOptions,
        files: state.files,
      }),
      setZoom: (index: number, scale: number) => {
        dispatch({ type: 'SET_ZOOM', payload: { index, scale } });
      },
      setRotation: (index: number, angle: number) => {
        dispatch({ type: 'SET_ROTATION', payload: { index, angle } });
      },
      refreshFile: (index?: number) => {
        dispatch({ type: 'REFRESH_FILE', payload: { index: index ?? state.currentIndex } });
      },
    }),
    [state, dispatch]
  );

  const handleClear = useMemoizedFn(() => {
    imageOps.clear();
    onClear?.();
  });

  return (
    <div
      className={`flex-image-viewer ${state.thumbnailVisible ? 'with-thumbnail' : ''} ${state.infoVisible ? 'with-info' : ''}`}
    >
      <Header<T>
        renderAction={headerProps?.renderAction}
        onClose={onClose}
        onClear={handleClear}
        updateCurrentFile={imageOps.updateCurrentFile}
        refreshFile={imageOps.refreshFile}
        currentFile={state.files[state.currentIndex]}
      />
      <div className="flex-image-viewer-main">
        <Content<T, U>
          preload={preload}
          wheelZoom={wheelZoom}
          wheelZoomStep={wheelZoomStep}
          dragPan={dragPan}
          disableRightClick={disableRightClick}
          resolveFile={resolveFile}
          onClose={onClose}
        />
        <Info<T> renderInfo={renderInfo} />
      </div>
      <Thumbnail<T, U> resolveFile={resolveFile} onViewportChange={onThumbnailViewportChange} />
      <Footer<T>
        renderAction={footerProps?.renderAction}
        updateCurrentFile={imageOps.updateCurrentFile}
        refreshFile={imageOps.refreshFile}
        currentFile={state.files[state.currentIndex]}
      />
    </div>
  );
}) as unknown as FlexImageViewerInnerType;

const FlexImageViewer = React.forwardRef(function FlexImageViewer<T extends FileData>(
  props: FlexImageViewerProps<T>,
  ref: React.Ref<FlexImageViewerRef<T>>
) {
  const { current = 0, files, infoVisible = false, thumbnailVisible = false, onClose } = props;

  return (
    <Modal onClose={onClose} {...omit(props, ['infoVisible'])}>
      <ViewerProvider
        initialCurrent={current}
        initialFilesLength={files?.length ?? 0}
        initialInfoVisible={infoVisible}
        initialThumbnailVisible={thumbnailVisible}
      >
        <FlexImageViewerInner ref={ref} {...props} />
      </ViewerProvider>
    </Modal>
  );
}) as unknown as FlexImageViewerType;

export default FlexImageViewer;
