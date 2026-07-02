import { useRef, useEffect, useState } from 'react';

import { useImageSource } from '@/hooks/useImageSource';

import type { FileData } from '@/types';

export interface ThumbnailImageProps<T extends FileData> {
  file?: T;
  angle?: number;
  getThumbnail?: (file: T) => Promise<string>;
}

function ThumbnailImage<T extends FileData>(props: ThumbnailImageProps<T>) {
  const { file, angle = 0, getThumbnail } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [scale, setScale] = useState(1);
  const [isLoaded, setIsLoaded] = useState(false);

  const { src, loading } = useImageSource(file, getThumbnail);

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
          transform: `rotate(${angle}deg) scale(${scale})`,
          opacity: isLoaded ? 1 : 0,
        }}
      />
      {loading && <div className="flex-image-viewer-loading" />}
    </div>
  );
}

export default ThumbnailImage;
