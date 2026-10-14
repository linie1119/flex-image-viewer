import React, { useState, useMemo, useRef } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import { FlexImageViewer, ActionItem, TOOLTIP_CONFIG } from '../src';

import type { FileData, FlexImageViewerRef } from '../src';

interface DemoFileData extends FileData {
  previewSrc?: string;
  annotationSrc?: string;
}

interface DemoProps {
  fileCount?: number;
  preload?: boolean;
  srcDelay?: number;
  thumbnailDelay?: number;
  wheelZoom?: boolean;
  dragPan?: boolean;
  disableRightClick?: boolean;
}

type ViewMode = 'original' | 'preview' | 'annotation';

function generateFiles(count: number): DemoFileData[] {
  return Array.from({ length: count }).map((_, index) => {
    const id = index + 1;
    const w = Math.round(300 + Math.random() * 10 * 100);
    const h = Math.round(200 + Math.random() * 10 * 100);
    return {
      name: `${id}.png`,
      src: `https://placehold.co/${w}x${h}/333/fff?text=${id}+Original`,
      previewSrc: `https://placehold.co/${w}x${h}/666/fff?text=${id}+Preview`,
      thumbnail: `https://placehold.co/${Math.round(w / 4)}x${Math.round(h / 4)}/999/fff?text=${id}`,
      alt: `${id}.png`,
      width: w,
      height: h,
      size: '100 KB',
      infoData: [
        { label: 'Size', value: `${w}x${h}` },
        { label: 'Color', value: '#333' },
        { label: 'Type', value: 'png' },
        {
          label: 'Details',
          value: '',
          children: [
            { label: 'Format', value: 'PNG' },
            { label: 'Depth', value: '24bit' },
            { label: 'Compression', value: 'Deflate' },
          ],
        },
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
  const [viewMode, setViewMode] = useState<ViewMode>('preview');
  const [viewportIndices, setViewportIndices] = useState<Set<number>>(new Set());

  const viewerRef = useRef<FlexImageViewerRef<DemoFileData>>(null);
  const loadingQueueRef = useRef<Map<number, AbortController>>(new Map());

  const files = useMemo(() => generateFiles(fileCount), [fileCount]);

  const handleClose = () => {
    setVisible(false);
  };

  const handleSwitchMode = (mode: ViewMode) => {
    setViewMode(mode);
    viewerRef.current?.refreshFile();
  };

  const handleEdit = (file: DemoFileData) => {
    const annotationUrl = file.previewSrc
      ?.replace('/666/', '/0f0/')
      ?.replace('+Preview', '+Annotated');
    if (annotationUrl) {
      viewerRef.current?.getState().files;
      // 通过 updateCurrentFile 保存标注图地址
      // 实际场景中这里会打开编辑器，编辑完成后回调
      setTimeout(() => {
        viewerRef.current?.getState();
        // 这里仅做演示，实际应通过 renderAction context 的 updateCurrentFile
      }, 100);
      alert(`模拟编辑完成，标注图地址：${annotationUrl}`);
      return annotationUrl;
    }
    return undefined;
  };

  const handleThumbnailViewportChange = (visibleIndices: Set<number>) => {
    console.log('Visible thumbnail indices:', Array.from(visibleIndices));
    setViewportIndices(visibleIndices);

    // 演示：进入视口的缩略图开始加载，离开视口的取消请求
    const prevIndices = new Set(loadingQueueRef.current.keys());

    // 新进入视口的：创建加载任务
    visibleIndices.forEach((idx) => {
      if (!prevIndices.has(idx)) {
        const controller = new AbortController();
        loadingQueueRef.current.set(idx, controller);
        console.log(`Start loading thumbnail ${idx}`);
        // 实际场景：startLoadImage(idx, { signal: controller.signal })
      }
    });

    // 离开视口的：取消请求
    prevIndices.forEach((idx) => {
      if (!visibleIndices.has(idx)) {
        const controller = loadingQueueRef.current.get(idx);
        if (controller) {
          controller.abort();
          loadingQueueRef.current.delete(idx);
          console.log(`Abort loading thumbnail ${idx}`);
        }
      }
    });
  };

  return (
    <div>
      <button onClick={() => setVisible(true)}>打开 Modal</button>
      <p>提示：在图片区域滚动鼠标滚轮可进行缩放；放大后按住鼠标左键可拖拽查看</p>
      <p>当前模式：{viewMode}</p>
      <p>视口中的缩略图索引：{Array.from(viewportIndices).join(', ') || '无'}</p>
      <FlexImageViewer<DemoFileData>
        ref={viewerRef}
        files={files}
        visible={visible}
        onClose={handleClose}
        current={current}
        onIndexChange={setCurrent}
        preload={preload}
        wheelZoom={wheelZoom}
        dragPan={dragPan}
        destroyOnClose
        disableRightClick={disableRightClick}
        onThumbnailViewportChange={handleThumbnailViewportChange}
        resolveFile={async (file: DemoFileData, index: number, type: 'content' | 'thumbnail') => {
          console.log('resolveFile: ', file, index, type);
          const delay = type === 'content' ? srcDelay : thumbnailDelay;
          const resolved = await new Promise<DemoFileData>((resolve) =>
            setTimeout(() => resolve(file), delay)
          );
          if (type === 'content') {
            const src =
              viewMode === 'annotation'
                ? resolved.annotationSrc || resolved.previewSrc
                : viewMode === 'preview'
                  ? resolved.previewSrc
                  : resolved.src;
            return { ...resolved, src: src || resolved.src };
          }
          return resolved;
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
                <ActionItem tooltip="原图">
                  <button
                    style={{ fontWeight: viewMode === 'original' ? 'bold' : 'normal' }}
                    onClick={() => handleSwitchMode('original')}
                  >
                    原图
                  </button>
                </ActionItem>
                <ActionItem tooltip="预览图">
                  <button
                    style={{ fontWeight: viewMode === 'preview' ? 'bold' : 'normal' }}
                    onClick={() => handleSwitchMode('preview')}
                  >
                    预览图
                  </button>
                </ActionItem>
                <ActionItem tooltip="标注图">
                  <button
                    style={{ fontWeight: viewMode === 'annotation' ? 'bold' : 'normal' }}
                    onClick={() => handleSwitchMode('annotation')}
                  >
                    标注图
                  </button>
                </ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.rotateLeft}>{actions.rotateLeft}</ActionItem>
                <ActionItem tooltip={TOOLTIP_CONFIG.rotateRight}>{actions.rotateRight}</ActionItem>
                <ActionItem
                  tooltip="编辑"
                  onClick={() => {
                    const url = handleEdit(context.currentFile);
                    if (url) {
                      context.updateCurrentFile({ annotationSrc: url });
                    }
                  }}
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
    fileCount: 4000,
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
