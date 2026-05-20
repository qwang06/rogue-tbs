export interface TilePosition {
  tileX: number;
  tileY: number;
}

export interface GridBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface GridDirection {
  dx: number;
  dy: number;
}

export const ORTHOGONAL_DIRECTIONS: readonly GridDirection[] = [
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
];

export function manhattanDistance(
  from: TilePosition,
  to: TilePosition
): number {
  return Math.abs(to.tileX - from.tileX) + Math.abs(to.tileY - from.tileY);
}

export function isWithinBounds(
  tileX: number,
  tileY: number,
  bounds: GridBounds
): boolean {
  return (
    tileX >= bounds.minX &&
    tileX <= bounds.maxX &&
    tileY >= bounds.minY &&
    tileY <= bounds.maxY
  );
}

export function tileKey(tileX: number, tileY: number): string {
  return `${tileX},${tileY}`;
}

export function tilesInManhattanRange(
  source: TilePosition,
  range: number,
  bounds?: GridBounds
): TilePosition[] {
  const tiles: TilePosition[] = [];

  for (let dx = -range; dx <= range; dx++) {
    for (let dy = -range; dy <= range; dy++) {
      const tileX = source.tileX + dx;
      const tileY = source.tileY + dy;
      const distance = Math.abs(dx) + Math.abs(dy);

      if (distance === 0 || distance > range) {
        continue;
      }

      if (!bounds || isWithinBounds(tileX, tileY, bounds)) {
        tiles.push({ tileX, tileY });
      }
    }
  }

  return tiles;
}
