import { useCreation } from 'ahooks';

import { useViewerState, useViewerDispatch } from '@/context/ViewerContext';
import { Icon } from '@/components';

import type { FileData } from '@/types';

export interface InfoProps {
  renderInfo?: (file: FileData) => React.ReactNode;
}

export default function Info(props: InfoProps) {
  const { renderInfo } = props;

  const state = useViewerState();
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
        >
          <Icon name="CaretRight" />
        </span>
      </div>
      {content}
    </div>
  );
}
