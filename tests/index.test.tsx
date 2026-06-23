import { expect, test, describe } from "@rstest/core";
import { render, fireEvent } from "@testing-library/react";
import Image from "../src/components/Image";

describe("Image wheel zoom", () => {
  test("wheel up should zoom in", async () => {
    const calls: number[] = [];
    const onWheelZoom = (scale: number) => {
      calls.push(scale);
    };
    const { container } = render(
      <Image
        file={{ src: "https://example.com/image.png", name: "test.png" }}
        scale={1}
        angle={0}
        isAdapt={false}
        wheelZoom={true}
        wheelZoomStep={0.1}
        onWheelZoom={onWheelZoom}
      />,
    );

    const imgContainer = container.querySelector(
      ".flex-image-viewer-container",
    );
    expect(imgContainer).not.toBeNull();

    fireEvent.wheel(imgContainer!, { deltaY: -100 });

    expect(calls).toEqual([1.1]);
  });

  test("wheel down should zoom out", async () => {
    const calls: number[] = [];
    const onWheelZoom = (scale: number) => {
      calls.push(scale);
    };
    const { container } = render(
      <Image
        file={{ src: "https://example.com/image.png", name: "test.png" }}
        scale={1}
        angle={0}
        isAdapt={false}
        wheelZoom={true}
        wheelZoomStep={0.1}
        onWheelZoom={onWheelZoom}
      />,
    );

    const imgContainer = container.querySelector(
      ".flex-image-viewer-container",
    );
    fireEvent.wheel(imgContainer!, { deltaY: 100 });

    expect(calls).toEqual([0.9]);
  });

  test("should respect min scale boundary", async () => {
    const calls: number[] = [];
    const onWheelZoom = (scale: number) => {
      calls.push(scale);
    };
    const { container } = render(
      <Image
        file={{ src: "https://example.com/image.png", name: "test.png" }}
        scale={0.15}
        angle={0}
        isAdapt={false}
        wheelZoom={true}
        wheelZoomStep={0.1}
        onWheelZoom={onWheelZoom}
      />,
    );

    const imgContainer = container.querySelector(
      ".flex-image-viewer-container",
    );
    fireEvent.wheel(imgContainer!, { deltaY: 100 });

    expect(calls).toEqual([0.1]);
  });

  test("should respect max scale boundary", async () => {
    const calls: number[] = [];
    const onWheelZoom = (scale: number) => {
      calls.push(scale);
    };
    const { container } = render(
      <Image
        file={{ src: "https://example.com/image.png", name: "test.png" }}
        scale={7.9}
        angle={0}
        isAdapt={false}
        wheelZoom={true}
        wheelZoomStep={0.1}
        onWheelZoom={onWheelZoom}
      />,
    );

    const imgContainer = container.querySelector(
      ".flex-image-viewer-container",
    );
    fireEvent.wheel(imgContainer!, { deltaY: -100 });

    expect(calls).toEqual([8]);
  });

  test("should not zoom when wheelZoom is false", async () => {
    const calls: number[] = [];
    const onWheelZoom = (scale: number) => {
      calls.push(scale);
    };
    const { container } = render(
      <Image
        file={{ src: "https://example.com/image.png", name: "test.png" }}
        scale={1}
        angle={0}
        isAdapt={false}
        wheelZoom={false}
        wheelZoomStep={0.1}
        onWheelZoom={onWheelZoom}
      />,
    );

    const imgContainer = container.querySelector(
      ".flex-image-viewer-container",
    );
    fireEvent.wheel(imgContainer!, { deltaY: -100 });

    expect(calls).toEqual([]);
  });

  test("should use custom wheelZoomStep", async () => {
    const calls: number[] = [];
    const onWheelZoom = (scale: number) => {
      calls.push(scale);
    };
    const { container } = render(
      <Image
        file={{ src: "https://example.com/image.png", name: "test.png" }}
        scale={1}
        angle={0}
        isAdapt={false}
        wheelZoom={true}
        wheelZoomStep={0.2}
        onWheelZoom={onWheelZoom}
      />,
    );

    const imgContainer = container.querySelector(
      ".flex-image-viewer-container",
    );
    fireEvent.wheel(imgContainer!, { deltaY: -100 });

    expect(calls).toEqual([1.2]);
  });
});
