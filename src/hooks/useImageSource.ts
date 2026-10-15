import { useEffect, useState, useRef } from 'react';

import { DEFAULT_IMAGE } from '@/utils/source';
import { getImageOrientation } from '@/utils/exif';

import type { FileData, ResolveFile } from '@/types';

export interface UseImageSourceResult {
  src: string;
  loading: boolean;
  orientation?: number;
}

export function useImageSource<T extends FileData = FileData, U = unknown>(
  file: T | undefined,
  index: number,
  resolveFile?: ResolveFile<T, U>,
  isThumbnail?: boolean,
  refreshKey?: number,
  onMetaResolved?: (meta: Partial<T>) => void
): UseImageSourceResult {
  const [src, setSrc] = useState(DEFAULT_IMAGE);
  const [loading, setLoading] = useState(false);
  const [orientation, setOrientation] = useState<number | undefined>(undefined);
  const requestIdRef = useRef<number>(0);
  const resolveFileRef = useRef(resolveFile);
  const onMetaResolvedRef = useRef(onMetaResolved);

  useEffect(() => {
    resolveFileRef.current = resolveFile;
  }, [resolveFile]);

  useEffect(() => {
    onMetaResolvedRef.current = onMetaResolved;
  }, [onMetaResolved]);

  useEffect(() => {
    if (!file) {
      setSrc(DEFAULT_IMAGE);
      setLoading(false);
      setOrientation(undefined);
      return;
    }

    const currentRequestId = ++requestIdRef.current;
    setOrientation(undefined);

    const type = isThumbnail ? 'thumbnail' : 'content';

    const resolveSrc = async (): Promise<string> => {
      if (resolveFileRef.current) {
        const resolved = await resolveFileRef.current(file, index, type);

        if (onMetaResolvedRef.current) {
          const { src: _src, thumbnail: _thumb, ...rest } = resolved;
          const meta = Object.fromEntries(
            Object.entries(rest).filter(([_, v]) => v !== undefined)
          ) as Partial<T>;
          if (Object.keys(meta).length > 0) {
            onMetaResolvedRef.current(meta);
          }
        }

        if (isThumbnail) {
          return resolved.thumbnail ?? resolved.src ?? DEFAULT_IMAGE;
        }
        return resolved.src ?? DEFAULT_IMAGE;
      }
      if (isThumbnail) {
        return file.thumbnail ?? file.src ?? DEFAULT_IMAGE;
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
  }, [file, index, isThumbnail, refreshKey]);

  return { src, loading, orientation };
}
