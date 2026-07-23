import { useEffect, useRef } from 'react';
import { useInViewport, useMemoizedFn } from 'ahooks';

import { useViewerState, useViewerDispatch } from '@/context/ViewerContext';

import ThumbnailIamge from '@/components/ThumbnailIamge';

import type { ThumbnailImageProps } from '@/components/ThumbnailIamge';
import type { FileData } from '@/types';

type ThumbnailProps<T extends FileData> = Pick<ThumbnailImageProps<T>, 'getThumbnail'>;

interface ThumbnailItemProps<T extends FileData> {
  file: FileData;
  idx: number;
  currentIdx: number;
  angle?: number;
  getThumbnail?: (file: T) => Promise<string>;
  onClick: () => void;
  onRef: (el: HTMLLIElement | null, idx: number) => void;
}

function ThumbnailItem<T extends FileData>(props: ThumbnailItemProps<T>) {
  const { file, idx, currentIdx, angle, getThumbnail, onClick, onRef } = props;

  const ref = useRef<HTMLLIElement>(null);
  const [inViewport] = useInViewport(ref, { threshold: 0 });

  useEffect(() => {
    onRef(ref.current, idx);
    return () => onRef(null, idx);
  }, [idx, onRef]);

  const shouldRender = inViewport || idx === currentIdx;

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
        <ThumbnailIamge<T> file={file as T} angle={angle} getThumbnail={getThumbnail} />
      )}
    </li>
  );
}

function Thumbnail<T extends FileData>(props: ThumbnailProps<T>) {
  const { getThumbnail } = props;

  const state = useViewerState();
  const dispatch = useViewerDispatch();

  const thumbnails = state.files;
  const imageOptions = state.imageOptions;
  const visible = state.thumbnailVisible;
  const current = state.currentIndex;

  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map());

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
            <ThumbnailItem
              key={idx}
              file={item}
              idx={idx}
              currentIdx={current}
              angle={imageOptions?.[idx]?.angle}
              getThumbnail={getThumbnail}
              onClick={() => dispatch({ type: 'SET_CURRENT_INDEX', payload: idx })}
              onRef={handleRef}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default Thumbnail;
