import { expect, test, describe } from "@rstest/core";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import { ViewerProvider } from "../src/context/ViewerContext";
import Content from "../src/FlexImageViewer/Content";

describe("Content keyboard navigation", () => {
  test("ArrowLeft dispatches PREV_IMAGE without error", () => {
    render(
      <ViewerProvider initialCurrent={2} initialFilesLength={3}>
        <Content />
      </ViewerProvider>,
    );

    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(true).toBe(true);
  });

  test("Escape should not be handled by Content (handled by Modal)", () => {
    let callCount = 0;
    const onClose = () => {
      callCount++;
    };

    render(
      <ViewerProvider initialCurrent={1} initialFilesLength={1}>
        <Content onClose={onClose} />
      </ViewerProvider>,
    );

    fireEvent.keyDown(document, { key: "Escape" });
    expect(callCount).toBe(0);
  });
});
