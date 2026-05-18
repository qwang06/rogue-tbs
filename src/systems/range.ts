/**
 * Range system - calculates tiles within attack range using Manhattan distance
 */

export interface TilePosition {
  tileX: number;
  tileY: number;
}

/**
 * Calculate Manhattan distance between two tiles
 * Manhattan distance is the sum of absolute differences of their coordinates
 */
export function getManhattanDistance(
  from: TilePosition,
  to: TilePosition
): number {
  return Math.abs(to.tileX - from.tileX) + Math.abs(to.tileY - from.tileY);
}

/**
 * Get all tiles within a given range from a source tile
 * Uses Manhattan distance (taxicab geometry)
 *
 * @param source The source tile position
 * @param range The Manhattan distance range
 * @param mapBounds Optional map boundaries to filter results
 * @returns Array of tile positions within range
 */
export function getTilesInRange(
  source: TilePosition,
  range: number,
  mapBounds?: { minX: number; minY: number; maxX: number; maxY: number }
): TilePosition[] {
  const tiles: TilePosition[] = [];

  // Iterate through all tiles in the bounding box
  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const tileX = source.tileX + dx;
      const tileY = source.tileY + dy;
      const distance = Math.abs(dx) + Math.abs(dy);

      // Check if tile is within range (exclude source tile)
      if (distance > 0 && distance <= range) {
        // Check if tile is within map bounds
        if (
          !mapBounds ||
          (tileX >= mapBounds.minX &&
            tileX <= mapBounds.maxX &&
            tileY >= mapBounds.minY &&
            tileY <= mapBounds.maxY)
        ) {
          tiles.push({ tileX, tileY });
        }
      }
    }
  }

  return tiles;
}

/**
 * Check if a target tile is within range of a source tile
 * @param source The source tile position
 * @param target The target tile position
 * @param range The maximum range
 * @returns true if target is within range
 */
export function isInRange(
  source: TilePosition,
  target: TilePosition,
  range: number
): boolean {
  return getManhattanDistance(source, target) <= range;
}
