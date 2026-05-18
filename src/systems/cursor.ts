import type { Cursor } from "../components/Cursor";

/**
 * Direction constants for cursor movement
 */
export const Direction = {
  UP: "UP",
  DOWN: "DOWN",
  LEFT: "LEFT",
  RIGHT: "RIGHT",
} as const;

export type DirectionType = (typeof Direction)[keyof typeof Direction];

/**
 * Map boundaries configuration
 */
export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Moves the cursor in the specified direction
 * @param cursor Current cursor position
 * @param direction Direction to move
 * @returns New cursor position
 */
export function moveCursor(cursor: Cursor, direction: DirectionType): Cursor {
  let newX = cursor.tileX;
  let newY = cursor.tileY;

  switch (direction) {
    case Direction.UP:
      newY = cursor.tileY - 1;
      break;
    case Direction.DOWN:
      newY = cursor.tileY + 1;
      break;
    case Direction.LEFT:
      newX = cursor.tileX - 1;
      break;
    case Direction.RIGHT:
      newX = cursor.tileX + 1;
      break;
  }

  return { tileX: newX, tileY: newY };
}

/**
 * Clamps cursor position to stay within map boundaries
 * @param cursor Cursor position to clamp
 * @param bounds Map boundaries
 * @returns Clamped cursor position
 */
export function clampCursorToBounds(cursor: Cursor, bounds: MapBounds): Cursor {
  return {
    tileX: Math.max(bounds.minX, Math.min(bounds.maxX, cursor.tileX)),
    tileY: Math.max(bounds.minY, Math.min(bounds.maxY, cursor.tileY)),
  };
}

/**
 * Moves cursor in a direction and clamps to map bounds
 * @param cursor Current cursor position
 * @param direction Direction to move
 * @param bounds Map boundaries
 * @returns New cursor position clamped to bounds
 */
export function moveCursorWithBounds(
  cursor: Cursor,
  direction: DirectionType,
  bounds: MapBounds
): Cursor {
  const newCursor = moveCursor(cursor, direction);
  return clampCursorToBounds(newCursor, bounds);
}
