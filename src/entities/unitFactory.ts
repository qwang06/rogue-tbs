import Phaser from "phaser";
import { getTileCenter, TILE_SIZE } from "../util/tile";
import { Unit, createUnit, getUnitFrameName } from "../components/Unit";
import { createDirectionAnimationFrames } from "../util/spritesheet";
import { UNIT_TYPES, UnitTypeKey } from "../config/unitTypes";
import {
  DEFAULT_UNIT_ANIMATION_CONFIG,
  UNIT_DIRECTIONS,
  UNIT_ANIMATION_STATES,
} from "../config/animations";
import { TilePosition, SpawnUnitResult } from "../types/units";

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
): SpawnUnitResult {
  const frameName = getUnitFrameName(unit);
  const textureKey =
    unit.animationState === "idle"
      ? unit.sprites.idleKey
      : unit.sprites.moveKey;

  const sprite = spawnUnit(
    scene,
    textureKey,
    frameName,
    unit.position.tileX,
    unit.position.tileY
  );

  // Create and play appropriate animation for the unit
  createUnitAnimations(scene, unit);
  playUnitAnimation(sprite, unit);

  return { unit, sprite };
}

/**
 * Factory function to create predefined unit types
 * @param unitTypeKey The predefined unit type
 * @param id Unique identifier for the unit
 * @param position Initial tile position
 * @returns Unit instance
 */
export function createPredefinedUnit(
  unitTypeKey: UnitTypeKey,
  id: string,
  position: TilePosition
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

/**
 * Creates Phaser animations for a unit if they don't already exist
 * @param scene The Phaser scene to create animations in
 * @param unit The unit to create animations for
 */
export function createUnitAnimations(scene: Phaser.Scene, unit: Unit): void {
  UNIT_ANIMATION_STATES.forEach((state) => {
    const textureKey =
      state === "idle" ? unit.sprites.idleKey : unit.sprites.moveKey;

    UNIT_DIRECTIONS.forEach((direction) => {
      const animationKey = `${unit.sprites.baseKey}_${state}_${direction}`;

      // Only create animation if it doesn't already exist
      if (!scene.anims.exists(animationKey)) {
        const frames = createDirectionAnimationFrames(
          textureKey,
          direction,
          DEFAULT_UNIT_ANIMATION_CONFIG.framesPerDirection
        );

        scene.anims.create({
          key: animationKey,
          frames: frames,
          frameRate: DEFAULT_UNIT_ANIMATION_CONFIG.frameRate,
          repeat: DEFAULT_UNIT_ANIMATION_CONFIG.repeat ? -1 : 0,
        });
      }
    });
  });
}

/**
 * Plays the appropriate animation for a unit based on its current state
 * @param sprite The sprite to play animation on
 * @param unit The unit data to determine which animation to play
 */
export function playUnitAnimation(
  sprite: Phaser.GameObjects.Sprite,
  unit: Unit
): void {
  const animationKey = `${unit.sprites.baseKey}_${unit.animationState}_${unit.facing}`;
  sprite.play(animationKey);
}
