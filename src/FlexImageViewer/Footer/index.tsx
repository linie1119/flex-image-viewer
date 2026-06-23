import { useViewerState } from "@/context/ViewerContext";
import { Icon } from "@/components";

import type { FileData } from "@/types";

import Actions from "./Actions";

import type { FooterActionsProps } from "./Actions";

export interface FooterProps<T extends FileData> {
  renderAction?: FooterActionsProps<T>["renderAction"];
  updateCurrentFile?: FooterActionsProps<T>["updateCurrentFile"];
}

function Footer<T extends FileData>({ renderAction, updateCurrentFile }: FooterProps<T>) {
  const state = useViewerState();
  const zoom = (state.imageOptions[state.currentIndex - 1]?.scale ?? 1) * 100;
  const files = state.files;
  const current = state.currentIndex;
  const fileData = files[current - 1];

  const sizeArr = [fileData?.width, fileData?.height].filter(Boolean);

  return (
    <footer className="flex-image-viewer-footer">
      <div className="flex-image-viewer-footer-title">
        {sizeArr.length === 2 && (<div className="flex-image-viewer-footer-size">
          <Icon name="Size" />
          {sizeArr.join(' x ')}
        </div>)}
        {!!fileData?.size && (<div className="flex-image-viewer-footer-memory">
          <Icon name="Save" />
          {fileData?.size}
        </div>)}
      </div>
      <Actions zoom={zoom} renderAction={renderAction} updateCurrentFile={updateCurrentFile} />
    </footer>
  );
}

export default Footer;
