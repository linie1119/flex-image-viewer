import React, { useState, useRef, useEffect } from "react";

import { Icon } from "@/components";
import { min } from "es-toolkit/compat";

const MAX_SCALE = 800;
const DEFAULT_PERCENT_OPTIONS = Array.from(
  { length: 8 },
  (_, i) => MAX_SCALE - i * 100,
).concat([75, 50, 25, 10]);
const unit = MAX_SCALE / 100;

export const getScaleValue = (sliderValue: number) => {
  return Math.round(sliderValue * unit);
};

export const getSliderValue = (scale: number) => {
  return Math.round(scale / unit);
};

export interface PercentOption {
  value: number;
  label: string;
}

export interface PercentSelectProps {
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  options?: number[];
}

function PercentSelect({
  value = 100,
  onChange,
  disabled = false,
  className = "",
  style,
  options = DEFAULT_PERCENT_OPTIONS,
}: PercentSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(value.toString());
  const [isEditing, setIsEditing] = useState(false);

  const selectRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const optionList: PercentOption[] = options.map((opt) => ({
    value: opt,
    label: `${opt}%`,
  }));

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toString());
    }
  }, [value, isEditing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        if (isEditing) {
          handleInputBlur();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditing, inputValue, value]);

  const handleOptionClick = (optionValue: number) => {
    if (disabled) return;
    onChange?.(optionValue);
    setInputValue(optionValue.toString());
    setIsOpen(false);
    setIsEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === "" || /^\d*\.?\d*$/.test(val)) {
      const num = min([parseFloat(val), MAX_SCALE]);
      setInputValue(num === undefined ? value.toString() : num.toString());
    }
  };

  const handleInputBlur = () => {
    const num = min([parseFloat(inputValue), MAX_SCALE]);

    if (num === undefined || isNaN(num) || num <= 0 || inputValue === "") {
      setInputValue(value.toString());
    } else {
      if (num !== value) {
        onChange?.(num);
      }
      setInputValue(value.toString());
    }

    setIsEditing(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
      inputRef.current?.blur();
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleInputClick = (e: React.MouseEvent) => {
    if (disabled) return;
    e.stopPropagation();
    if (!isEditing) {
      setIsEditing(true);
      setTimeout(() => {
        inputRef.current?.select();
      }, 0);
    }
  };

  return (
    <div
      ref={selectRef}
      className={`flex-image-viewer-percent-select ${isOpen ? "flex-image-viewer-percent-select-open" : ""} ${disabled ? "flex-image-viewer-percent-select-disabled" : ""} ${className}`}
      style={style}
    >
      <div className="flex-image-viewer-percent-select-control">
        <input
          ref={inputRef}
          type="text"
          readOnly={!isEditing}
          className={`flex-image-viewer-percent-select-input ${isEditing ? "flex-image-viewer-percent-select-input-editing" : ""}`}
          value={isEditing ? inputValue : value.toString()}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          onClick={handleInputClick}
          disabled={disabled}
          placeholder="缩放比例"
        />
        <span className="flex-image-viewer-percent-select-suffix">%</span>
        <div
          className={`flex-image-viewer-percent-select-arrow ${isOpen ? "flex-image-viewer-percent-select-arrow-open" : ""}`}
          onClick={handleToggle}
        >
          <Icon
            className="flex-image-viewer-percent-select-arrow-icon"
            name="Down"
          />
        </div>
      </div>

      {isOpen && (
        <div className="flex-image-viewer-percent-select-dropdown flex-image-viewer-percent-select-dropdown-up">
          <div className="flex-image-viewer-percent-select-options">
            {optionList.map((option) => {
              const isSelected = option.value === value;
              return (
                <div
                  key={option.value}
                  className={`flex-image-viewer-percent-select-option ${isSelected ? "flex-image-viewer-percent-select-option-selected" : ""}`}
                  onClick={() => handleOptionClick(option.value)}
                >
                  {option.label}
                  {isSelected && (
                    <span className="flex-image-viewer-percent-select-check">
                      <Icon
                        className="flex-image-viewer-percent-select-check-icon"
                        name="Check"
                      />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default PercentSelect;
