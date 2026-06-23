import { expect, test, describe } from "@rstest/core";
import { renderHook, act } from "@testing-library/react";
import React, { useReducer } from "react";

import { viewerReducer } from "../src/context/ViewerContext";
import { useImageOperations } from "../src/hooks/useImageOperations";

import type { ViewerState, ViewerAction, FileData } from "../src/types";

function createInitialState(overrides?: Partial<ViewerState>): ViewerState {
  return {
    currentIndex: 1,
    filesLength: 3,
    imageOptions: [
      { angle: 0, scale: 1, isAdapt: true },
      { angle: 0, scale: 1, isAdapt: true },
      { angle: 0, scale: 1, isAdapt: true },
    ],
    infoVisible: false,
    thumbnailVisible: false,
    loop: false,
    files: [
      { src: "1.jpg", name: "1.jpg" },
      { src: "2.jpg", name: "2.jpg" },
      { src: "3.jpg", name: "3.jpg" },
    ],
    ...overrides,
  };
}

describe("viewerReducer", () => {
  test("SET_CURRENT_INDEX updates currentIndex", () => {
    const state = createInitialState();
    const next = viewerReducer(state, {
      type: "SET_CURRENT_INDEX",
      payload: 2,
    });
    expect(next.currentIndex).toBe(2);
  });

  test("PREV_IMAGE decrements index with loop support", () => {
    const state = createInitialState({ currentIndex: 2 });
    const next = viewerReducer(state, { type: "PREV_IMAGE" });
    expect(next.currentIndex).toBe(1);

    const next2 = viewerReducer(next, { type: "PREV_IMAGE" });
    expect(next2.currentIndex).toBe(1); // no loop

    const loopState = createInitialState({ currentIndex: 1, loop: true });
    const loopNext = viewerReducer(loopState, { type: "PREV_IMAGE" });
    expect(loopNext.currentIndex).toBe(3);
  });

  test("NEXT_IMAGE increments index with loop support", () => {
    const state = createInitialState({ currentIndex: 2 });
    const next = viewerReducer(state, { type: "NEXT_IMAGE" });
    expect(next.currentIndex).toBe(3);

    const next2 = viewerReducer(next, { type: "NEXT_IMAGE" });
    expect(next2.currentIndex).toBe(3); // no loop

    const loopState = createInitialState({ currentIndex: 3, loop: true });
    const loopNext = viewerReducer(loopState, { type: "NEXT_IMAGE" });
    expect(loopNext.currentIndex).toBe(1);
  });

  test("SET_LOOP updates loop flag", () => {
    const state = createInitialState();
    const next = viewerReducer(state, { type: "SET_LOOP", payload: true });
    expect(next.loop).toBe(true);
  });

  test("ROTATE_RIGHT increases angle by 90 and wraps at 360", () => {
    const state = createInitialState();
    const next = viewerReducer(state, {
      type: "ROTATE_RIGHT",
      payload: { index: 0 },
    });
    expect(next.imageOptions[0].angle).toBe(90);

    const next2 = viewerReducer(next, {
      type: "ROTATE_RIGHT",
      payload: { index: 0 },
    });
    expect(next2.imageOptions[0].angle).toBe(180);

    const next3 = viewerReducer(next2, {
      type: "ROTATE_RIGHT",
      payload: { index: 0 },
    });
    expect(next3.imageOptions[0].angle).toBe(270);

    const next4 = viewerReducer(next3, {
      type: "ROTATE_RIGHT",
      payload: { index: 0 },
    });
    expect(next4.imageOptions[0].angle).toBe(0);
  });

  test("ROTATE_LEFT decreases angle by 90 and wraps at 0", () => {
    const state = createInitialState();
    const next = viewerReducer(state, {
      type: "ROTATE_LEFT",
      payload: { index: 0 },
    });
    expect(next.imageOptions[0].angle).toBe(270);

    const next2 = viewerReducer(next, {
      type: "ROTATE_LEFT",
      payload: { index: 0 },
    });
    expect(next2.imageOptions[0].angle).toBe(180);

    const next3 = viewerReducer(next2, {
      type: "ROTATE_LEFT",
      payload: { index: 0 },
    });
    expect(next3.imageOptions[0].angle).toBe(90);

    const next4 = viewerReducer(next3, {
      type: "ROTATE_LEFT",
      payload: { index: 0 },
    });
    expect(next4.imageOptions[0].angle).toBe(0);
  });

  test("SET_ZOOM sets scale and disables adapt", () => {
    const state = createInitialState();
    const next = viewerReducer(state, {
      type: "SET_ZOOM",
      payload: { index: 0, scale: 1.5 },
    });
    expect(next.imageOptions[0].scale).toBe(1.5);
    expect(next.imageOptions[0].isAdapt).toBe(false);
  });

  test("ZOOM_IN increases scale by step with max boundary", () => {
    const state = createInitialState({
      imageOptions: [{ angle: 0, scale: 7.9, isAdapt: false }],
    });
    const next = viewerReducer(state, {
      type: "ZOOM_IN",
      payload: { index: 0, step: 0.1 },
    });
    expect(next.imageOptions[0].scale).toBe(8);

    const next2 = viewerReducer(next, {
      type: "ZOOM_IN",
      payload: { index: 0, step: 0.1 },
    });
    expect(next2.imageOptions[0].scale).toBe(8);
  });

  test("ZOOM_OUT decreases scale by step with min boundary", () => {
    const state = createInitialState({
      imageOptions: [{ angle: 0, scale: 0.15, isAdapt: false }],
    });
    const next = viewerReducer(state, {
      type: "ZOOM_OUT",
      payload: { index: 0, step: 0.1 },
    });
    expect(next.imageOptions[0].scale).toBe(0.1);

    const next2 = viewerReducer(next, {
      type: "ZOOM_OUT",
      payload: { index: 0, step: 0.1 },
    });
    expect(next2.imageOptions[0].scale).toBe(0.1);
  });

  test("ADAPT_ZOOM sets scale and enables adapt", () => {
    const state = createInitialState({
      imageOptions: [{ angle: 0, scale: 2, isAdapt: false }],
    });
    const next = viewerReducer(state, {
      type: "ADAPT_ZOOM",
      payload: { index: 0, scale: 0.8 },
    });
    expect(next.imageOptions[0].scale).toBe(0.8);
    expect(next.imageOptions[0].isAdapt).toBe(true);
  });

  test("CLEAR_IMAGE resets angle and scale and enables adapt", () => {
    const state = createInitialState({
      imageOptions: [{ angle: 180, scale: 2.5, isAdapt: false }],
    });
    const next = viewerReducer(state, {
      type: "CLEAR_IMAGE",
      payload: { index: 0, angle: 0, scale: 1 },
    });
    expect(next.imageOptions[0].angle).toBe(0);
    expect(next.imageOptions[0].scale).toBe(1);
    expect(next.imageOptions[0].isAdapt).toBe(true);
  });

  test("TOGGLE_INFO toggles visibility", () => {
    const state = createInitialState();
    const next = viewerReducer(state, { type: "TOGGLE_INFO" });
    expect(next.infoVisible).toBe(true);
    const next2 = viewerReducer(next, { type: "TOGGLE_INFO" });
    expect(next2.infoVisible).toBe(false);
  });

  test("TOGGLE_THUMBNAIL toggles visibility", () => {
    const state = createInitialState();
    const next = viewerReducer(state, { type: "TOGGLE_THUMBNAIL" });
    expect(next.thumbnailVisible).toBe(true);
    const next2 = viewerReducer(next, { type: "TOGGLE_THUMBNAIL" });
    expect(next2.thumbnailVisible).toBe(false);
  });

  test("INITIALIZE_FILES creates imageOptions from files", () => {
    const state = createInitialState();
    const next = viewerReducer(state, {
      type: "INITIALIZE_FILES",
      payload: {
        files: [
          { src: "a.jpg", angle: 90, scale: 1.5 },
          { src: "b.jpg", angle: 180, scale: 2 },
        ],
      },
    });
    expect(next.filesLength).toBe(2);
    expect(next.imageOptions).toHaveLength(2);
    expect(next.imageOptions[0]).toEqual({
      angle: 90,
      scale: 1.5,
      isAdapt: true,
    });
    expect(next.imageOptions[1]).toEqual({
      angle: 180,
      scale: 2,
      isAdapt: true,
    });
    expect(next.files[0].src).toBe("a.jpg");
  });
});

