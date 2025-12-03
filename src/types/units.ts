/**
 * Reusable types for unit system
 */

import { UnitStats, UnitSprites } from "../components/Unit";

/**
 * Configuration interface for defining a unit type
 */
export interface UnitTypeConfig {
  /** Display name of the unit */
  name: string;
  /** Unit type/class identifier */
  unitType: string;
  /** Sprite asset references */
  sprites: UnitSprites;
  /** Base stats for this unit type */
  baseStats: Partial<UnitStats>;
  /** Attack range in tiles (Manhattan distance) */
  range: number;
}

/**
 * Position coordinates on the tile grid
 */
export interface TilePosition {
  tileX: number;
  tileY: number;
}

/**
 * Animation configuration for units
 */
export interface UnitAnimationConfig {
  /** Frame rate for animations */
  frameRate: number;
  /** Number of frames per direction */
  framesPerDirection: number;
  /** Whether animations should repeat indefinitely */
  repeat: boolean;
}

/**
 * Direction types for unit sprites
 */
export type UnitDirection = "front" | "left" | "right" | "back";

/**
 * Animation state types for units
 */
export type UnitAnimationState = "idle" | "move";

/**
 * Result type for spawning units
 */
export interface SpawnUnitResult {
  unit: import("../components/Unit").Unit;
  sprite: Phaser.GameObjects.Sprite;
}
