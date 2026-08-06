interface InfoData {
  label: string;
  value: string;
  children?: InfoData[];
}

export interface FileData {
  name?: string;
  description?: string;
  src?: string;
  thumbnail?: string;
  alt?: string;
  size?: string;
  width?: string | number;
  height?: string | number;
  angle?: number;
  scale?: number;
  infoData?: InfoData[];
  orientation?: number;
}

export type ResolveFile<T extends FileData = FileData, U = unknown> = (
  file: T,
  index: number,
  type: 'content' | 'thumbnail'
) => Promise<T & { meta?: U }>;

export interface ImageOperationState {
  angle: number;
  scale: number;
  isAdapt: boolean;
}

export interface ViewerState<T extends FileData> {
  currentIndex: number;
  imageOptions: ImageOperationState[];
  infoVisible: boolean;
  thumbnailVisible: boolean;
  filesLength: number;
  loop: boolean;
  files: T[];
  refreshKeys: number[];
  resolvedMetas: Partial<T>[];
}

export type ViewerAction<T extends FileData> =
  | { type: 'SET_CURRENT_INDEX'; payload: number }
  | { type: 'PREV_IMAGE' }
  | { type: 'NEXT_IMAGE' }
  | { type: 'ROTATE_LEFT'; payload: { index: number } }
  | { type: 'ROTATE_RIGHT'; payload: { index: number } }
  | { type: 'SET_ROTATION'; payload: { index: number; angle: number } }
  | { type: 'SET_ZOOM'; payload: { index: number; scale: number } }
  | { type: 'ZOOM_IN'; payload: { index: number; step?: number } }
  | { type: 'ZOOM_OUT'; payload: { index: number; step?: number } }
  | { type: 'ADAPT_ZOOM'; payload: { index: number; scale: number } }
  | {
      type: 'CLEAR_IMAGE';
      payload: { index: number; angle: number; scale: number };
    }
  | { type: 'TOGGLE_INFO' }
  | { type: 'TOGGLE_THUMBNAIL' }
  | { type: 'SET_LOOP'; payload: boolean }
  | { type: 'INITIALIZE_FILES'; payload: { files: T[] } }
  | { type: 'UPDATE_FILE'; payload: { index: number; file: Partial<T> } }
  | { type: 'REFRESH_FILE'; payload: { index: number } }
  | { type: 'SET_RESOLVED_META'; payload: { index: number; meta: Partial<T> } };

export type ThumbnailViewportChangeCallback = (visibleIndices: Set<number>) => void;
