import React, { useState, useMemo } from 'react';
import type { Meta, StoryObj } from '@storybook/react';

import { FlexImageViewer, ActionItem } from '../src';
import type { FileData } from '../src';

interface DemoProps {
  fileCount?: number;
  preload?: boolean;
  srcDelay?: number;
  thumbnailDelay?: number;
}

function generateFiles(count: number) {
  return Array.from({ length: count }).map((_, index) => {
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
}

const Demo = ({
  fileCount = 50,
  preload = false,
  srcDelay = 2000,
  thumbnailDelay = 2000,
}: DemoProps) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(1);

  const files = useMemo(() => generateFiles(fileCount), [fileCount]);

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
        preload={preload}
        getSrc={async (file: FileData & { url: string; thumbnailUrl: string }) => {
          return new Promise((resolve) => setTimeout(() => resolve(file.url), srcDelay));
        }}
        getThumbnail={async (file: FileData & { url: string; thumbnailUrl: string }) => {
          return new Promise((resolve) =>
            setTimeout(() => resolve(file.thumbnailUrl), thumbnailDelay)
          );
        }}
        footerProps={{
          renderAction: (actions) => {
            return (
              <>
                <ActionItem>{actions.thumbnail}</ActionItem>
                <ActionItem>{actions.info}</ActionItem>
                <ActionItem>{actions.zoomAdapt}</ActionItem>
                <ActionItem>{actions.zoomSelect}</ActionItem>
                <ActionItem>{actions.zoomIn}</ActionItem>
                <ActionItem>{actions.zoomSlider}</ActionItem>
                <ActionItem>{actions.zoomOut}</ActionItem>
              </>
            );
          },
        }}
        headerProps={{
          renderAction: (actions, context) => {
            return (
              <>
                <ActionItem>
                  <button
                    onClick={() =>
                      context.updateCurrentFile({
                        url: `https://placehold.co/600x400/666/fff?text=Switched`,
                      })
                    }
                  >
                    切换
                  </button>
                </ActionItem>
                <ActionItem>{actions.rotateLeft}</ActionItem>
                <ActionItem>{actions.rotateRight}</ActionItem>
                <ActionItem
                  onClick={() => {
                    console.log(111, current, files);
                  }}
                >
                  编辑
                </ActionItem>
                <ActionItem>{actions.clear}</ActionItem>
                <ActionItem>{actions.close}</ActionItem>
              </>
            );
          },
        }}
      />
    </div>
  );
};

const meta = {
  title: 'Example/Demo',
  component: Demo,
  argTypes: {
    fileCount: { control: { type: 'number', min: 1, max: 200 } },
    preload: { control: 'boolean' },
    srcDelay: { control: { type: 'number', min: 0, max: 10000, step: 500 } },
    thumbnailDelay: { control: { type: 'number', min: 0, max: 10000, step: 500 } },
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    fileCount: 50,
    preload: false,
    srcDelay: 2000,
    thumbnailDelay: 2000,
  },
};
