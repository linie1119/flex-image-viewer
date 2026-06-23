import { expect, test, describe } from "@rstest/core";
import { renderHook, waitFor } from "@testing-library/react";
import { useImageSource } from "../src/hooks/useImageSource";

describe("useImageSource", () => {
  test("should use empty string src when file.src is empty string", async () => {
    const { result } = renderHook(() =>
      useImageSource({ src: "", name: "empty" }),
    );

    await waitFor(() => {
      expect(result.current.src).toBe("");
      expect(result.current.loading).toBe(false);
    });
  });

  test("should fall back to DEFAULT_IMAGE when file.src is undefined", async () => {
    const { result } = renderHook(() => useImageSource({ name: "no-src" }));

    await waitFor(() => {
      expect(result.current.src).not.toBe("");
      expect(result.current.loading).toBe(false);
    });
  });

  test("should not call getSrc when file is undefined", async () => {
    let callCount = 0;
    const getSrc = () => {
      callCount++;
      return Promise.resolve("resolved.png");
    };

    renderHook(() => useImageSource(undefined, getSrc));

    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(callCount).toBe(0);
  });
});
