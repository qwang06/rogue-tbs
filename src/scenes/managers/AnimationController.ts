import Phaser from "phaser";
import type { UnitData } from "../../systems/unitSelection";
import {
  moveUnit,
  setUnitFacing,
  setUnitAnimationState,
} from "../../components/Unit";
import { playUnitAnimation } from "../../entities/unitFactory";
import { getTileCenter } from "../../util/tile";

/**
 * Handles unit animations including movement along paths and damage effects.
 * Keeps animation logic separate from scene management.
 */
export class UnitAnimationController {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  /**
   * Animate unit movement along a path
   * @param unitData The unit to animate
   * @param path The path to follow
   * @param onComplete Callback when movement is complete
   */
  animateMovement(
    unitData: UnitData,
    path: Array<{ tileX: number; tileY: number }>,
    onComplete: () => void
  ): void {
    if (path.length === 0) {
      onComplete();
      return;
    }

    // Move one step at a time
    this.moveOneStep(unitData, path, 0, onComplete);
  }

  /**
   * Move unit one step along the path
   */
  private moveOneStep(
    unitData: UnitData,
    path: Array<{ tileX: number; tileY: number }>,
    stepIndex: number,
    onComplete: () => void
  ): void {
    if (stepIndex >= path.length) {
      onComplete();
      return;
    }

    const nextTile = path[stepIndex];
    const currentTile = unitData.unit.position;

    // Determine facing direction
    const facing = this.calculateFacingDirection(
      currentTile.tileX,
      currentTile.tileY,
      nextTile.tileX,
      nextTile.tileY
    );

    // Update unit data
    unitData.unit = setUnitFacing(unitData.unit, facing);
    unitData.unit = setUnitAnimationState(unitData.unit, "move");
    unitData.unit = moveUnit(unitData.unit, nextTile.tileX, nextTile.tileY);
    playUnitAnimation(unitData.sprite, unitData.unit);

    // Animate sprite to new position
    const { x, y } = getTileCenter(nextTile.tileX, nextTile.tileY);
    this.scene.tweens.add({
      targets: unitData.sprite,
      x,
      y,
      duration: 200, // 200ms per tile
      ease: "Linear",
      onComplete: () => {
        // Move to next step
        this.moveOneStep(unitData, path, stepIndex + 1, onComplete);
      },
    });
  }

  /**
   * Set unit back to idle animation
   */
  setUnitIdle(unitData: UnitData): void {
    unitData.unit = setUnitAnimationState(unitData.unit, "idle");
    playUnitAnimation(unitData.sprite, unitData.unit);
  }

  /**
   * Update unit facing direction and play current animation
   */
  updateUnitFacing(unitData: UnitData, targetX: number, targetY: number): void {
    const facing = this.calculateFacingDirection(
      unitData.unit.position.tileX,
      unitData.unit.position.tileY,
      targetX,
      targetY
    );
    unitData.unit = setUnitFacing(unitData.unit, facing);
    playUnitAnimation(unitData.sprite, unitData.unit);
  }

  /**
   * Play damage effect on a unit sprite (blink effect)
   */
  playDamageEffect(sprite: Phaser.GameObjects.Sprite): void {
    // Blink effect: flash red and fade in/out 3 times
    this.scene.tweens.add({
      targets: sprite,
      alpha: 0.3,
      tint: 0xff0000, // Red tint
      duration: 100,
      yoyo: true,
      repeat: 2, // Blink 3 times total
      onComplete: () => {
        // Reset to normal
        sprite.clearTint();
        sprite.setAlpha(1);
      },
    });
  }

  /**
   * Calculate facing direction from source position to target position.
   * Prioritizes horizontal movement over vertical when distances are equal.
   */
  private calculateFacingDirection(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number
  ): "front" | "left" | "right" | "back" {
    const deltaX = targetX - sourceX;
    const deltaY = targetY - sourceY;

    // Determine facing based on larger delta (prioritize horizontal movement)
    if (Math.abs(deltaX) >= Math.abs(deltaY)) {
      return deltaX > 0 ? "right" : "left";
    } else {
      return deltaY > 0 ? "front" : "back";
    }
  }
}
