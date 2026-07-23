interface InfoData {
  label: string;
  value: string;
}

export interface FileData {
  name?: string;
  description?: string;
  src?: string;
  alt?: string;
  size?: string;
  width?: string | number;
  height?: string | number;
  angle?: number;
  scale?: number;
  infoData?: InfoData[];
  orientation?: number;
}

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
  | { type: 'UPDATE_FILE'; payload: { index: number; file: Partial<T> } };
