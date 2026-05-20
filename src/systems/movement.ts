/**
 * Movement system - handles unit movement state and range calculations
 */

import { Unit } from "../components/Unit";
import { Cursor } from "../components/Cursor";
import {
  calculateReachableTiles,
  generateOrthogonalPath,
} from "../util/pathing";
import type { GridBounds } from "../util/gridMath";

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
  mapBounds: GridBounds,
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
  mapBounds: GridBounds
): Array<{ tileX: number; tileY: number }> {
  return calculateReachableTiles(startX, startY, range, mapBounds);
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
  return generateOrthogonalPath(startX, startY, destX, destY);
}
