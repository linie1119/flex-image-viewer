# flex-image-viewer

一个功能丰富的 React 图片查看器组件，支持缩放、旋转、缩略图导航、信息面板等交互功能。

## 特性

- **图片浏览** — 支持多张图片切换浏览，可配置循环模式
- **缩放操作** — 支持放大、缩小、自适应缩放，以及鼠标滚轮缩放
- **旋转功能** — 支持左旋、右旋
- **缩略图导航** — 底部缩略图列表，快速定位图片
- **信息面板** — 展示图片详细信息（尺寸、大小等）
- **EXIF 方向识别** — 自动识别并应用图片的 EXIF 方向信息
- **预加载** — 支持图片预加载以提升浏览体验
- **禁用右键** — 支持禁用图片右键菜单
- **自定义操作** — 头部和底部操作栏支持自定义渲染
- **加载状态** — 图片加载时显示加载指示器

## 安装

```bash
pnpm install
```

## 使用

```tsx
import { useState } from 'react';
import { FlexImageViewer } from 'flex-image-viewer';
import type { FileData } from 'flex-image-viewer';

function App() {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(1);

  const files: FileData[] = [
    {
      name: 'image1.png',
      src: 'https://example.com/image1.png',
      alt: '图片1',
      width: 1920,
      height: 1080,
      size: '2.5 MB',
      infoData: [
        { label: '尺寸', value: '1920x1080' },
        { label: '格式', value: 'PNG' },
      ],
    },
  ];

  return (
    <>
      <button onClick={() => setVisible(true)}>打开查看器</button>
      <FlexImageViewer
        files={files}
        visible={visible}
        current={current}
        onClose={() => setVisible(false)}
        onIndexChange={setCurrent}
        wheelZoom
        disableRightClick={false}
      />
    </>
  );
}
```

## Props

| 属性                 | 类型                                                    | 默认值  | 说明                          |
| -------------------- | ------------------------------------------------------- | ------- | ----------------------------- |
| files                | `FileData[]`                                            | `[]`    | 图片数据列表                  |
| current              | `number`                                                | `0`     | 当前显示的图片索引（从0开始） |
| visible              | `boolean`                                               | -       | 是否显示查看器                |
| loop                 | `boolean`                                               | `false` | 是否循环浏览                  |
| onClose              | `() => void`                                            | -       | 关闭回调                      |
| onIndexChange        | `(index: number) => void`                               | -       | 图片切换回调                  |
| onClear              | `() => void`                                            | -       | 重置操作回调                  |
| onImageOptionsChange | `(index: number, options: ImageOperationState) => void` | -       | 图片操作状态变化回调          |
| infoVisible          | `boolean`                                               | `false` | 是否显示信息面板              |
| thumbnailVisible     | `boolean`                                               | `false` | 是否显示缩略图导航            |
| wheelZoom            | `boolean`                                               | `true`  | 是否启用鼠标滚轮缩放          |
| wheelZoomStep        | `number`                                                | `0.1`   | 滚轮缩放步长                  |
| preload              | `boolean`                                               | `false` | 是否预加载图片                |
| disableRightClick    | `boolean`                                               | `false` | 是否禁用右键菜单              |
| getSrc               | `(file: T) => Promise<string> \| string`                | -       | 自定义获取原图地址            |
| getThumbnail         | `(file: T) => Promise<string> \| string`                | -       | 自定义获取缩略图地址          |
| renderInfo           | `(file: T) => ReactNode`                                | -       | 自定义信息面板渲染            |
| headerProps          | `{ renderAction? }`                                     | -       | 头部操作栏配置                |
| footerProps          | `{ renderAction? }`                                     | -       | 底部操作栏配置                |

## FileData 数据结构

```ts
interface FileData {
  name?: string; // 文件名
  description?: string; // 描述
  src?: string; // 图片地址
  alt?: string; // 替代文本
  size?: string; // 文件大小
  width?: string | number; // 图片宽度
  height?: string | number; // 图片高度
  angle?: number; // 旋转角度
  scale?: number; // 缩放比例
  infoData?: { label: string; value: string }[]; // 信息面板数据
  orientation?: number; // EXIF 方向值
}
```

## 开发

### 启动开发模式

```bash
pnpm run dev
```

### 构建

```bash
pnpm run build
```

### 运行测试

```bash
pnpm run test
```

### 启动 Storybook

```bash
pnpm run storybook
```

### 启动文档站点

```bash
pnpm run doc
```

### 代码检查

```bash
pnpm run lint
```

### 代码格式化

```bash
pnpm run format
```

## 技术栈

- React 19
- TypeScript
- Rslib（构建工具）
- ahooks
- es-toolkit
- rc-slider / rc-tooltip

## License

MIT
