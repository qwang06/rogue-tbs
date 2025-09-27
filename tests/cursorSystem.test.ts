import { describe, it, expect } from 'vitest';
import { 
  Direction, 
  moveCursor, 
  clampCursorToBounds, 
  moveCursorWithBounds,
  type MapBounds,
  type DirectionType
} from '../src/systems/cursorSystem';
import { createCursor } from '../src/components/Cursor';

describe('Cursor System', () => {
  const testBounds: MapBounds = {
    minX: 0,
    minY: 0,
    maxX: 39,
    maxY: 29
  };

  describe('moveCursor', () => {
    it('should move cursor up', () => {
      const cursor = createCursor(5, 5);
      const result = moveCursor(cursor, Direction.UP);
      expect(result.tileX).toBe(5);
      expect(result.tileY).toBe(4);
    });

    it('should move cursor down', () => {
      const cursor = createCursor(5, 5);
      const result = moveCursor(cursor, Direction.DOWN);
      expect(result.tileX).toBe(5);
      expect(result.tileY).toBe(6);
    });

    it('should move cursor left', () => {
      const cursor = createCursor(5, 5);
      const result = moveCursor(cursor, Direction.LEFT);
      expect(result.tileX).toBe(4);
      expect(result.tileY).toBe(5);
    });

    it('should move cursor right', () => {
      const cursor = createCursor(5, 5);
      const result = moveCursor(cursor, Direction.RIGHT);
      expect(result.tileX).toBe(6);
      expect(result.tileY).toBe(5);
    });
  });

  describe('clampCursorToBounds', () => {
    it('should clamp cursor to minimum bounds', () => {
      const cursor = createCursor(-1, -1);
      const result = clampCursorToBounds(cursor, testBounds);
      expect(result.tileX).toBe(0);
      expect(result.tileY).toBe(0);
    });

    it('should clamp cursor to maximum bounds', () => {
      const cursor = createCursor(50, 50);
      const result = clampCursorToBounds(cursor, testBounds);
      expect(result.tileX).toBe(39);
      expect(result.tileY).toBe(29);
    });

    it('should not clamp cursor within bounds', () => {
      const cursor = createCursor(20, 15);
      const result = clampCursorToBounds(cursor, testBounds);
      expect(result.tileX).toBe(20);
      expect(result.tileY).toBe(15);
    });
  });

  describe('moveCursorWithBounds', () => {
    it('should move cursor normally when within bounds', () => {
      const cursor = createCursor(5, 5);
      const result = moveCursorWithBounds(cursor, Direction.UP, testBounds);
      expect(result.tileX).toBe(5);
      expect(result.tileY).toBe(4);
    });

    it('should prevent moving beyond upper bound', () => {
      const cursor = createCursor(5, 0);
      const result = moveCursorWithBounds(cursor, Direction.UP, testBounds);
      expect(result.tileX).toBe(5);
      expect(result.tileY).toBe(0);
    });

    it('should prevent moving beyond lower bound', () => {
      const cursor = createCursor(5, 29);
      const result = moveCursorWithBounds(cursor, Direction.DOWN, testBounds);
      expect(result.tileX).toBe(5);
      expect(result.tileY).toBe(29);
    });

    it('should prevent moving beyond left bound', () => {
      const cursor = createCursor(0, 5);
      const result = moveCursorWithBounds(cursor, Direction.LEFT, testBounds);
      expect(result.tileX).toBe(0);
      expect(result.tileY).toBe(5);
    });

    it('should prevent moving beyond right bound', () => {
      const cursor = createCursor(39, 5);
      const result = moveCursorWithBounds(cursor, Direction.RIGHT, testBounds);
      expect(result.tileX).toBe(39);
      expect(result.tileY).toBe(5);
    });
  });
});