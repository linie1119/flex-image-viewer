import { useCreation } from 'ahooks';

import { useViewerState, useViewerDispatch } from '@/context/ViewerContext';
import { Icon } from '@/components';

import type { FileData } from '@/types';

export interface InfoProps<T extends FileData> {
  renderInfo?: (file: T) => React.ReactNode;
}

function Info<T extends FileData>(props: InfoProps<T>) {
  const { renderInfo } = props;

  const state = useViewerState<T>();
  const dispatch = useViewerDispatch();
  const visible = state.infoVisible;
  const files = state.files;
  const current = state.currentIndex;
  const fileData = files[current];

  const content = useCreation(() => {
    return renderInfo ? (
      renderInfo(fileData)
    ) : (
      <ul>
        {fileData?.infoData?.map((item, index) => (
          <li key={index}>
            <span>{item.label}：</span>
            <p>{item.value}</p>
          </li>
        ))}
      </ul>
    );
  }, [fileData, renderInfo]);

  return (
    <div className={`flex-image-viewer-info ${visible ? 'visible' : ''}`}>
      <div className="flex-image-viewer-info-tool">
        <span
          aria-label="切换信息面板"
          role="button"
          tabIndex={0}
          onClick={() => dispatch({ type: 'TOGGLE_INFO' })}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              dispatch({ type: 'TOGGLE_INFO' });
            }
          }}
        >
          <Icon name="CaretRight" />
        </span>
      </div>
      {content}
    </div>
  );
}

export default Info;
