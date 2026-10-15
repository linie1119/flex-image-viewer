import React from 'react';

import Slider from 'rc-slider';

import { Icon, PercentSelect } from '@/components';
import { MAX_SCALE } from '@/utils/constant';
import { TOOLTIP_CONFIG } from '@/utils/dict';

import type { TooltipKey } from '@/utils/dict';

import ActionItem from './ActionItem';
import { getScaleValue, getSliderValue } from './PercentSelect';

export type BaseActionItem<C extends Record<string, unknown> = Record<string, unknown>> =
  | {
      key: string;
      type: 'icon';
      iconName: string;
      tooltipKey?: TooltipKey;
      tooltipPlacement?: 'topRight' | 'bottomRight' | 'topLeft' | 'bottomLeft';
    }
  | {
      key: string;
      type: 'slider';
      valueKey: keyof C;
      tooltipKey?: TooltipKey;
      tooltipPlacement?: 'topRight' | 'bottomRight' | 'topLeft' | 'bottomLeft';
    }
  | {
      key: string;
      type: 'select';
      valueKey: keyof C;
      tooltipKey?: TooltipKey;
      tooltipPlacement?: 'topRight' | 'bottomRight' | 'topLeft' | 'bottomLeft';
    };

export interface BaseActionsProps<C extends Record<string, unknown> = Record<string, unknown>> {
  items: BaseActionItem[];
  contextValues: C;
  onAction: (key: string, value?: unknown, event?: React.MouseEvent) => void;
  renderAction?: (actions: Record<string, React.ReactNode>, context: C) => React.ReactNode;
}

export default function BaseActions<C extends Record<string, unknown> = Record<string, unknown>>(
  props: BaseActionsProps<C>
) {
  const { items, contextValues, onAction, renderAction } = props;

  const actionElements: Record<string, React.ReactNode> = {};

  items.forEach((item) => {
    const { key, type } = item;

    let content: React.ReactNode = null;

    if (type === 'slider') {
      const value = contextValues[item.valueKey];

      content = (
        <span className="flex-image-viewer-action-slider">
          <Slider
            value={getSliderValue(value as number)}
            onChange={(val) => {
              if (!Array.isArray(val) && val !== null) {
                onAction(key, getScaleValue(val));
              }
            }}
            min={getSliderValue(10)}
            max={getSliderValue(MAX_SCALE * 100)}
          />
        </span>
      );
    } else if (type === 'select') {
      const value = contextValues[item.valueKey];
      content = <PercentSelect value={value as number} onChange={(val) => onAction(key, val)} />;
    } else {
      const handleClick = (e: React.MouseEvent) => {
        onAction(key, undefined, e);
      };

      const ariaLabel = item.tooltipKey ? TOOLTIP_CONFIG[item.tooltipKey] || item.tooltipKey : key;
      content = <Icon name={item.iconName} onClick={handleClick} aria-label={ariaLabel} />;
    }

    actionElements[key] = content;
  });

  if (renderAction) {
    return (
      <ul className="flex-image-viewer-actions">{renderAction(actionElements, contextValues)}</ul>
    );
  }

  const itemMap = new Map(items.map((item) => [item.key, item]));

  return (
    <ul className="flex-image-viewer-actions">
      {Object.keys(actionElements).map((key) => {
        const item = itemMap.get(key);
        return (
          <ActionItem
            key={key}
            tooltip={item?.tooltipKey ? TOOLTIP_CONFIG[item.tooltipKey] : undefined}
            tooltipPlacement={item?.tooltipPlacement}
          >
            {actionElements[key]}
          </ActionItem>
        );
      })}
    </ul>
  );
}
