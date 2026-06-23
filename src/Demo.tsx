import React, { useState } from 'react';

import FlexImageViewer from './FlexImageViewer';

import type { FileData } from './types';

const files = Array.from({ length: 50 }).map((_, index) => {
  const id = index + 1;
  const w = Math.round(300 + Math.random() * 10 * 100);
  const h = Math.round(200 + Math.random() * 10 * 100);
  return {
    name: `${id}.png`,
    url: `https://placehold.co/${w}x${h}/333/fff?text=${id}`,
    thumbnailUrl: `https://placehold.co/${w}x${h}/333/fff?text=${id}`,
    alt: `${id}.png`,
    width: w,
    height: h,
    size: '100 KB',
    infoData: [
      { label: 'Size', value: `${w}x${h}` },
      { label: 'Color', value: '#333' },
      { label: 'Type', value: 'png' },
    ],
  };
});

const Demo: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(1);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div>
      <button onClick={() => setVisible(true)}>打开 Modal</button>
      <p>提示：在图片区域滚动鼠标滚轮可进行缩放</p>
      <FlexImageViewer<FileData & { url: string; thumbnailUrl: string }>
        files={files}
        visible={visible}
        onClose={handleClose}
        current={current}
        onIndexChange={setCurrent}
        preload={false}
        getSrc={async (file) => {
          return new Promise((resolve) => setTimeout(() => resolve(file.url), 2000));
        }}
        getThumbnail={async (file) => {
          return new Promise((resolve) => setTimeout(() => resolve(file.thumbnailUrl), 2000));
        }}
        footerProps={{
          renderAction: (actions) => {
            return <>
              <li>{actions.thumbnail}</li>
              <li>{actions.info}</li>
              <li>{actions.zoomSelect}</li>
              <li>{actions.zoomIn}</li>
              <li>{actions.zoomSlider}</li>
              <li>{actions.zoomOut}</li>
            </>
          }
        }}
        headerProps={{
          renderAction: (actions, context) => {
            return (
              <>
                <li>
                  <button
                    onClick={() =>
                      context.updateCurrentFile({
                        url: `https://placehold.co/600x400/666/fff?text=Switched`,
                      })
                    }
                  >
                    切换
                  </button>
                </li>
                <li>{actions.rotateLeft}</li>
                <li>{actions.rotateRight}</li>
                <li onClick={() => {
                  console.log(111, current, files);
                }}>编辑</li>
                <li>{actions.clear}</li>
                <li>{actions.close}</li>
              </>
            );
          },
        }}
      />
    </div>
  );
};

export default Demo;
