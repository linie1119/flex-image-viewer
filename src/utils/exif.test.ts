import { describe, it, expect } from '@rstest/core';
import { shouldSwapDimensions } from './exif';

describe('shouldSwapDimensions', () => {
    it('returns true for orientation 6', () => {
        expect(shouldSwapDimensions(6)).toBe(true);
    });

    it('returns true for orientation 8', () => {
        expect(shouldSwapDimensions(8)).toBe(true);
    });

    it('returns false for orientation 1', () => {
        expect(shouldSwapDimensions(1)).toBe(false);
    });

    it('returns false for orientation 3', () => {
        expect(shouldSwapDimensions(3)).toBe(false);
    });

    it('returns false for undefined', () => {
        expect(shouldSwapDimensions(undefined)).toBe(false);
    });
});
