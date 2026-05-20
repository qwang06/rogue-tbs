/**
 * Attack system - handles attack targeting, damage calculation, and combat logic
 * Pure domain logic with no Phaser dependencies for testability
 */

import { Unit } from "../components/Unit";
import { Cursor } from "../components/Cursor";
import { projectOrthogonalRange } from "../util/pathing";
import type { GridBounds } from "../util/gridMath";

export interface AttackState {
  isActive: boolean;
  attackingUnit: Unit | null;
  attackableTiles: Array<{ tileX: number; tileY: number }>;
}

/**
 * Create initial attack state
 */
export function createAttackState(): AttackState {
  return {
    isActive: false,
    attackingUnit: null,
    attackableTiles: [],
  };
}

/**
 * Check if attack mode is active
 */
export function isAttackActive(state: AttackState): boolean {
  return state.isActive;
}

/**
 * Calculate all tiles that can be attacked from a position
 * For basic attack: orthogonal tiles with range 1
 * @param startX Starting X position
 * @param startY Starting Y position
 * @param range Attack range (default 1 for basic attack)
 * @param mapBounds Map boundaries
 * @returns Array of attackable tile positions
 */
export function calculateAttackRange(
  startX: number,
  startY: number,
  range: number = 1,
  mapBounds: GridBounds
): Array<{ tileX: number; tileY: number }> {
  return projectOrthogonalRange(startX, startY, range, mapBounds);
}

/**
 * Enter attack mode for a unit
 * @param state Current attack state
 * @param unit The attacking unit
 * @param mapBounds Map boundaries
 * @param range Attack range (default 1)
 * @returns Updated attack state
 */
export function enterAttackMode(
  state: AttackState,
  unit: Unit,
  mapBounds: GridBounds,
  range: number = 1
): AttackState {
  const attackableTiles = calculateAttackRange(
    unit.position.tileX,
    unit.position.tileY,
    range,
    mapBounds
  );

  return {
    isActive: true,
    attackingUnit: unit,
    attackableTiles,
  };
}

/**
 * Exit attack mode
 */
export function exitAttackMode(): AttackState {
  return {
    isActive: false,
    attackingUnit: null,
    attackableTiles: [],
  };
}

/**
 * Check if a tile is attackable in the current attack state
 */
export function isTileAttackable(state: AttackState, cursor: Cursor): boolean {
  if (!state.isActive) return false;

  return state.attackableTiles.some(
    (tile) => tile.tileX === cursor.tileX && tile.tileY === cursor.tileY
  );
}

/**
 * Calculate damage dealt from attacker to defender
 * Damage = max(1, attacker's attack - defender's defense)
 * @param attacker The attacking unit
 * @param defender The defending unit
 * @returns Damage amount (minimum 1)
 */
export function calculateDamage(attacker: Unit, defender: Unit): number {
  const rawDamage = attacker.stats.attack - defender.stats.defense;
  return Math.max(1, rawDamage);
}

/**
 * Apply damage to a unit and return updated unit with new HP
 * HP cannot go below 0
 * @param unit The unit taking damage
 * @param damage The amount of damage to apply
 * @returns Updated unit with reduced HP
 */
export function applyDamage(unit: Unit, damage: number): Unit {
  const newHp = Math.max(0, unit.stats.hp - damage);

  return {
    ...unit,
    stats: {
      ...unit.stats,
      hp: newHp,
    },
  };
}
