import { describe, it, expect } from '@rstest/core';
import { viewerReducer, createInitialState } from './ViewerContext';
import type { ViewerState, FileData } from '@/types';

type TestState = ViewerState<FileData>;

function makeState(partial: Partial<TestState> = {}): TestState {
  return {
    currentIndex: 0,
    filesLength: 3,
    imageOptions: [
      { angle: 0, scale: 1, isAdapt: true },
      { angle: 0, scale: 1, isAdapt: true },
      { angle: 0, scale: 1, isAdapt: true },
    ],
    thumbnailVisible: false,
    infoVisible: false,
    loop: false,
    files: [{ name: 'a' }, { name: 'b' }, { name: 'c' }],
    refreshKeys: [0, 0, 0],
    resolvedMetas: [{}, {}, {}],
    ...partial,
  };
}

describe('viewerReducer', () => {
  it('SET_CURRENT_INDEX', () => {
    const state = makeState();
    const next = viewerReducer(state, { type: 'SET_CURRENT_INDEX', payload: 2 });
    expect(next.currentIndex).toBe(2);
  });

  it('PREV_IMAGE moves to previous index', () => {
    const state = makeState({ currentIndex: 1 });
    const next = viewerReducer(state, { type: 'PREV_IMAGE' });
    expect(next.currentIndex).toBe(0);
  });

  it('PREV_IMAGE does not go below 0 when loop is false', () => {
    const state = makeState({ currentIndex: 0 });
    const next = viewerReducer(state, { type: 'PREV_IMAGE' });
    expect(next.currentIndex).toBe(0);
  });

  it('PREV_IMAGE loops to last when loop is true', () => {
    const state = makeState({ currentIndex: 0, loop: true });
    const next = viewerReducer(state, { type: 'PREV_IMAGE' });
    expect(next.currentIndex).toBe(2);
  });

  it('NEXT_IMAGE moves to next index', () => {
    const state = makeState({ currentIndex: 1 });
    const next = viewerReducer(state, { type: 'NEXT_IMAGE' });
    expect(next.currentIndex).toBe(2);
  });

  it('NEXT_IMAGE does not exceed last index when loop is false', () => {
    const state = makeState({ currentIndex: 2 });
    const next = viewerReducer(state, { type: 'NEXT_IMAGE' });
    expect(next.currentIndex).toBe(2);
  });

  it('NEXT_IMAGE loops to first when loop is true', () => {
    const state = makeState({ currentIndex: 2, loop: true });
    const next = viewerReducer(state, { type: 'NEXT_IMAGE' });
    expect(next.currentIndex).toBe(0);
  });

  it('PREV_IMAGE / NEXT_IMAGE keeps index when total <= 1', () => {
    const state = makeState({ filesLength: 1, currentIndex: 0 });
    expect(viewerReducer(state, { type: 'PREV_IMAGE' }).currentIndex).toBe(0);
    expect(viewerReducer(state, { type: 'NEXT_IMAGE' }).currentIndex).toBe(0);
  });

  it('ROTATE_LEFT', () => {
    const state = makeState();
    const next = viewerReducer(state, { type: 'ROTATE_LEFT', payload: { index: 0 } });
    expect(next.imageOptions[0].angle).toBe(270);
  });

  it('ROTATE_RIGHT', () => {
    const state = makeState();
    const next = viewerReducer(state, { type: 'ROTATE_RIGHT', payload: { index: 0 } });
    expect(next.imageOptions[0].angle).toBe(90);
  });

  it('SET_ROTATION normalizes angle', () => {
    const state = makeState();
    const next = viewerReducer(state, { type: 'SET_ROTATION', payload: { index: 0, angle: 450 } });
    expect(next.imageOptions[0].angle).toBe(90);
  });

  it('SET_ZOOM rounds scale and clears isAdapt', () => {
    const state = makeState();
    const next = viewerReducer(state, {
      type: 'SET_ZOOM',
      payload: { index: 0, scale: 1.23456 },
    });
    expect(next.imageOptions[0].scale).toBe(1.23);
    expect(next.imageOptions[0].isAdapt).toBe(false);
  });

  it('ZOOM_IN respects MAX_SCALE', () => {
    const state = makeState({ imageOptions: [{ angle: 0, scale: 7.9, isAdapt: false }] });
    const next = viewerReducer(state, { type: 'ZOOM_IN', payload: { index: 0, step: 0.2 } });
    expect(next.imageOptions[0].scale).toBe(8);
  });

  it('ZOOM_OUT respects MIN_SCALE', () => {
    const state = makeState({ imageOptions: [{ angle: 0, scale: 0.15, isAdapt: false }] });
    const next = viewerReducer(state, { type: 'ZOOM_OUT', payload: { index: 0, step: 0.1 } });
    expect(next.imageOptions[0].scale).toBe(0.1);
  });

  it('ADAPT_ZOOM sets isAdapt to true', () => {
    const state = makeState({ imageOptions: [{ angle: 0, scale: 2, isAdapt: false }] });
    const next = viewerReducer(state, { type: 'ADAPT_ZOOM', payload: { index: 0, scale: 1.5 } });
    expect(next.imageOptions[0].scale).toBe(1.5);
    expect(next.imageOptions[0].isAdapt).toBe(true);
  });

  it('CLEAR_IMAGE resets to file angle and scale', () => {
    const state = makeState({
      files: [{ name: 'a', angle: 90, scale: 2 }],
      imageOptions: [{ angle: 180, scale: 3, isAdapt: false }],
    });
    const next = viewerReducer(state, {
      type: 'CLEAR_IMAGE',
      payload: { index: 0, angle: 90, scale: 2 },
    });
    expect(next.imageOptions[0].angle).toBe(90);
    expect(next.imageOptions[0].scale).toBe(2);
    expect(next.imageOptions[0].isAdapt).toBe(true);
  });

  it('TOGGLE_INFO toggles visibility', () => {
    const state = makeState({ infoVisible: false });
    const next = viewerReducer(state, { type: 'TOGGLE_INFO' });
    expect(next.infoVisible).toBe(true);
  });

  it('TOGGLE_THUMBNAIL toggles visibility', () => {
    const state = makeState({ thumbnailVisible: false });
    const next = viewerReducer(state, { type: 'TOGGLE_THUMBNAIL' });
    expect(next.thumbnailVisible).toBe(true);
  });

  it('SET_LOOP', () => {
    const state = makeState({ loop: false });
    const next = viewerReducer(state, { type: 'SET_LOOP', payload: true });
    expect(next.loop).toBe(true);
  });

  it('INITIALIZE_FILES resets files and preserves prior options when available', () => {
    const state = makeState({
      imageOptions: [
        { angle: 45, scale: 2, isAdapt: false },
        { angle: 0, scale: 1, isAdapt: true },
      ],
    });
    const next = viewerReducer(state, {
      type: 'INITIALIZE_FILES',
      payload: { files: [{ name: 'x' }, { name: 'y' }, { name: 'z' }] },
    });
    expect(next.filesLength).toBe(3);
    expect(next.imageOptions[0].angle).toBe(45);
    expect(next.imageOptions[0].scale).toBe(2);
  });

  it('INITIALIZE_FILES uses file angle/scale when provided', () => {
    const state = makeState();
    const next = viewerReducer(state, {
      type: 'INITIALIZE_FILES',
      payload: {
        files: [{ name: 'x', angle: 90, scale: 1.5 }],
      },
    });
    expect(next.imageOptions[0].angle).toBe(90);
    expect(next.imageOptions[0].scale).toBe(1.5);
    expect(next.imageOptions[0].isAdapt).toBe(true);
  });

  it('UPDATE_FILE merges file data', () => {
    const state = makeState();
    const next = viewerReducer(state, {
      type: 'UPDATE_FILE',
      payload: { index: 0, file: { name: 'renamed' } },
    });
    expect(next.files[0].name).toBe('renamed');
    expect(next.files[1].name).toBe('b');
  });

  it('REFRESH_FILE increments refreshKey', () => {
    const state = makeState({ refreshKeys: [1, 2, 3] });
    const next = viewerReducer(state, { type: 'REFRESH_FILE', payload: { index: 1 } });
    expect(next.refreshKeys[1]).toBe(3);
    expect(next.refreshKeys[0]).toBe(1);
  });

  it('SET_RESOLVED_META merges meta', () => {
    const state = makeState();
    const next = viewerReducer(state, {
      type: 'SET_RESOLVED_META',
      payload: { index: 0, meta: { width: 100 } },
    });
    expect(next.resolvedMetas[0]).toEqual({ width: 100 });
  });

  it('unknown action returns previous state', () => {
    const state = makeState();
    // @ts-expect-error testing unknown action
    const next = viewerReducer(state, { type: 'UNKNOWN_ACTION' });
    expect(next).toBe(state);
  });
});

describe('createInitialState', () => {
  it('creates default state', () => {
    const state = createInitialState(0, 0, false, false);
    expect(state.currentIndex).toBe(0);
    expect(state.filesLength).toBe(0);
    expect(state.imageOptions).toEqual([]);
    expect(state.files).toEqual([]);
    expect(state.loop).toBe(false);
  });
});
