import { useEffect, useState, useRef } from 'react';

import { DEFAULT_IMAGE } from '@/utils/source';
import { getImageOrientation } from '@/utils/exif';

import type { FileData } from '@/types';

export interface UseImageSourceResult {
  src: string;
  loading: boolean;
  orientation?: number;
}

export function useImageSource<T extends FileData = FileData>(
  file?: T,
  getSrc?: (file: T) => Promise<string>
): UseImageSourceResult {
  const [src, setSrc] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(false);
  const [orientation, setOrientation] = useState<number | undefined>(undefined);
  const requestIdRef = useRef<number>(0);
  const getSrcRef = useRef(getSrc);

  useEffect(() => {
    getSrcRef.current = getSrc;
  }, [getSrc]);

  useEffect(() => {
    if (!file) {
      setSrc(DEFAULT_IMAGE);
      setLoading(false);
      setOrientation(undefined);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setOrientation(undefined);

    const resolveSrc = async (): Promise<string> => {
      if (getSrcRef.current) {
        return getSrcRef.current(file);
      }
      return file.src ?? DEFAULT_IMAGE;
    };

    let cancelled = false;
    setLoading(true);

    resolveSrc()
      .then((resolvedSrc) => {
        if (!cancelled && currentRequestId === requestIdRef.current) {
          setSrc(resolvedSrc);
          setLoading(false);
        }

        if (resolvedSrc && resolvedSrc !== DEFAULT_IMAGE) {
          getImageOrientation(resolvedSrc).then((ori) => {
            if (!cancelled && currentRequestId === requestIdRef.current) {
              setOrientation(ori);
            }
          });
        }
      })
      .catch(() => {
        if (!cancelled && currentRequestId === requestIdRef.current) {
          setSrc(DEFAULT_IMAGE);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [file]);

  return { src, loading, orientation };
}
