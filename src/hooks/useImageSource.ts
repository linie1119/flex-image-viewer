import { useEffect, useState, useRef } from 'react';

import { DEFAULT_IMAGE } from '@/utils/source';

import type { FileData } from '@/types';

export interface UseImageSourceResult {
  src: string;
  loading: boolean;
}
export function useImageSource<T extends FileData = FileData>(
  file?: T,
  getSrc?: (file: T) => Promise<string>
): UseImageSourceResult {
  const [src, setSrc] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(false);
  const requestIdRef = useRef<number>(0);
  const getSrcRef = useRef(getSrc);

  getSrcRef.current = getSrc;

  useEffect(() => {
    if (!file) {
      setSrc(DEFAULT_IMAGE);
      setLoading(false);
      return;
    }

    const currentRequestId = ++requestIdRef.current;

    if (getSrcRef.current) {
      let cancelled = false;
      setLoading(true);

      getSrcRef
        .current(file)
        .then((src) => {
          if (!cancelled && currentRequestId === requestIdRef.current) {
            setSrc(src);
            setLoading(false);
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
    } else {
      setSrc(file.src ?? DEFAULT_IMAGE);
      setLoading(false);
    }
  }, [file]);

  return { src, loading };
}
