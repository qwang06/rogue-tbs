import Phaser from "phaser";
import { getTileCenter, TILE_SIZE } from "../util/tile";
import type { Cursor } from "../components/Cursor";

/**
 * Creates a cursor visual representation (a highlighted square outline)
 * @param scene The Phaser scene to add the cursor to
 * @param cursor The cursor position data
 * @returns The graphics object representing the cursor
 */
export function createCursorVisual(
  scene: Phaser.Scene,
  cursor: Cursor
): Phaser.GameObjects.Graphics {
  const graphics = scene.add.graphics();
  updateCursorVisual(graphics, cursor);
  return graphics;
}

/**
 * Updates the cursor visual to match the cursor position
 * @param graphics The graphics object to update
 * @param cursor The cursor position data
 */
export function updateCursorVisual(
  graphics: Phaser.GameObjects.Graphics,
  cursor: Cursor
): void {
  const position = getTileCenter(cursor.tileX, cursor.tileY);
  
  // Clear previous drawing
  graphics.clear();
  
  // Draw cursor outline - yellow square around the tile
  graphics.lineStyle(2, 0xffff00, 1); // 2px yellow line
  
  // Draw rectangle centered on tile
  const halfTile = TILE_SIZE / 2;
  graphics.strokeRect(
    position.x - halfTile,
    position.y - halfTile,
    TILE_SIZE,
    TILE_SIZE
  );
}

/**
 * Sets the cursor visual position based on cursor data
 * @param graphics The graphics object to position
 * @param cursor The cursor position data
 */
export function setCursorPosition(
  graphics: Phaser.GameObjects.Graphics,
  cursor: Cursor
): void {
  updateCursorVisual(graphics, cursor);
}