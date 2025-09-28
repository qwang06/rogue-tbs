import Phaser from "phaser";
import { getTileCenter, TILE_SIZE } from "../util/tile";
import { Unit, createUnit, getUnitFrameName, UnitSprites } from "../components/Unit";
import { ATLAS_KEYS } from "../assets/keys";

/**
 * Spawns a unit sprite at the specified tile coordinates with proper alignment and scaling.
 *
 * @param scene - The Phaser scene to add the sprite to
 * @param key - The texture key for the sprite
 * @param frame - The frame key within the texture
 * @param tileX - The tile X coordinate
 * @param tileY - The tile Y coordinate
 * @returns The created sprite positioned and scaled for the tile grid
 */
export function spawnUnit(
  scene: Phaser.Scene,
  key: string,
  frame: string,
  tileX: number,
  tileY: number
): Phaser.GameObjects.Sprite {
  // Get the world position for the tile center
  const position = getTileCenter(tileX, tileY);

  // Create the sprite at the tile center
  const sprite = scene.add.sprite(position.x, position.y, key, frame);

  // Set origin so feet are aligned with bottom-center of tile
  sprite.setOrigin(0.5, 0.5);

  // Scale the sprite based on TILE_SIZE
  // Get the frame data to determine the original width
  const texture = scene.textures.get(key);
  const frameData = texture.get(frame);

  if (frameData && frameData.width > 0) {
    const scale = TILE_SIZE / frameData.width;
    sprite.setScale(scale);
  }

  return sprite;
}

/**
 * Creates a Unit instance and spawns its sprite in the scene
 * @param scene The Phaser scene to add the sprite to
 * @param unit The Unit instance to spawn
 * @returns Object containing the Unit and its Phaser sprite
 */
export function spawnUnitFromData(
  scene: Phaser.Scene,
  unit: Unit
): { unit: Unit; sprite: Phaser.GameObjects.Sprite } {
  const frameName = getUnitFrameName(unit);
  const textureKey = unit.animationState === 'idle' ? unit.sprites.idleKey : unit.sprites.moveKey;
  
  const sprite = spawnUnit(
    scene,
    textureKey,
    frameName,
    unit.position.tileX,
    unit.position.tileY
  );

  return { unit, sprite };
}

/**
 * Predefined unit type configurations for easy instantiation
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
    } as UnitSprites,
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
    } as UnitSprites,
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
} as const;

/**
 * Factory function to create predefined unit types
 * @param unitTypeKey The predefined unit type
 * @param id Unique identifier for the unit
 * @param position Initial tile position
 * @returns Unit instance
 */
export function createPredefinedUnit(
  unitTypeKey: keyof typeof UNIT_TYPES,
  id: string,
  position: { tileX: number; tileY: number }
): Unit {
  const config = UNIT_TYPES[unitTypeKey];
  
  return createUnit(
    id,
    config.name,
    config.unitType,
    position,
    config.sprites,
    config.baseStats
  );
}
