/**
 * Unit type configurations for the game
 * This file contains all predefined unit types with their stats, sprites, and metadata
 */

import { ATLAS_KEYS } from "../assets/keys";
import { UnitTypeConfig } from "../types/units";

/**
 * Predefined unit type configurations for easy instantiation
 *
 * To add a new unit type:
 * 1. Add the sprite assets to public/assets/sprites/
 * 2. Add the atlas keys to ATLAS_KEYS in src/assets/keys.ts
 * 3. Add a new entry to this UNIT_TYPES object
 * 4. The unit will be available via createPredefinedUnit()
 */
export const UNIT_TYPES = {
  ACOLYTE_01: {
    name: "Acolyte",
    unitType: "Acolyte",
    sprites: {
      baseKey: "acolyte_01",
      idleKey: ATLAS_KEYS.ACOLYTE_01_IDLE,
      moveKey: ATLAS_KEYS.ACOLYTE_01_MOVE,
      portraitKey: ATLAS_KEYS.ACOLYTE_01_PORTRAIT,
    },
    baseStats: {
      hp: 80,
      maxHp: 80,
      mp: 30,
      maxMp: 30,
      attack: 20,
      defense: 12,
      magicAttack: 25,
      magicDefense: 18,
      speed: 12,
      luck: 8,
    },
  },
  ACOLYTE_06: {
    name: "Battle Acolyte",
    unitType: "Acolyte",
    sprites: {
      baseKey: "acolyte_06",
      idleKey: ATLAS_KEYS.ACOLYTE_06_IDLE,
      moveKey: ATLAS_KEYS.ACOLYTE_06_MOVE,
      portraitKey: ATLAS_KEYS.ACOLYTE_06_PORTRAIT,
    },
    baseStats: {
      hp: 90,
      maxHp: 90,
      mp: 25,
      maxMp: 25,
      attack: 28,
      defense: 16,
      magicAttack: 20,
      magicDefense: 14,
      speed: 14,
      luck: 6,
    },
  },
} as const satisfies Record<string, UnitTypeConfig>;

/**
 * Type-safe keys for accessing unit types
 */
export type UnitTypeKey = keyof typeof UNIT_TYPES;
