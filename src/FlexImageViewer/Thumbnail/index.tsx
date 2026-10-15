import { useEffect, useRef, useState } from 'react';
import { useMemoizedFn } from 'ahooks';

import { useViewerState, useViewerDispatch } from '@/context/ViewerContext';

import ThumbnailImage from '@/components/ThumbnailImage';

import type { ThumbnailImageProps } from '@/components/ThumbnailImage';
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
  resolveFile?: ResolveFile<T, U>;
  onClick: () => void;
}

// 与 CSS 变量对应：--fiv-size-thumbnail-width (90px) + --fiv-spacing-md * 2 (6px * 2)
const THUMBNAIL_ITEM_WIDTH = 90 + 6 * 2;
const BUFFER_COUNT = 10;

function ThumbnailItem<T extends FileData, U = unknown>(props: ThumbnailItemProps<T, U>) {
  const { file, idx, currentIdx, angle, resolveFile, onClick } = props;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <li
      className={currentIdx === idx ? 'flex-image-viewer-thumbnail-active' : ''}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`缩略图 ${idx + 1}`}
      role="button"
      tabIndex={0}
    >
      <ThumbnailImage<T, U> file={file as T} index={idx} angle={angle} resolveFile={resolveFile} />
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
  const [range, setRange] = useState({ start: 0, end: -1 });
  const visibleIndicesRef = useRef<Set<number>>(new Set());

  const updateVisibleRange = useMemoizedFn(() => {
    const el = scrollRef.current;
    if (!el || !visible || thumbnails.length === 0) return;

    const scrollLeft = el.scrollLeft;
    const containerWidth = el.clientWidth;

    let visibleStart: number;
    let visibleEnd: number;

    if (containerWidth === 0) {
      // 容器尚未获得尺寸，渲染默认范围避免死循环
      visibleStart = 0;
      visibleEnd = Math.min(thumbnails.length - 1, BUFFER_COUNT * 2);
    } else {
      visibleStart = Math.max(0, Math.floor(scrollLeft / THUMBNAIL_ITEM_WIDTH));
      visibleEnd = Math.min(
        thumbnails.length - 1,
        Math.ceil((scrollLeft + containerWidth) / THUMBNAIL_ITEM_WIDTH) - 1
      );
    }

    const renderStart = Math.max(0, visibleStart - BUFFER_COUNT);
    const renderEnd = Math.min(thumbnails.length - 1, visibleEnd + BUFFER_COUNT);

    setRange({ start: renderStart, end: renderEnd });

    // 通知外部 viewport 变化
    const newVisibleSet = new Set<number>();
    for (let i = visibleStart; i <= visibleEnd; i++) {
      newVisibleSet.add(i);
    }

    const prevSet = visibleIndicesRef.current;
    const hasChanged =
      prevSet.size !== newVisibleSet.size ||
      Array.from(newVisibleSet).some((i) => !prevSet.has(i)) ||
      Array.from(prevSet).some((i) => !newVisibleSet.has(i));

    if (hasChanged) {
      visibleIndicesRef.current = newVisibleSet;
      onViewportChange?.(newVisibleSet);
    }
  });

  // 当 current 变化或面板显示时，滚动到当前缩略图并更新可见范围
  useEffect(() => {
    if (!visible || thumbnails.length === 0) return;

    const doScroll = () => {
      const div = scrollRef.current;
      if (!div) return;
      const targetScrollLeft =
        current * THUMBNAIL_ITEM_WIDTH - div.clientWidth / 2 + THUMBNAIL_ITEM_WIDTH / 2;
      const maxScrollLeft = Math.max(0, thumbnails.length * THUMBNAIL_ITEM_WIDTH - div.clientWidth);
      // 临时禁用 CSS smooth scroll，避免虚拟列表重新计算时动画被中断
      const originalBehavior = div.style.scrollBehavior;
      div.style.scrollBehavior = 'auto';
      div.scrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
      div.style.scrollBehavior = originalBehavior;
    };

    // 立即执行滚动 + 更新范围
    doScroll();
    updateVisibleRange();

    // 缩略图面板展开有 CSS transition，transition 结束后再执行一次兜底
    const el = scrollRef.current;
    const nav = el?.closest('.flex-image-viewer-thumbnail');
    if (nav) {
      const handleTransitionEnd = () => {
        doScroll();
        updateVisibleRange();
      };
      nav.addEventListener('transitionend', handleTransitionEnd);
      const timer = setTimeout(() => {
        doScroll();
        updateVisibleRange();
      }, 500);
      return () => {
        nav.removeEventListener('transitionend', handleTransitionEnd);
        clearTimeout(timer);
      };
    }
  }, [visible, current, thumbnails.length, updateVisibleRange]);

  // 监听滚动和窗口大小变化
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateVisibleRange();

    el.addEventListener('scroll', updateVisibleRange, { passive: true });
    window.addEventListener('resize', updateVisibleRange);

    return () => {
      el.removeEventListener('scroll', updateVisibleRange);
      window.removeEventListener('resize', updateVisibleRange);
    };
  }, [updateVisibleRange]);

  // 监听容器尺寸变化
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      updateVisibleRange();
    });

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [updateVisibleRange]);

  // 文件列表变化时重置可见索引并重新计算
  useEffect(() => {
    visibleIndicesRef.current = new Set();
    updateVisibleRange();
  }, [thumbnails.length, updateVisibleRange]);

  const handleWheel = useMemoizedFn((e: React.WheelEvent<HTMLDivElement>) => {
    const el = scrollRef.current;
    if (!el) return;
    e.preventDefault();
    el.scrollLeft += e.deltaY;
  });

  const visibleThumbnails = thumbnails.slice(range.start, range.end >= 0 ? range.end + 1 : 0);

  return (
    <nav
      className={`flex-image-viewer-thumbnail ${visible ? 'visible' : ''}`}
      aria-label="缩略图导航"
    >
      <div ref={scrollRef} onWheel={handleWheel}>
        <ul>
          {range.start > 0 && (
            <li
              aria-hidden="true"
              style={{
                width: range.start * THUMBNAIL_ITEM_WIDTH,
                height: 0,
                padding: 0,
                margin: 0,
                border: 'none',
                background: 'transparent',
                flexShrink: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            />
          )}
          {visibleThumbnails.map((item, i) => {
            const idx = range.start + i;
            return (
              <ThumbnailItem<T, U>
                key={idx}
                file={item}
                idx={idx}
                currentIdx={current}
                angle={imageOptions?.[idx]?.angle}
                resolveFile={resolveFile}
                onClick={() => dispatch({ type: 'SET_CURRENT_INDEX', payload: idx })}
              />
            );
          })}
          {range.end < thumbnails.length - 1 && (
            <li
              aria-hidden="true"
              style={{
                width: (thumbnails.length - 1 - range.end) * THUMBNAIL_ITEM_WIDTH,
                height: 0,
                padding: 0,
                margin: 0,
                border: 'none',
                background: 'transparent',
                flexShrink: 0,
                overflow: 'hidden',
                pointerEvents: 'none',
              }}
            />
          )}
        </ul>
      </div>
    </nav>
  );
}

export default Thumbnail;
