import { useRef, useEffect, useState } from 'react';

import { useImageSource } from '@/hooks/useImageSource';

import type { FileData, ResolveFile } from '@/types';

export interface ThumbnailImageProps<T extends FileData, U = unknown> {
  file?: T;
  index: number;
  angle?: number;
  resolveFile?: ResolveFile<T, U>;
}

function ThumbnailImage<T extends FileData, U = unknown>(props: ThumbnailImageProps<T, U>) {
  const { file, index, angle = 0, resolveFile } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const { src, loading } = useImageSource<T, U>(file, index, resolveFile, true);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !containerRef.current) return;

    const container = containerRef.current;

    const calculateScale = () => {
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const imgWidth = img.naturalWidth || img.width;
      const imgHeight = img.naturalHeight || img.height;

      if (!imgWidth || !imgHeight || !containerWidth || !containerHeight) return;

      const normalizedAngle = Math.abs(angle % 360);
      const isRotated90Or270 = normalizedAngle === 90 || normalizedAngle === 270;

      const effectiveImgWidth = isRotated90Or270 ? imgHeight : imgWidth;
      const effectiveImgHeight = isRotated90Or270 ? imgWidth : imgHeight;

      const scaleX = containerWidth / effectiveImgWidth;
      const scaleY = containerHeight / effectiveImgHeight;

      const newScale = Math.min(scaleX, scaleY);

      setScale(newScale);
      setIsLoaded(true);
    };

    calculateScale();

    img.addEventListener('load', calculateScale);

    return () => {
      img.removeEventListener('load', calculateScale);
    };
  }, [angle, src]);

  const handleError = () => {
    setIsLoaded(true);
  };

  return (
    <div ref={containerRef} className="flex-image-viewer-thumbnail-container">
      <img
        ref={imgRef}
        className="flex-image-viewer-thumbnail-image"
        src={src}
        alt={file?.alt}
        onError={handleError}
        style={{
          maxWidth: 'none',
          minWidth: 'auto',
          width: 'auto',
          height: 'auto',
          transform: `rotate(${angle}deg) scale(${scale})`,
          opacity: isLoaded ? 1 : 0,
        }}
      />
      {loading && <div className="flex-image-viewer-loading" />}
    </div>
  );
}

export default ThumbnailImage;
