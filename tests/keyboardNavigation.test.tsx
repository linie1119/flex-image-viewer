import { expect, test, describe, afterEach } from "@rstest/core";
import { render, fireEvent, cleanup } from "@testing-library/react";
import React from "react";

import FlexImageViewer from "../src/FlexImageViewer";
import type { FileData } from "../src/types";

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("Keyboard navigation", () => {
  const files: FileData[] = [
    { url: "1.jpg", name: "1.jpg" },
    { url: "2.jpg", name: "2.jpg" },
    { url: "3.jpg", name: "3.jpg" },
  ];

  test("ArrowRight should go to next image", () => {
    render(<FlexImageViewer visible={true} files={files} current={1} />);

    fireEvent.keyDown(document, { key: "ArrowRight" });

    const count = document.querySelector(".flex-image-viewer-header-count");
    expect(count?.textContent).toBe("2/3");
  });

  test("ArrowLeft should go to previous image", () => {
    render(<FlexImageViewer visible={true} files={files} current={2} />);

    fireEvent.keyDown(document, { key: "ArrowLeft" });

    const count = document.querySelector(".flex-image-viewer-header-count");
    expect(count?.textContent).toBe("1/3");
  });

  test("Escape should call onClose", () => {
    let closed = false;
    render(
      <FlexImageViewer
        visible={true}
        files={files}
        current={1}
        onClose={() => {
          closed = true;
        }}
      />,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(closed).toBe(true);
  });

  test("+ key should zoom in", () => {
    render(<FlexImageViewer visible={true} files={files} current={1} />);

    fireEvent.keyDown(document, { key: "+" });

    const zoomSelect = document.querySelector(
      ".flex-image-viewer-percent-select-input",
    );
    expect(zoomSelect?.getAttribute("value") || "").toContain("110");
  });

  test("- key should zoom out", () => {
    render(<FlexImageViewer visible={true} files={files} current={1} />);

    fireEvent.keyDown(document, { key: "-" });

    const zoomSelect = document.querySelector(
      ".flex-image-viewer-percent-select-input",
    );
    expect(zoomSelect?.getAttribute("value") || "").toContain("90");
  });

  test("R key should reset image", () => {
    render(<FlexImageViewer visible={true} files={files} current={1} />);

    // First zoom in
    fireEvent.keyDown(document, { key: "+" });
    // Then reset
    fireEvent.keyDown(document, { key: "r" });

    const zoomSelect = document.querySelector(
      ".flex-image-viewer-percent-select-input",
    );
    expect(zoomSelect?.getAttribute("value") || "").toContain("100");
  });
});
