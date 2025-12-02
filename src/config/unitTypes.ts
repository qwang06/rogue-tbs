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
  // Player units - reusing ACOLYTE_01 sprites with tints
  WARRIOR: {
    name: "Warrior",
    unitType: "Warrior",
    sprites: {
      baseKey: "warrior",
      idleKey: ATLAS_KEYS.ACOLYTE_01_IDLE,
      moveKey: ATLAS_KEYS.ACOLYTE_01_MOVE,
      portraitKey: ATLAS_KEYS.ACOLYTE_01_PORTRAIT,
      tint: 0xff6b6b, // Red tint
    },
    baseStats: {
      hp: 20,
      maxHp: 20,
      mp: 0,
      maxMp: 0,
      attack: 8,
      defense: 5,
      magicAttack: 0,
      magicDefense: 3,
      speed: 5,
      luck: 5,
    },
  },
  ARCHER: {
    name: "Archer",
    unitType: "Archer",
    sprites: {
      baseKey: "archer",
      idleKey: ATLAS_KEYS.ACOLYTE_01_IDLE,
      moveKey: ATLAS_KEYS.ACOLYTE_01_MOVE,
      portraitKey: ATLAS_KEYS.ACOLYTE_01_PORTRAIT,
      tint: 0x51cf66, // Green tint
    },
    baseStats: {
      hp: 15,
      maxHp: 15,
      mp: 0,
      maxMp: 0,
      attack: 7,
      defense: 3,
      magicAttack: 0,
      magicDefense: 4,
      speed: 8,
      luck: 6,
    },
  },
  MAGE: {
    name: "Mage",
    unitType: "Mage",
    sprites: {
      baseKey: "mage",
      idleKey: ATLAS_KEYS.ACOLYTE_01_IDLE,
      moveKey: ATLAS_KEYS.ACOLYTE_01_MOVE,
      portraitKey: ATLAS_KEYS.ACOLYTE_01_PORTRAIT,
      tint: 0x748ffc, // Blue tint
    },
    baseStats: {
      hp: 12,
      maxHp: 12,
      mp: 15,
      maxMp: 15,
      attack: 3,
      defense: 2,
      magicAttack: 10,
      magicDefense: 8,
      speed: 6,
      luck: 7,
    },
  },
  // Enemy units
  BANDIT: {
    name: "Bandit",
    unitType: "Bandit",
    sprites: {
      baseKey: "bandit",
      idleKey: ATLAS_KEYS.ACOLYTE_06_IDLE,
      moveKey: ATLAS_KEYS.ACOLYTE_06_MOVE,
      portraitKey: ATLAS_KEYS.ACOLYTE_06_PORTRAIT,
    },
    baseStats: {
      hp: 30,
      maxHp: 30,
      mp: 0,
      maxMp: 0,
      attack: 10,
      defense: 4,
      magicAttack: 0,
      magicDefense: 2,
      speed: 7,
      luck: 4,
    },
  },
  // Original units kept for backward compatibility
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
