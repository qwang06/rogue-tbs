import Phaser from "phaser";
import { getTileCenter } from "../util/tile";
import type { Cursor } from "../components/Cursor";
import { ATLAS_KEYS, ANIMATION_KEYS, RPG_OW_FRAMES } from "../assets/keys";

/**
 * Creates a cursor visual representation using animated sprites
 * @param scene The Phaser scene to add the cursor to
 * @param cursor The cursor position data
 * @returns The sprite object representing the cursor
 */
export function createCursorVisual(
  scene: Phaser.Scene,
  cursor: Cursor
): Phaser.GameObjects.Sprite {
  // Create the cursor animation if it doesn't exist
  if (!scene.anims.exists(ANIMATION_KEYS.CURSOR_BLINK)) {
    scene.anims.create({
      key: ANIMATION_KEYS.CURSOR_BLINK,
      frames: [
        { key: ATLAS_KEYS.RPG_OW, frame: RPG_OW_FRAMES.CURSOR_0 },
        { key: ATLAS_KEYS.RPG_OW, frame: RPG_OW_FRAMES.CURSOR_1 },
      ],
      frameRate: 2,
      repeat: -1,
    });
  }

  const position = getTileCenter(cursor.tileX, cursor.tileY);
  const sprite = scene.add.sprite(
    position.x,
    position.y,
    ATLAS_KEYS.RPG_OW,
    RPG_OW_FRAMES.CURSOR_0
  );

  // Start the blinking animation
  sprite.play(ANIMATION_KEYS.CURSOR_BLINK);

  return sprite;
}

/**
 * Updates the cursor visual to match the cursor position
 * @param sprite The sprite object to update
 * @param cursor The cursor position data
 */
export function updateCursorVisual(
  sprite: Phaser.GameObjects.Sprite,
  cursor: Cursor
): void {
  const position = getTileCenter(cursor.tileX, cursor.tileY);
  sprite.setPosition(position.x, position.y);
}

/**
 * Sets the cursor visual position based on cursor data
 * @param sprite The sprite object to position
 * @param cursor The cursor position data
 */
export function setCursorPosition(
  sprite: Phaser.GameObjects.Sprite,
  cursor: Cursor
): void {
  updateCursorVisual(sprite, cursor);
}
