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

  const updateVisibleRange = useMemoizedFn((overrideScrollLeft?: number) => {
    const el = scrollRef.current;
    if (!el || !visible || thumbnails.length === 0) return;

    const scrollLeft = overrideScrollLeft ?? el.scrollLeft;
    const containerWidth = el.clientWidth;

    let visibleStart: number;
    let visibleEnd: number;

    if (containerWidth === 0) {
      // 容器尚未获得尺寸，以 current 为中心渲染默认范围，确保当前项可见
      visibleStart = Math.max(0, current - BUFFER_COUNT);
      visibleEnd = Math.min(thumbnails.length - 1, current + BUFFER_COUNT);
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

    const div = scrollRef.current;
    if (!div) return;

    const doScroll = () => {
      if (!div) return;
      const activeItem = div.querySelector(
        '.flex-image-viewer-thumbnail-active'
      ) as HTMLElement | null;
      if (!activeItem) return;

      const containerWidth = div.clientWidth;
      const itemWidth = activeItem.offsetWidth;
      const itemLeft = activeItem.offsetLeft;
      const scrollLeft = div.scrollLeft;
      const maxScrollLeft = Math.max(0, div.scrollWidth - containerWidth);

      let targetScrollLeft: number | null = null;

      if (itemLeft < scrollLeft) {
        // 选中项在左侧外 → 滚动到左边缘对齐
        targetScrollLeft = itemLeft;
      } else if (itemLeft + itemWidth > scrollLeft + containerWidth) {
        // 选中项在右侧外 → 滚动到右边缘对齐
        targetScrollLeft = itemLeft + itemWidth - containerWidth;
      }

      // 已在视野内，不滚动
      if (targetScrollLeft === null) {
        updateVisibleRange();
        return;
      }

      const originalBehavior = div.style.scrollBehavior;
      div.style.scrollBehavior = 'auto';
      div.scrollLeft = Math.max(0, Math.min(targetScrollLeft, maxScrollLeft));
      div.style.scrollBehavior = originalBehavior;
      updateVisibleRange();
    };

    // 先基于估算的目标 scrollLeft 更新范围，触发 React 渲染 current 项
    const containerWidth = div.clientWidth;
    const scrollLeft = div.scrollLeft;
    const itemLeft = current * THUMBNAIL_ITEM_WIDTH;
    const itemWidth = THUMBNAIL_ITEM_WIDTH;

    let estimatedScrollLeft = scrollLeft;
    if (itemLeft < scrollLeft) {
      estimatedScrollLeft = itemLeft;
    } else if (itemLeft + itemWidth > scrollLeft + containerWidth) {
      estimatedScrollLeft = itemLeft + itemWidth - containerWidth;
    }
    updateVisibleRange(estimatedScrollLeft);

    // 使用 MutationObserver 监听 DOM 变化，当 activeItem 出现在 DOM 中时立即滚动
    let observer: MutationObserver | null = null;
    const checkAndScroll = () => {
      const activeItem = div.querySelector('.flex-image-viewer-thumbnail-active');
      if (activeItem) {
        observer?.disconnect();
        doScroll();
        return true;
      }
      return false;
    };

    // 如果 activeItem 已经存在（如第二次打开），直接滚动
    if (!checkAndScroll()) {
      observer = new MutationObserver(() => {
        checkAndScroll();
      });
      observer.observe(div, { childList: true, subtree: true });
    }

    // 兜底：500ms 后强制滚动
    const fallbackTimer = setTimeout(() => {
      observer?.disconnect();
      doScroll();
    }, 500);

    return () => {
      observer?.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, [visible, current, thumbnails.length, updateVisibleRange]);

  // 监听滚动和窗口大小变化
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateVisibleRange();

    const handleScroll = () => updateVisibleRange();
    const handleResize = () => updateVisibleRange();

    el.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [updateVisibleRange]);

  // 监听容器尺寸变化
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleResize = () => updateVisibleRange();
    const observer = new ResizeObserver(handleResize);

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
