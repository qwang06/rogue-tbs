/**
 * Attack system - handles attack targeting, damage calculation, and combat logic
 * Pure domain logic with no Phaser dependencies for testability
 */

import { Unit } from "../components/Unit";
import { Cursor } from "../components/Cursor";

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
  mapBounds: { minX: number; minY: number; maxX: number; maxY: number }
): Array<{ tileX: number; tileY: number }> {
  const attackable: Array<{ tileX: number; tileY: number }> = [];

  // For basic attack, only orthogonal directions
  const directions = [
    { dx: 0, dy: -1 }, // up
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: 0 }, // left
    { dx: 1, dy: 0 }, // right
  ];

  // Check each direction up to the attack range
  for (const dir of directions) {
    for (let dist = 1; dist <= range; dist++) {
      const targetX = startX + dir.dx * dist;
      const targetY = startY + dir.dy * dist;

      // Check bounds
      if (
        targetX < mapBounds.minX ||
        targetX > mapBounds.maxX ||
        targetY < mapBounds.minY ||
        targetY > mapBounds.maxY
      ) {
        break; // Stop checking this direction if out of bounds
      }

      attackable.push({ tileX: targetX, tileY: targetY });
    }
  }

  return attackable;
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
  mapBounds: { minX: number; minY: number; maxX: number; maxY: number },
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
