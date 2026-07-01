import React, { useEffect, useState, useRef } from 'react';

import { useImageSource } from '@/hooks/useImageSource';

import type { FileData } from '@/types';

const MIN_SCALE = 0.1;
const MAX_SCALE = 8;
const DEFAULT_WHEEL_ZOOM_STEP = 0.1;

export interface ImageProps<T extends FileData> {
  file?: T;
  angle?: number;
  scale?: number;
  getSrc?: (file: T) => Promise<string>;
  isAdapt?: boolean;
  onAdapt?: (zoom: number) => void;
  wheelZoom?: boolean;
  wheelZoomStep?: number;
  onWheelZoom?: (scale: number) => void;
  style?: React.CSSProperties;
}

function Image<T extends FileData>(props: ImageProps<T>) {
  const {
    file,
    angle = 0,
    scale: oriScale = 1,
    getSrc,
    isAdapt = true,
    onAdapt,
    wheelZoom = true,
    wheelZoomStep = DEFAULT_WHEEL_ZOOM_STEP,
    onWheelZoom,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const internalImgRef = useRef<HTMLImageElement>(null);
  const scaleRef = useRef(oriScale);
  const wheelZoomStepRef = useRef(wheelZoomStep);
  const onWheelZoomRef = useRef(onWheelZoom);

  const [scale, setScale] = useState(oriScale);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { src, loading } = useImageSource(file, getSrc);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

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

      const newScale = Math.min(scaleX, scaleY);

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
  }, [angle, src, isAdapt, oriScale, onAdapt]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !wheelZoom) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1 : -1;
      const step = wheelZoomStepRef.current;
      const nextScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scaleRef.current + delta * step));
      if (nextScale !== scaleRef.current) {
        setScale(nextScale);
        onWheelZoomRef.current?.(nextScale);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [wheelZoom]);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  return (
    <figure ref={containerRef} className="flex-image-viewer-container" style={style}>
      <img
        ref={internalImgRef}
        className="flex-image-viewer-image"
        src={src}
        alt={file?.alt}
        onLoad={handleLoad}
        onError={handleError}
        style={{
          transform: `rotate(${angle}deg) scale(${scale})`,
          opacity: isLoaded && !hasError ? 1 : 0,
        }}
      />
      {loading && <div className="flex-image-viewer-loading" />}
      {hasError && <div className="flex-image-viewer-error" style={{ position: 'absolute' }} />}
    </figure>
  );
}

export default Image;
