import {
  ORTHOGONAL_DIRECTIONS,
  tileKey,
  type GridBounds,
  type TilePosition,
  isWithinBounds,
} from "./gridMath";

export function calculateReachableTiles(
  startX: number,
  startY: number,
  range: number,
  bounds: GridBounds
): TilePosition[] {
  const reachable: TilePosition[] = [];
  const visited = new Set<string>();
  const queue: Array<{ x: number; y: number; dist: number }> = [
    { x: startX, y: startY, dist: 0 },
  ];

  visited.add(tileKey(startX, startY));

  while (queue.length > 0) {
    const current = queue.shift()!;

    if (current.dist > 0) {
      reachable.push({ tileX: current.x, tileY: current.y });
    }

    if (current.dist >= range) {
      continue;
    }

    for (const direction of ORTHOGONAL_DIRECTIONS) {
      const newX = current.x + direction.dx;
      const newY = current.y + direction.dy;
      const key = tileKey(newX, newY);

      if (!isWithinBounds(newX, newY, bounds) || visited.has(key)) {
        continue;
      }

      visited.add(key);
      queue.push({ x: newX, y: newY, dist: current.dist + 1 });
    }
  }

  return reachable;
}

export function generateOrthogonalPath(
  startX: number,
  startY: number,
  destX: number,
  destY: number
): TilePosition[] {
  const path: TilePosition[] = [];

  let currentX = startX;
  let currentY = startY;

  while (currentX !== destX) {
    currentX += currentX < destX ? 1 : -1;
    path.push({ tileX: currentX, tileY: currentY });
  }

  while (currentY !== destY) {
    currentY += currentY < destY ? 1 : -1;
    path.push({ tileX: currentX, tileY: currentY });
  }

  return path;
}

export function projectOrthogonalRange(
  startX: number,
  startY: number,
  range: number,
  bounds: GridBounds
): TilePosition[] {
  const attackable: TilePosition[] = [];

  for (const direction of ORTHOGONAL_DIRECTIONS) {
    for (let distance = 1; distance <= range; distance++) {
      const targetX = startX + direction.dx * distance;
      const targetY = startY + direction.dy * distance;

      if (!isWithinBounds(targetX, targetY, bounds)) {
        break;
      }

      attackable.push({ tileX: targetX, tileY: targetY });
    }
  }

  return attackable;
}
