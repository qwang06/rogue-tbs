/**
 * Unit highlight system - handles visual effects for unit selection
 */

export const HIGHLIGHT_TINT = 0xffff99; // Light yellow highlight

/**
 * Add highlight effect to a unit sprite
 */
export function addHighlightEffect(sprite: Phaser.GameObjects.Sprite): void {
  sprite.setTint(HIGHLIGHT_TINT);
}

/**
 * Remove highlight effect from a unit sprite
 */
export function removeHighlightEffect(sprite: Phaser.GameObjects.Sprite): void {
  sprite.clearTint();
}

/**
 * Toggle highlight effect on a sprite
 */
export function toggleHighlightEffect(
  sprite: Phaser.GameObjects.Sprite,
  highlighted: boolean
): void {
  if (highlighted) {
    addHighlightEffect(sprite);
  } else {
    removeHighlightEffect(sprite);
  }
}
