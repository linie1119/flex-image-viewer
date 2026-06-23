import React, { useMemo } from "react";
import Slider from "rc-slider";
import Tooltip from "rc-tooltip";

import { Icon, PercentSelect } from "@/components";
import { TOOLTIP_CONFIG } from "@/utils/dict";

const ARIA_LABEL_MAP: Record<string, string> = {
  rotateLeft: "向左旋转图片",
  rotateRight: "向右旋转图片",
  clear: "重置图片",
  close: "关闭查看器",
  thumbnail: "显示或隐藏缩略图",
  info: "显示或隐藏图片信息",
  zoomAdapt: "自适应缩放",
  zoomSelect: "选择缩放比例",
  zoomOut: "缩小图片",
  zoomSlider: "调整缩放比例",
  zoomIn: "放大图片",
  arrowLeft: "上一张图片",
  arrowRight: "下一张图片",
};
import { getScaleValue, getSliderValue } from "./PercentSelect";

export type ActionType = "icon" | "slider" | "select";

export interface BaseActionItem {
  key: string;
  type: ActionType;
  tooltipKey?: string;
  iconName?: string;
  tooltipPlacement?: "topRight" | "bottomRight" | "topLeft" | "bottomLeft";
  valueKey?: string;
}

export interface BaseActionsProps<
  C extends Record<string, unknown> = Record<string, unknown>,
> {
  items: BaseActionItem[];
  contextValues: C;
  renderAction?: (
    actions: Record<string, React.ReactNode>,
    context: C,
  ) => React.ReactNode;
  onAction: (key: string, value?: unknown, event?: React.MouseEvent) => void;
}

export default function BaseActions<
  C extends Record<string, unknown> = Record<string, unknown>,
>(props: BaseActionsProps<C>) {
  const { items, contextValues, renderAction, onAction } = props;

  const actionElements = useMemo(() => {
    const elementsMap: Record<string, React.ReactNode> = {};

    items.forEach((item) => {
      const {
        key,
        type,
        tooltipKey,
        iconName,
        tooltipPlacement = "topRight",
        valueKey,
      } = item;

      let content: React.ReactNode = null;

      if (type === "slider") {
        if (!valueKey) return;
        const value = contextValues[valueKey];

        content = (
          <Slider
            value={getSliderValue(value as number)}
            onChange={(val) => {
              if (!Array.isArray(val) && val !== null) {
                onAction(key, getScaleValue(val));
              }
            }}
            min={getSliderValue(10)}
            style={{ width: 100, position: "relative", top: 6 }}
          />
        );
      } else if (type === "select") {
        if (!valueKey) return;
        const value = contextValues[valueKey];
        content = (
          <PercentSelect
            value={value as number}
            onChange={(val) => onAction(key, val)}
          />
        );
      } else {
        const handleClick = (e: React.MouseEvent) => {
          onAction(key, undefined, e);
        };

        const ariaLabel = tooltipKey
          ? ARIA_LABEL_MAP[tooltipKey] ||
            TOOLTIP_CONFIG[tooltipKey] ||
            tooltipKey
          : key;
        content = (
          <Tooltip
            overlay={tooltipKey ? TOOLTIP_CONFIG[tooltipKey] : ""}
            placement={tooltipPlacement}
            showArrow={false}
          >
            <Icon
              name={iconName || key}
              onClick={handleClick}
              key={key}
              aria-label={ariaLabel}
            />
          </Tooltip>
        );
      }

      elementsMap[key] = content;
    });

    return elementsMap;
  }, [items, contextValues, onAction]);

  return (
    <ul className="flex-image-viewer-actions">
      {renderAction
        ? renderAction(actionElements, contextValues)
        : Object.keys(actionElements).map((key) => (
            <li key={key}>{actionElements[key]}</li>
          ))}
    </ul>
  );
}
