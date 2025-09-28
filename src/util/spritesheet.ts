/**
 * Utilities for parsing and working with spritesheets
 * 
 * For Acolyte sprites, the 4x4 format is:
 * - Row 0: front-facing frames (0, 1, 2, 3)
 * - Row 1: left-facing frames (0, 1, 2, 3)  
 * - Row 2: right-facing frames (0, 1, 2, 3)
 * - Row 3: back-facing frames (0, 1, 2, 3)
 */

export interface SpritesheetFrameConfig {
  frameWidth: number;
  frameHeight: number;
  rows: number;
  cols: number;
}

/**
 * Standard configuration for Acolyte 4x4 spritesheets
 */
export const ACOLYTE_SPRITESHEET_CONFIG: SpritesheetFrameConfig = {
  frameWidth: 32, // Assumed frame size - will be adjusted based on actual dimensions
  frameHeight: 32,
  rows: 4,
  cols: 4,
};

/**
 * Direction mapping for 4x4 Acolyte spritesheets
 */
export const DIRECTION_ROWS = {
  front: 0,
  left: 1,
  right: 2,
  back: 3,
} as const;

/**
 * Creates frame definitions for a 4x4 spritesheet
 * @param textureKey The texture key to add frames to
 * @param texture The Phaser texture object
 * @param config Frame configuration
 */
export function create4x4Frames(
  texture: Phaser.Textures.Texture,
  config: SpritesheetFrameConfig = ACOLYTE_SPRITESHEET_CONFIG
): void {
  // Calculate actual frame dimensions based on texture size
  const source = texture.source[0];
  const actualFrameWidth = source.width / config.cols;
  const actualFrameHeight = source.height / config.rows;

  // Create frames for each direction and frame index
  Object.entries(DIRECTION_ROWS).forEach(([direction, row]) => {
    for (let col = 0; col < config.cols; col++) {
      const frameName = `${direction}_${col}`;
      const x = col * actualFrameWidth;
      const y = row * actualFrameHeight;
      
      // Only add frame if it doesn't already exist
      if (!texture.has(frameName)) {
        texture.add(frameName, 0, x, y, actualFrameWidth, actualFrameHeight);
      }
    }
  });
}

/**
 * Gets the appropriate frame name for a unit's current state
 * @param facing Direction the unit is facing
 * @param frameIndex Animation frame index (0-3)
 * @returns Frame name string
 */
export function getFrameName(
  facing: keyof typeof DIRECTION_ROWS,
  frameIndex: number = 0
): string {
  return `${facing}_${frameIndex}`;
}

/**
 * Creates animation frames for a unit direction
 * @param textureKey The texture key
 * @param direction The direction to create animation for
 * @param frameCount Number of frames in the animation (default 4)
 * @returns Array of animation frame configs
 */
export function createDirectionAnimationFrames(
  textureKey: string,
  direction: keyof typeof DIRECTION_ROWS,
  frameCount: number = 4
): Phaser.Types.Animations.AnimationFrame[] {
  const frames: Phaser.Types.Animations.AnimationFrame[] = [];
  
  for (let i = 0; i < frameCount; i++) {
    frames.push({
      key: textureKey,
      frame: getFrameName(direction, i),
    });
  }
  
  return frames;
}