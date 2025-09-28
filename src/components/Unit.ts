/**
 * Unit component - represents a combat unit with stats and sprite information
 * This is a pure data component with no Phaser dependencies for testability
 */

export interface UnitStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  attack: number;
  defense: number;
  // Fields for future expansion
  magicAttack?: number;
  magicDefense?: number;
  speed?: number;
  luck?: number;
}

export interface UnitSprites {
  /**
   * Base key for the unit's sprites (e.g., "acolyte_01")
   */
  baseKey: string;
  /**
   * Key for the idle spritesheet
   */
  idleKey: string;
  /**
   * Key for the move spritesheet
   */
  moveKey: string;
  /**
   * Key for the portrait image
   */
  portraitKey: string;
}

export interface Unit {
  /**
   * Unique identifier for the unit instance
   */
  id: string;
  /**
   * Display name of the unit
   */
  name: string;
  /**
   * Unit type/class (e.g., "Acolyte", "Warrior")
   */
  unitType: string;
  /**
   * Current position on the tile grid
   */
  position: {
    tileX: number;
    tileY: number;
  };
  /**
   * Unit combat statistics
   */
  stats: UnitStats;
  /**
   * Sprite asset information
   */
  sprites: UnitSprites;
  /**
   * Current facing direction (for sprite selection)
   */
  facing: 'front' | 'left' | 'right' | 'back';
  /**
   * Current animation state
   */
  animationState: 'idle' | 'move' | 'attack' | 'damaged';
  /**
   * Additional data for future expansion (spells, abilities, equipment, etc.)
   */
  customData?: Record<string, any>;
}

/**
 * Factory function to create a new Unit instance with default values
 */
export function createUnit(
  id: string,
  name: string,
  unitType: string,
  position: { tileX: number; tileY: number },
  sprites: UnitSprites,
  baseStats?: Partial<UnitStats>
): Unit {
  const defaultStats: UnitStats = {
    hp: 100,
    maxHp: 100,
    mp: 20,
    maxMp: 20,
    attack: 25,
    defense: 15,
    // Default values for future expansion fields
    magicAttack: 10,
    magicDefense: 10,
    speed: 10,
    luck: 5,
    ...baseStats,
  };

  return {
    id,
    name,
    unitType,
    position,
    stats: defaultStats,
    sprites,
    facing: 'front',
    animationState: 'idle',
    customData: {},
  };
}

/**
 * Helper function to get the current frame name based on unit state
 * Format: direction_frame (e.g., "front_0", "left_1")
 */
export function getUnitFrameName(unit: Unit, frameIndex: number = 0): string {
  return `${unit.facing}_${frameIndex}`;
}

/**
 * Helper function to update unit position
 */
export function moveUnit(unit: Unit, tileX: number, tileY: number): Unit {
  return {
    ...unit,
    position: { tileX, tileY },
  };
}

/**
 * Helper function to change unit facing direction
 */
export function setUnitFacing(unit: Unit, facing: Unit['facing']): Unit {
  return {
    ...unit,
    facing,
  };
}

/**
 * Helper function to change unit animation state
 */
export function setUnitAnimationState(unit: Unit, animationState: Unit['animationState']): Unit {
  return {
    ...unit,
    animationState,
  };
}