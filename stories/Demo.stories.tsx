import React, { useState, useMemo } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { FlexImageViewer, ActionItem, TOOLTIP_CONFIG } from '../src';

import type { FileData } from '../src';

interface DemoProps {
  fileCount?: number;
  preload?: boolean;
  srcDelay?: number;
  thumbnailDelay?: number;
  wheelZoom?: boolean;
  dragPan?: boolean;
  disableRightClick?: boolean;
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

const Demo: React.FC<DemoProps> = ({
  fileCount = 50,
  preload = false,
  srcDelay = 2000,
  thumbnailDelay = 2000,
  wheelZoom = true,
  dragPan = true,
  disableRightClick = false,
}) => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(0);

  const files = useMemo(() => generateFiles(fileCount), [fileCount]);

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <div>
      <button onClick={() => setVisible(true)}>打开 Modal</button>
      <p>提示：在图片区域滚动鼠标滚轮可进行缩放；放大后按住鼠标左键可拖拽查看</p>
      <FlexImageViewer<FileData & { url: string; thumbnailUrl: string }>
        files={files}
        visible={visible}
        onClose={handleClose}
        current={current}
        onIndexChange={setCurrent}
        preload={preload}
        wheelZoom={wheelZoom}
        dragPan={dragPan}
        disableRightClick={disableRightClick}
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
                <ActionItem tooltip={TOOLTIP_CONFIG.thumbnail}>{actions.thumbnail}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.info}>{actions.info}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.zoomAdapt}>{actions.zoomAdapt}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.zoomSelect}>{actions.zoomSelect}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.zoomIn}>{actions.zoomIn}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.zoomSlider}>{actions.zoomSlider}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.zoomOut}>{actions.zoomOut}</ActionItem>
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
                <ActionItem tooltip={TOOLTIP_CONFIG.rotateLeft}>{actions.rotateLeft}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.rotateRight}>{actions.rotateRight}</ActionItem>
                <ActionItem
                  onClick={() => {
                    console.log('edit: ', current, files);
                  }}
                  tooltip="编辑"
                >
                  编辑
                </ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.clear}>{actions.clear}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.close}>{actions.close}</ActionItem>
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
    wheelZoom: { control: 'boolean' },
    dragPan: { control: 'boolean' },
    disableRightClick: { control: 'boolean' },
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

export const DisableDragPan: Story = {
  args: {
    fileCount: 5,
    preload: false,
    srcDelay: 0,
    thumbnailDelay: 0,
    dragPan: false,
  },
};

export const DisableRightClick: Story = {
  args: {
    fileCount: 5,
    preload: false,
    srcDelay: 0,
    thumbnailDelay: 0,
    disableRightClick: true,
  },
};
