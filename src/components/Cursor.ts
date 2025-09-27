/**
 * Cursor component - represents the current tile selection position
 * Data-only component, no Phaser dependencies
 */
export interface Cursor {
  /** Current tile X coordinate */
  tileX: number;
  /** Current tile Y coordinate */
  tileY: number;
}

/**
 * Creates a new cursor at the specified tile position
 */
export function createCursor(tileX: number = 0, tileY: number = 0): Cursor {
  return { tileX, tileY };
}