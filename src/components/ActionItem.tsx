import React from "react";

export interface ActionItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export default function ActionItem({ children, onClick }: ActionItemProps) {
  return <li
    className="flex-image-viewer-action-item"
    onClick={onClick}
  >
    {children}
  </li>;
}
