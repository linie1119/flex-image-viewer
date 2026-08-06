import { useEffect, useRef } from 'react';
import { useInViewport, useMemoizedFn } from 'ahooks';

import { useViewerState, useViewerDispatch } from '@/context/ViewerContext';

import ThumbnailIamge from '@/components/ThumbnailIamge';

import type { ThumbnailImageProps } from '@/components/ThumbnailIamge';
import type { FileData, ResolveFile, ThumbnailViewportChangeCallback } from '@/types';

type ThumbnailProps<T extends FileData, U = unknown> = Pick<
  ThumbnailImageProps<T, U>,
  'resolveFile'
> & {
  onViewportChange?: ThumbnailViewportChangeCallback;
};

interface ThumbnailItemProps<T extends FileData, U = unknown> {
  file: FileData;
  idx: number;
  currentIdx: number;
  angle?: number;
  thumbnailVisible: boolean;
  resolveFile?: ResolveFile<T, U>;
  onClick: () => void;
  onRef: (el: HTMLLIElement | null, idx: number) => void;
  onViewportChange?: (idx: number, inViewport: boolean) => void;
}

function ThumbnailItem<T extends FileData, U = unknown>(props: ThumbnailItemProps<T, U>) {
  const {
    file,
    idx,
    currentIdx,
    angle,
    thumbnailVisible,
    resolveFile,
    onClick,
    onRef,
    onViewportChange,
  } = props;

  const ref = useRef<HTMLLIElement>(null);
  const [inViewport] = useInViewport(ref, { threshold: 0 });

  useEffect(() => {
    onRef(ref.current, idx);
    return () => onRef(null, idx);
  }, [idx, onRef]);

  useEffect(() => {
    onViewportChange?.(idx, inViewport ?? false);
  }, [idx, inViewport, onViewportChange]);

  const shouldRender = thumbnailVisible && (inViewport || idx === currentIdx);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <li
      ref={ref}
      className={currentIdx === idx ? 'flex-image-viewer-thumbnail-active' : ''}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`缩略图 ${idx + 1}`}
      role="button"
      tabIndex={0}
    >
      {shouldRender && (
        <ThumbnailIamge<T, U>
          file={file as T}
          index={idx}
          angle={angle}
          resolveFile={resolveFile}
        />
      )}
    </li>
  );
}

function Thumbnail<T extends FileData, U = unknown>(props: ThumbnailProps<T, U>) {
  const { resolveFile, onViewportChange } = props;

  const state = useViewerState();
  const dispatch = useViewerDispatch();

  const thumbnails = state.files;
  const imageOptions = state.imageOptions;
  const visible = state.thumbnailVisible;
  const current = state.currentIndex;

  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map());
  const visibleIndicesRef = useRef<Set<number>>(new Set());

  const handleWheel = useMemoizedFn((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  });

  const handleRef = useMemoizedFn((el: HTMLLIElement | null, idx: number) => {
    if (el) {
      itemRefs.current.set(idx, el);
    } else {
      itemRefs.current.delete(idx);
    }
  });

  const handleViewportChange = useMemoizedFn((idx: number, inViewport: boolean) => {
    if (inViewport) {
      visibleIndicesRef.current.add(idx);
    } else {
      visibleIndicesRef.current.delete(idx);
    }
    onViewportChange?.(new Set(visibleIndicesRef.current));
  });

  useEffect(() => {
    if (!thumbnails || thumbnails.length === 0) return;
    const targetElement = itemRefs.current.get(current);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [current, thumbnails]);

  return (
    <nav
      className={`flex-image-viewer-thumbnail ${visible ? 'visible' : ''}`}
      aria-label="缩略图导航"
    >
      <div ref={scrollRef} onWheel={handleWheel}>
        <ul>
          {thumbnails?.map((item, idx) => (
            <ThumbnailItem<T, U>
              key={idx}
              file={item}
              idx={idx}
              currentIdx={current}
              angle={imageOptions?.[idx]?.angle}
              thumbnailVisible={visible}
              resolveFile={resolveFile}
              onClick={() => dispatch({ type: 'SET_CURRENT_INDEX', payload: idx })}
              onRef={handleRef}
              onViewportChange={handleViewportChange}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Thumbnail;
