export const TILE_SIZE = 32;

/**
 * Returns the pixel position for the center of a tile.
 * @param tileX Tile X coordinate
 * @param tileY Tile Y coordinate
 * @returns { x: number, y: number }
 */
export function getTileCenter(tileX: number, tileY: number) {
  const offset = TILE_SIZE / 2;
  return {
    x: tileX * TILE_SIZE + offset,
    y: tileY * TILE_SIZE + offset,
  };
}
