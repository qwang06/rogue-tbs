import Phaser from "phaser";
import { InputController } from "../../input/InputController";
import type { Cursor } from "../../components/Cursor";
import {
  Direction,
  moveCursorWithBounds,
  type MapBounds,
  type DirectionType,
} from "../../systems/cursor";

/**
 * Callback interface for input handling
 */
export interface InputHandlerCallbacks {
  onMenuNavigateUp: () => void;
  onMenuNavigateDown: () => void;
  onCursorMove: (cursor: Cursor) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Manages input handling and routing for the game scene.
 * Routes inputs to appropriate handlers based on game state.
 */
export class GameInputHandler {
  private inputController: InputController;
  private cursor: Cursor;
  private mapBounds: MapBounds;
  private callbacks: InputHandlerCallbacks;
  private isMenuActive: () => boolean;
  private isUnitMoving: () => boolean;

  constructor(
    scene: Phaser.Scene,
    cursor: Cursor,
    mapBounds: MapBounds,
    isMenuActive: () => boolean,
    isUnitMoving: () => boolean,
    callbacks: InputHandlerCallbacks
  ) {
    this.cursor = cursor;
    this.mapBounds = mapBounds;
    this.callbacks = callbacks;
    this.isMenuActive = isMenuActive;
    this.isUnitMoving = isUnitMoving;

    // Create InputController with default repeat settings
    this.inputController = new InputController(scene);

    // Subscribe to movement events
    this.inputController
      .on("move:up", () => this.handleMoveUp())
      .on("move:down", () => this.handleMoveDown())
      .on("move:left", () => this.handleMoveLeft())
      .on("move:right", () => this.handleMoveRight())
      .on("confirm", () => this.callbacks.onConfirm())
      .on("cancel", () => this.callbacks.onCancel());
  }

  update(delta: number): void {
    this.inputController.update(delta);
  }

  private handleMoveUp(): void {
    if (this.isMenuActive()) {
      this.callbacks.onMenuNavigateUp();
    } else {
      this.moveCursor(Direction.UP);
    }
  }

  private handleMoveDown(): void {
    if (this.isMenuActive()) {
      this.callbacks.onMenuNavigateDown();
    } else {
      this.moveCursor(Direction.DOWN);
    }
  }

  private handleMoveLeft(): void {
    if (!this.isMenuActive()) {
      this.moveCursor(Direction.LEFT);
    }
    // Left/right do nothing in menu navigation
  }

  private handleMoveRight(): void {
    if (!this.isMenuActive()) {
      this.moveCursor(Direction.RIGHT);
    }
    // Left/right do nothing in menu navigation
  }

  private moveCursor(direction: DirectionType): void {
    if (this.isUnitMoving()) return; // Don't move cursor while unit is moving

    this.cursor = moveCursorWithBounds(this.cursor, direction, this.mapBounds);

    // Notify callback about cursor move
    this.callbacks.onCursorMove(this.cursor);
  }

  getCursor(): Cursor {
    return this.cursor;
  }

  destroy(): void {
    this.inputController.destroy();
  }
}
