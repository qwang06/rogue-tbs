/**
 * Animation configuration for units
 */

import { UnitAnimationConfig, UnitDirection, UnitAnimationState } from "../types/units";

/**
 * Default animation settings for units
 */
export const DEFAULT_UNIT_ANIMATION_CONFIG: UnitAnimationConfig = {
  frameRate: 6, // Slow animation for idle, can be adjusted
  framesPerDirection: 4, // 4 frames per direction in the spritesheet
  repeat: true, // Loop indefinitely
};

/**
 * Available directions for unit sprites
 */
export const UNIT_DIRECTIONS: readonly UnitDirection[] = ['front', 'left', 'right', 'back'] as const;

/**
 * Available animation states for units
 */
export const UNIT_ANIMATION_STATES: readonly UnitAnimationState[] = ['idle', 'move'] as const;