describe("useImageOperations hook", () => {
  function useTestHook(initialCurrent = 1) {
    const [state, dispatch] = useReducer(
      viewerReducer,
      createInitialState({ currentIndex: initialCurrent }),
    );
    const ops = useImageOperations(state, dispatch);
    return { state, dispatch, ops };
  }

  test("rotateLeft dispatches ROTATE_LEFT for current index", () => {
    const { result } = renderHook(() => useTestHook());
    act(() => {
      result.current.ops.rotateLeft();
    });
    expect(result.current.state.imageOptions[0].angle).toBe(270);
  });

  test("rotateRight dispatches ROTATE_RIGHT for current index", () => {
    const { result } = renderHook(() => useTestHook(2));
    act(() => {
      result.current.ops.rotateRight();
    });
    expect(result.current.state.imageOptions[1].angle).toBe(90);
  });

  test("setZoom dispatches SET_ZOOM for current index", () => {
    const { result } = renderHook(() => useTestHook());
    act(() => {
      result.current.ops.setZoom(1.5);
    });
    expect(result.current.state.imageOptions[0].scale).toBe(1.5);
    expect(result.current.state.imageOptions[0].isAdapt).toBe(false);
  });

  test("zoomIn increases scale", () => {
    const { result } = renderHook(() => useTestHook());
    act(() => {
      result.current.ops.zoomIn(0.1);
    });
    expect(result.current.state.imageOptions[0].scale).toBe(1.1);
  });

  test("zoomOut decreases scale", () => {
    const { result } = renderHook(() => useTestHook());
    act(() => {
      result.current.ops.zoomOut(0.1);
    });
    expect(result.current.state.imageOptions[0].scale).toBe(0.9);
  });

  test("adaptZoom sets scale and isAdapt", () => {
    const { result } = renderHook(() => useTestHook());
    act(() => {
      result.current.ops.adaptZoom(0.8);
    });
    expect(result.current.state.imageOptions[0].scale).toBe(0.8);
    expect(result.current.state.imageOptions[0].isAdapt).toBe(true);
  });

  test("clear resets to file initial values", () => {
    function useTestHookWithFiles() {
      const [state, dispatch] = useReducer(
        viewerReducer,
        createInitialState({
          files: [{ src: "test.jpg", angle: 45, scale: 2 }],
        }),
      );
      const ops = useImageOperations(state, dispatch);
      return { state, ops };
    }
    const { result } = renderHook(() => useTestHookWithFiles());
    act(() => {
      result.current.ops.clear();
    });
    expect(result.current.state.imageOptions[0].angle).toBe(45);
    expect(result.current.state.imageOptions[0].scale).toBe(2);
    expect(result.current.state.imageOptions[0].isAdapt).toBe(true);
  });
});
