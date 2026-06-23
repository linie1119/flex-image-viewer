import { expect, test, describe, afterEach } from "@rstest/core";
import { render, cleanup } from "@testing-library/react";
import React from "react";
import FlexImageViewer from "../src/FlexImageViewer";

describe("Thumbnail lazy render", () => {
  afterEach(() => {
    cleanup();
  });

  test("should render current thumbnail always", () => {
    const files = [
      { src: "a.jpg", name: "a.jpg" },
      { src: "b.jpg", name: "b.jpg" },
      { src: "c.jpg", name: "c.jpg" },
    ];

    render(
      <FlexImageViewer
        files={files}
        current={1}
        visible={true}
        onClose={() => {}}
      />,
    );

    const items = document.body.querySelectorAll(
      ".flex-image-viewer-thumbnail-container",
    );
    console.log("thumbnail containers:", items.length);

    const images = document.body.querySelectorAll(
      ".flex-image-viewer-thumbnail-image",
    );
    console.log("thumbnail images:", images.length);
    expect(images.length).toBe(1);
  });

  test("should keep rendered thumbnail after current changes", () => {
    const files = [
      { src: "a.jpg", name: "a.jpg" },
      { src: "b.jpg", name: "b.jpg" },
      { src: "c.jpg", name: "c.jpg" },
    ];

    const { rerender } = render(
      <FlexImageViewer
        files={files}
        current={1}
        visible={true}
        onClose={() => {}}
      />,
    );

    let images = document.body.querySelectorAll(
      ".flex-image-viewer-thumbnail-image",
    );
    console.log("after first render, images:", images.length);
    expect(images.length).toBe(1);

    rerender(
      <FlexImageViewer
        files={files}
        current={2}
        visible={true}
        onClose={() => {}}
      />,
    );

    images = document.body.querySelectorAll(
      ".flex-image-viewer-thumbnail-image",
    );
    console.log("after rerender current=2, images:", images.length);
    // current=2: item 1 rendered as current, item 0 kept because it was already rendered
    expect(images.length).toBe(2);
  });
});
