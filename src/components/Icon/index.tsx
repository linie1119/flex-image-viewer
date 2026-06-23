import React from "react";

import { ReactComponent as ArrowLeft } from "./svg/arrow-left.svg";
import { ReactComponent as ArrowRight } from "./svg/arrow-right.svg";
import { ReactComponent as CaretRight } from "./svg/caret-right.svg";
import { ReactComponent as Check } from "./svg/check.svg";
import { ReactComponent as Clear } from "./svg/clear.svg";
import { ReactComponent as Close } from "./svg/close.svg";
import { ReactComponent as DefaultImage } from "./svg/default-image.svg";
import { ReactComponent as Down } from "./svg/down.svg";
import { ReactComponent as Info } from "./svg/info-circle.svg";
import { ReactComponent as RotateLeft } from "./svg/rotate-left.svg";
import { ReactComponent as RotateRight } from "./svg/rotate-right.svg";
import { ReactComponent as Save } from "./svg/save.svg";
import { ReactComponent as Size } from "./svg/size.svg";
import { ReactComponent as Thumbnail } from "./svg/thumbnail.svg";
import { ReactComponent as ZoomAdapt } from "./svg/zoom-adapt.svg";
import { ReactComponent as ZoomIn } from "./svg/zoom-in.svg";
import { ReactComponent as ZoomOut } from "./svg/zoom-out.svg";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
}

const icons = {
  ArrowLeft,
  ArrowRight,
  CaretRight,
  Check,
  Clear,
  Close,
  DefaultImage,
  Down,
  Info,
  RotateLeft,
  RotateRight,
  Save,
  Size,
  Thumbnail,
  ZoomAdapt,
  ZoomIn,
  ZoomOut,
};

const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const IconComponent = icons[name as keyof typeof icons];
  if (!IconComponent) return null;
  return <IconComponent className="flex-image-viewer-icon" {...props} />;
};

export default Icon;
