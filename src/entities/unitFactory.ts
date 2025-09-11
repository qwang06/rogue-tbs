import Phaser from "phaser";
import { getTileCenter, TILE_SIZE } from "../util/tile";

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
  sprite.setOrigin(0.5, 1);
  
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