/**
 * Tile highlight system - handles visual effects for tile highlighting (movement range, attack range, etc.)
 */

import Phaser from "phaser";
import { getTileCenter, TILE_SIZE } from "../util/tile";

export const MOVEMENT_HIGHLIGHT_TINT = 0x6666ff; // Blue highlight for movement
export const MOVEMENT_HIGHLIGHT_ALPHA = 0.4;
export const ATTACK_HIGHLIGHT_TINT = 0xff6666; // Red highlight for attack
export const ATTACK_HIGHLIGHT_ALPHA = 0.4;

/**
 * Map of tile coordinates to highlight sprites
 */
export interface TileHighlightMap {
  highlights: Map<string, Phaser.GameObjects.Rectangle>;
}

/**
 * Create an empty tile highlight map
 */
export function createTileHighlightMap(): TileHighlightMap {
  return {
    highlights: new Map(),
  };
}

/**
 * Generate a key for a tile position
 */
function getTileKey(tileX: number, tileY: number): string {
  return `${tileX},${tileY}`;
}

/**
 * Add a movement highlight to a tile
 */
export function addMovementHighlight(
  scene: Phaser.Scene,
  highlightMap: TileHighlightMap,
  tileX: number,
  tileY: number
): void {
  const key = getTileKey(tileX, tileY);

  // Don't add if already exists
  if (highlightMap.highlights.has(key)) {
    return;
  }

  const { x, y } = getTileCenter(tileX, tileY);

  const highlight = scene.add.rectangle(
    x,
    y,
    TILE_SIZE,
    TILE_SIZE,
    MOVEMENT_HIGHLIGHT_TINT,
    MOVEMENT_HIGHLIGHT_ALPHA
  );
  highlight.setDepth(5); // Above tiles, below cursor and units

  highlightMap.highlights.set(key, highlight);
}

/**
 * Remove a specific tile highlight
 */
export function removeHighlight(
  highlightMap: TileHighlightMap,
  tileX: number,
  tileY: number
): void {
  const key = getTileKey(tileX, tileY);
  const highlight = highlightMap.highlights.get(key);

  if (highlight) {
    highlight.destroy();
    highlightMap.highlights.delete(key);
  }
}

/**
 * Clear all highlights from the map
 */
export function clearAllHighlights(highlightMap: TileHighlightMap): void {
  highlightMap.highlights.forEach((highlight) => {
    highlight.destroy();
  });
  highlightMap.highlights.clear();
}

/**
 * Check if a tile is highlighted
 */
export function isTileHighlighted(
  highlightMap: TileHighlightMap,
  tileX: number,
  tileY: number
): boolean {
  const key = getTileKey(tileX, tileY);
  return highlightMap.highlights.has(key);
}

/**
 * Add an attack highlight to a tile
 */
export function addAttackHighlight(
  scene: Phaser.Scene,
  highlightMap: TileHighlightMap,
  tileX: number,
  tileY: number
): void {
  const key = getTileKey(tileX, tileY);

  // Don't add if already exists
  if (highlightMap.highlights.has(key)) {
    return;
  }

  const { x, y } = getTileCenter(tileX, tileY);

  const highlight = scene.add.rectangle(
    x,
    y,
    TILE_SIZE,
    TILE_SIZE,
    ATTACK_HIGHLIGHT_TINT,
    ATTACK_HIGHLIGHT_ALPHA
  );
  highlight.setDepth(5); // Above tiles, below cursor and units

  highlightMap.highlights.set(key, highlight);
}
