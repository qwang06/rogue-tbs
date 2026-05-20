/**
 * Range system - calculates tiles within attack range using Manhattan distance
 */

import {
  manhattanDistance,
  tilesInManhattanRange,
  type GridBounds,
  type TilePosition,
} from "../util/gridMath";

/**
 * Calculate Manhattan distance between two tiles
 * Manhattan distance is the sum of absolute differences of their coordinates
 */
export function getManhattanDistance(
  from: TilePosition,
  to: TilePosition
): number {
  return manhattanDistance(from, to);
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
  mapBounds?: GridBounds
): TilePosition[] {
  return tilesInManhattanRange(source, range, mapBounds);
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
