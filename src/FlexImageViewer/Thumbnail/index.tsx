import { useEffect, useRef, useState, useCallback } from 'react';
import { useInViewport } from 'ahooks';

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
  const [rendered, setRendered] = useState(idx === currentIdx);

  useEffect(() => {
    onRef(ref.current, idx);
    return () => onRef(null, idx);
  }, [idx, onRef]);

  useEffect(() => {
    if ((inViewport || idx === currentIdx) && !rendered) {
      setRendered(true);
    }
  }, [inViewport, idx, currentIdx, rendered]);

  return (
    <li
      ref={ref}
      className={currentIdx === idx ? 'flex-image-viewer-thumbnail-active' : ''}
      onClick={onClick}
      key={idx}
      aria-label={`缩略图 ${idx + 1}`}
      role="button"
      tabIndex={0}
    >
      {rendered && <ThumbnailIamge<T> file={file as T} angle={angle} getThumbnail={getThumbnail} />}
    </li>
  );
}

export default function Thumbnail<T extends FileData>(props: ThumbnailProps<T>) {
  const { getThumbnail } = props;

  const state = useViewerState();
  const dispatch = useViewerDispatch();

  const thumbnails = state.files;
  const imageOptions = state.imageOptions;
  const visible = state.thumbnailVisible;
  const current = state.currentIndex;

  const itemRefs = useRef<Map<number, HTMLLIElement>>(new Map());

  const handleRef = useCallback((el: HTMLLIElement | null, idx: number) => {
    if (el) {
      itemRefs.current.set(idx, el);
    } else {
      itemRefs.current.delete(idx);
    }
  }, []);

  useEffect(() => {
    if (!thumbnails || thumbnails.length === 0) return;
    const index = current - 1;
    const targetElement = itemRefs.current.get(index);
    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [current, thumbnails]);

  const index = current - 1;

  return (
    <nav
      className={`flex-image-viewer-thumbnail ${visible ? 'visible' : ''}`}
      aria-label="缩略图导航"
    >
      <div>
        <ul>
          {thumbnails?.map((item, idx) => (
            <ThumbnailItem
              key={idx}
              file={item}
              idx={idx}
              currentIdx={index}
              angle={imageOptions?.[idx]?.angle}
              getThumbnail={getThumbnail}
              onClick={() => dispatch({ type: 'SET_CURRENT_INDEX', payload: idx + 1 })}
              onRef={handleRef}
            />
          ))}
        </ul>
      </div>
    </nav>
  );
}
