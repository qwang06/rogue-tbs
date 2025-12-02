/**
 * Movement system - handles unit movement state and range calculations
 */

import { Unit } from "../components/Unit";
import { Cursor } from "../components/Cursor";

export interface MovementState {
  isActive: boolean;
  unit: Unit | null;
  reachableTiles: Array<{ tileX: number; tileY: number }>;
}

/**
 * Create initial movement state
 */
export function createMovementState(): MovementState {
  return {
    isActive: false,
    unit: null,
    reachableTiles: [],
  };
}

/**
 * Check if movement mode is active
 */
export function isMovementActive(state: MovementState): boolean {
  return state.isActive;
}

/**
 * Enter movement mode for a unit
 */
export function enterMovementMode(
  state: MovementState,
  unit: Unit,
  mapBounds: { minX: number; minY: number; maxX: number; maxY: number },
  movementRange: number = 5
): MovementState {
  const reachableTiles = calculateMovementRange(
    unit.position.tileX,
    unit.position.tileY,
    movementRange,
    mapBounds
  );

  return {
    isActive: true,
    unit,
    reachableTiles,
  };
}

/**
 * Exit movement mode
 */
export function exitMovementMode(): MovementState {
  return {
    isActive: false,
    unit: null,
    reachableTiles: [],
  };
}

/**
 * Calculate all tiles reachable within movement range (orthogonal only, no obstacles)
 */
export function calculateMovementRange(
  startX: number,
  startY: number,
  range: number,
  mapBounds: { minX: number; minY: number; maxX: number; maxY: number }
): Array<{ tileX: number; tileY: number }> {
  const reachable: Array<{ tileX: number; tileY: number }> = [];
  const visited = new Set<string>();

  // BFS to find all tiles within range
  const queue: Array<{ x: number; y: number; dist: number }> = [
    { x: startX, y: startY, dist: 0 },
  ];
  visited.add(`${startX},${startY}`);

  while (queue.length > 0) {
    const current = queue.shift()!;

    // Add to reachable list (excluding starting position)
    if (current.dist > 0) {
      reachable.push({ tileX: current.x, tileY: current.y });
    }

    // Don't expand if we've reached max range
    if (current.dist >= range) {
      continue;
    }

    // Check all 4 orthogonal directions
    const directions = [
      { dx: 0, dy: -1 }, // up
      { dx: 0, dy: 1 }, // down
      { dx: -1, dy: 0 }, // left
      { dx: 1, dy: 0 }, // right
    ];

    for (const dir of directions) {
      const newX = current.x + dir.dx;
      const newY = current.y + dir.dy;
      const key = `${newX},${newY}`;

      // Check bounds
      if (
        newX < mapBounds.minX ||
        newX > mapBounds.maxX ||
        newY < mapBounds.minY ||
        newY > mapBounds.maxY
      ) {
        continue;
      }

      // Check if already visited
      if (visited.has(key)) {
        continue;
      }

      visited.add(key);
      queue.push({ x: newX, y: newY, dist: current.dist + 1 });
    }
  }

  return reachable;
}

/**
 * Check if a tile is reachable in the current movement state
 */
export function isTileReachable(state: MovementState, cursor: Cursor): boolean {
  if (!state.isActive) return false;

  return state.reachableTiles.some(
    (tile) => tile.tileX === cursor.tileX && tile.tileY === cursor.tileY
  );
}

/**
 * Generate a path from start to destination (orthogonal movement only)
 */
export function generateMovementPath(
  startX: number,
  startY: number,
  destX: number,
  destY: number
): Array<{ tileX: number; tileY: number }> {
  const path: Array<{ tileX: number; tileY: number }> = [];

  let currentX = startX;
  let currentY = startY;

  // Move horizontally first
  while (currentX !== destX) {
    if (currentX < destX) {
      currentX++;
    } else {
      currentX--;
    }
    path.push({ tileX: currentX, tileY: currentY });
  }

  // Then move vertically
  while (currentY !== destY) {
    if (currentY < destY) {
      currentY++;
    } else {
      currentY--;
    }
    path.push({ tileX: currentX, tileY: currentY });
  }

  return path;
}
