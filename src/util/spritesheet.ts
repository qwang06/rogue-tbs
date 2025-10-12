/**
 * Utilities for parsing and working with spritesheets
 *
 * For Acolyte sprites, the 4x4 format is:
 * - Row 0: front-facing frames (0, 1, 2, 3)
 * - Row 1: left-facing frames (0, 1, 2, 3)
 * - Row 2: right-facing frames (0, 1, 2, 3)
 * - Row 3: back-facing frames (0, 1, 2, 3)
 *
 * Example usage:
 * ```typescript
 * // For a 4x4 Acolyte spritesheet
 * createSpritesheetFrames(texture, { frameWidth: 32, frameHeight: 32, rows: 4, cols: 4 });
 *
 * // For a 2x3 character spritesheet with custom directions
 * const customDirections = { idle: 0, walk: 1 };
 * createSpritesheetFrames(texture, { frameWidth: 64, frameHeight: 64, rows: 2, cols: 3 }, customDirections);
 * ```
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
 * Common spritesheet configurations for different layouts
 */
export const SPRITESHEET_PRESETS = {
  ACOLYTE_4X4: ACOLYTE_SPRITESHEET_CONFIG,
  STANDARD_2X2: { frameWidth: 32, frameHeight: 32, rows: 2, cols: 2 },
  STANDARD_3X3: { frameWidth: 32, frameHeight: 32, rows: 3, cols: 3 },
  LARGE_4X4: { frameWidth: 64, frameHeight: 64, rows: 4, cols: 4 },
} as const;

/**
 * Direction mapping for 4x4 Acolyte spritesheets (row indices)
 */
export const DIRECTION_ROWS = {
  front: 0,
  left: 1,
  right: 2,
  back: 3,
} as const;

/**
 * Converts a direction and frame column index to a numeric frame index for a 4x4 spritesheet.
 * Phaser auto-generates frames left-to-right, top-to-bottom: 0-3 (row 0), 4-7 (row 1), etc.
 *
 * @param direction The direction (front, left, right, back)
 * @param frameCol The column index within that direction's row (0-3)
 * @param cols Number of columns in the spritesheet (default 4)
 * @returns The numeric frame index (0-15 for a 4x4 grid)
 *
 * @example
 * getFrameIndex('front', 0) // 0 (first frame of front row)
 * getFrameIndex('left', 2)  // 6 (third frame of left row)
 */
export function getFrameIndex(
  direction: keyof typeof DIRECTION_ROWS,
  frameCol: number = 0,
  cols: number = 4
): number {
  const row = DIRECTION_ROWS[direction];
  return row * cols + frameCol;
}

/**
 * Common direction mappings for different spritesheet layouts
 */
export const DIRECTION_MAPPINGS = {
  // 4-direction character sprites (Acolyte style)
  FOUR_DIRECTION: DIRECTION_ROWS,

  // 2-direction sprites (side-scroller style)
  TWO_DIRECTION: {
    left: 0,
    right: 1,
  },

  // Single direction with different animation states
  ANIMATION_STATES: {
    idle: 0,
    walk: 1,
    run: 2,
    attack: 3,
  },

  // Simple 2-state sprites
  SIMPLE_STATES: {
    idle: 0,
    active: 1,
  },
} as const;

/**
 * Creates frame definitions for a spritesheet with configurable row/column layout
 * @param texture The Phaser texture object
 * @param config Frame configuration including dimensions and layout
 * @param directionMapping Optional custom mapping of direction names to row indices
 */
export function createSpritesheetFrames(
  texture: Phaser.Textures.Texture,
  config: SpritesheetFrameConfig,
  directionMapping: Record<string, number> = DIRECTION_ROWS
): void {
  // Calculate actual frame dimensions based on texture size
  const source = texture.source[0];
  const actualFrameWidth = source.width / config.cols;
  const actualFrameHeight = source.height / config.rows;

  // Create frames for each direction and frame index
  Object.entries(directionMapping).forEach(([direction, row]) => {
    // Skip if row index exceeds available rows
    if (row >= config.rows) return;

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
 * Creates animation frames for a unit direction using numeric frame indices
 * @param textureKey The texture key
 * @param direction The direction to create animation for
 * @param frameCount Number of frames in the animation (default 4)
 * @param cols Number of columns in the spritesheet (default 4)
 * @returns Array of animation frame configs
 */
export function createDirectionAnimationFrames(
  textureKey: string,
  direction: keyof typeof DIRECTION_ROWS,
  frameCount: number = 4,
  cols: number = 4
): Phaser.Types.Animations.AnimationFrame[] {
  const frames: Phaser.Types.Animations.AnimationFrame[] = [];

  for (let i = 0; i < frameCount; i++) {
    frames.push({
      key: textureKey,
      frame: getFrameIndex(direction, i, cols),
    });
  }

  return frames;
}
