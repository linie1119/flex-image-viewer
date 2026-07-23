import React, { useEffect, useState, useRef } from 'react';

import { useImageSource } from '@/hooks/useImageSource';
import { DEFAULT_WHEEL_ZOOM_STEP, MIN_SCALE, MAX_SCALE } from '@/utils/constant';

import type { FileData } from '@/types';

export interface ImageProps<T extends FileData> {
  file?: T;
  angle?: number;
  scale?: number;
  isAdapt?: boolean;
  wheelZoom?: boolean;
  wheelZoomStep?: number;
  dragPan?: boolean;
  disableRightClick?: boolean;
  style?: React.CSSProperties;
  onAdapt?: (zoom: number) => void;
  onWheelZoom?: (scale: number) => void;
  onOrientation?: (orientation: number) => void;
  getSrc?: (file: T) => Promise<string>;
}

function Image<T extends FileData>(props: ImageProps<T>) {
  const {
    file,
    angle = 0,
    scale: oriScale = 1,
    isAdapt = true,
    wheelZoom = true,
    wheelZoomStep = DEFAULT_WHEEL_ZOOM_STEP,
    dragPan = true,
    disableRightClick = false,
    style,
    onAdapt,
    onWheelZoom,
    onOrientation,
    getSrc,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const internalImgRef = useRef<HTMLImageElement>(null);
  const scaleRef = useRef(oriScale);
  const wheelZoomStepRef = useRef(wheelZoomStep);
  const onWheelZoomRef = useRef(onWheelZoom);
  const angleRef = useRef(angle);

  const [scale, setScale] = useState(oriScale);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const dragStartRef = useRef({
    x: 0,
    y: 0,
    tx: 0,
    ty: 0,
    hasDragged: false,
  });

  const translateXRef = useRef(0);
  const translateYRef = useRef(0);

  const { src, loading, orientation } = useImageSource(file, getSrc);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (orientation !== undefined) {
      onOrientation?.(orientation);
    }
  }, [orientation, onOrientation]);

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    wheelZoomStepRef.current = wheelZoomStep;
  }, [wheelZoomStep]);

  useEffect(() => {
    onWheelZoomRef.current = onWheelZoom;
  }, [onWheelZoom]);

  useEffect(() => {
    angleRef.current = angle;
  }, [angle]);

  useEffect(() => {
    translateXRef.current = translateX;
  }, [translateX]);

  useEffect(() => {
    translateYRef.current = translateY;
  }, [translateY]);

  useEffect(() => {
    if (!isAdapt) {
      setScale(oriScale);
      return;
    }

    const container = containerRef.current;
    const img = internalImgRef.current;

    const calculateScale = () => {
      if (!img || !container) return;

      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const imgWidth = img.naturalWidth;
      const imgHeight = img.naturalHeight;

      if (!imgWidth || !imgHeight || !containerWidth || !containerHeight) return;

      const normalizedAngle = Math.abs(angle % 360);
      const isRotated90Or270 = normalizedAngle === 90 || normalizedAngle === 270;

      const effectiveImgWidth = isRotated90Or270 ? imgHeight : imgWidth;
      const effectiveImgHeight = isRotated90Or270 ? imgWidth : imgHeight;

      const scaleX = containerWidth / effectiveImgWidth;
      const scaleY = containerHeight / effectiveImgHeight;

      const newScale =
        scaleX >= 1 && scaleY >= 1 ? 1 : Math.round(Math.min(scaleX, scaleY) * 100) / 100;

      setScale(newScale);
      onAdapt?.(newScale);
      setIsLoaded(true);
    };

    calculateScale();

    let resizeObserver: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(calculateScale);
      resizeObserver.observe(container);
    }

    if (img) {
      img.addEventListener('load', calculateScale);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (img) {
        img.removeEventListener('load', calculateScale);
      }
    };
  }, [angle, isAdapt, oriScale, onAdapt]);

  const clampTranslate = (tx: number, ty: number, s: number) => {
    const container = containerRef.current;
    const img = internalImgRef.current;
    if (!container || !img) return { x: tx, y: ty };

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    if (!imgWidth || !imgHeight || !containerWidth || !containerHeight) {
      return { x: tx, y: ty };
    }

    const currentAngle = angleRef.current;
    const normalizedAngle = Math.abs(currentAngle % 360);
    const isRotated90Or270 = normalizedAngle === 90 || normalizedAngle === 270;

    const effectiveImgWidth = isRotated90Or270 ? imgHeight : imgWidth;
    const effectiveImgHeight = isRotated90Or270 ? imgWidth : imgHeight;

    const scaledWidth = effectiveImgWidth * s;
    const scaledHeight = effectiveImgHeight * s;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    return {
      x: maxX === 0 ? 0 : Math.max(-maxX, Math.min(maxX, tx)),
      y: maxY === 0 ? 0 : Math.max(-maxY, Math.min(maxY, ty)),
    };
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !wheelZoom) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      const step = wheelZoomStepRef.current;
      const oldScale = scaleRef.current;
      const newScale =
        Math.round(Math.max(MIN_SCALE, Math.min(MAX_SCALE, oldScale + delta * step)) * 100) / 100;
      if (newScale !== oldScale) {
        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - rect.width / 2;
        const mouseY = e.clientY - rect.top - rect.height / 2;

        const scaleRatio = newScale / oldScale;
        const currentTx = translateXRef.current;
        const currentTy = translateYRef.current;
        const relX = mouseX - currentTx;
        const relY = mouseY - currentTy;

        const newTx = currentTx + relX * (1 - scaleRatio);
        const newTy = currentTy + relY * (1 - scaleRatio);

        const clamped = clampTranslate(newTx, newTy, newScale);
        setTranslateX(clamped.x);
        setTranslateY(clamped.y);
        translateXRef.current = clamped.x;
        translateYRef.current = clamped.y;

        setScale(newScale);
        scaleRef.current = newScale;
        onWheelZoomRef.current?.(newScale);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [wheelZoom]);

  const calculateBounds = () => {
    const container = containerRef.current;
    const img = internalImgRef.current;
    if (!container || !img) return { maxX: 0, maxY: 0 };

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;

    if (!imgWidth || !imgHeight || !containerWidth || !containerHeight) {
      return { maxX: 0, maxY: 0 };
    }

    const normalizedAngle = Math.abs(angle % 360);
    const isRotated90Or270 = normalizedAngle === 90 || normalizedAngle === 270;

    const effectiveImgWidth = isRotated90Or270 ? imgHeight : imgWidth;
    const effectiveImgHeight = isRotated90Or270 ? imgWidth : imgHeight;

    const scaledWidth = effectiveImgWidth * scale;
    const scaledHeight = effectiveImgHeight * scale;

    const maxX = Math.max(0, (scaledWidth - containerWidth) / 2);
    const maxY = Math.max(0, (scaledHeight - containerHeight) / 2);

    return { maxX, maxY };
  };

  useEffect(() => {
    const clamped = clampTranslate(translateXRef.current, translateYRef.current, scale);
    if (clamped.x !== translateX || clamped.y !== translateY) {
      setTranslateX(clamped.x);
      setTranslateY(clamped.y);
      translateXRef.current = clamped.x;
      translateYRef.current = clamped.y;
    }
  }, [scale, angle]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragPan) return;
    const { maxX, maxY } = calculateBounds();
    if (maxX <= 0 && maxY <= 0) return;

    e.preventDefault();
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      tx: translateX,
      ty: translateY,
      hasDragged: false,
    };
    setIsDragging(true);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;

      if (!dragStartRef.current.hasDragged) {
        if (Math.sqrt(dx * dx + dy * dy) < 3) return;
        dragStartRef.current.hasDragged = true;
      }

      const { maxX, maxY } = calculateBounds();
      setTranslateX(Math.max(-maxX, Math.min(maxX, dragStartRef.current.tx + dx)));
      setTranslateY(Math.max(-maxY, Math.min(maxY, dragStartRef.current.ty + dy)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scale, angle]);

  useEffect(() => {
    setTranslateX(0);
    setTranslateY(0);
  }, [angle]);

  useEffect(() => {
    if (isAdapt) {
      setTranslateX(0);
      setTranslateY(0);
    }
  }, [isAdapt]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  const bounds = calculateBounds();
  const cursor =
    !dragPan || (bounds.maxX <= 0 && bounds.maxY <= 0)
      ? 'default'
      : isDragging
        ? 'grabbing'
        : 'grab';

  return (
    <figure
      ref={containerRef}
      className="flex-image-viewer-container"
      style={{ ...style, cursor }}
      onMouseDown={handleMouseDown}
    >
      <img
        ref={internalImgRef}
        className="flex-image-viewer-image"
        src={src}
        alt={file?.alt}
        onLoad={handleLoad}
        onError={handleError}
        onContextMenu={(e) => {
          if (disableRightClick) {
            e.preventDefault();
          }
        }}
        draggable={false}
        style={{
          maxWidth: 'none',
          minWidth: 'auto',
          width: 'auto',
          height: 'auto',
          transform: `translate(${translateX}px, ${translateY}px) rotate(${angle}deg) scale(${scale})`,
          opacity: isLoaded && !hasError ? 1 : 0,
        }}
      />
      {loading && <div className="flex-image-viewer-loading" />}
      {hasError && <div className="flex-image-viewer-error" style={{ position: 'absolute' }} />}
    </figure>
  );
}

export default Image;
