import { expect, test, describe } from "@rstest/core";
import { render, fireEvent } from "@testing-library/react";
import React from "react";
import ThumbnailIamge from "../src/components/ThumbnailIamge";

describe("ThumbnailIamge", () => {
  test("should render without crashing", () => {
    const { container } = render(
      <ThumbnailIamge file={{ src: "thumb.jpg", name: "thumb.jpg" }} />,
    );
    expect(container.querySelector("img")).not.toBeNull();
  });

  test("should handle missing file gracefully", () => {
    const { container } = render(<ThumbnailIamge />);
    expect(container.querySelector("img")).not.toBeNull();
  });

  test("should show image after error event", () => {
    const { container } = render(
      <ThumbnailIamge file={{ src: "broken.jpg", name: "broken.jpg" }} />,
    );

    const img = container.querySelector("img") as HTMLImageElement;
    expect(img).not.toBeNull();

    fireEvent.error(img);

    expect(img.style.opacity).toBe("1");
  });
});
