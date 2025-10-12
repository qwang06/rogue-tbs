import Phaser from "phaser";
import {
  spawnUnitFromData,
  createPredefinedUnit,
  playUnitAnimation,
} from "../entities/unitFactory";
import { createCursor } from "../components/Cursor";
import {
  createCursorVisual,
  updateCursorVisual,
} from "../entities/cursorFactory";
import {
  Direction,
  moveCursorWithBounds,
  type MapBounds,
  type DirectionType,
} from "../systems/cursorSystem";
import {
  createUnitSelectionState,
  findUnitAtCursor,
  hasSelectedUnit,
  selectUnit,
  deselectUnit,
  getSelectedUnit,
  type UnitSelectionState,
  type UnitData,
} from "../systems/unitSelectionSystem";

import {
  addHighlightEffect,
  removeHighlightEffect,
} from "../systems/unitHighlightSystem";
import {
  createTileHighlightMap,
  addMovementHighlight,
  addAttackHighlight,
  clearAllHighlights,
  type TileHighlightMap,
} from "../systems/tileHighlightSystem";
import {
  createMovementState,
  enterMovementMode,
  exitMovementMode,
  isMovementActive,
  isTileReachable,
  generateMovementPath,
  type MovementState,
} from "../systems/movementSystem";
import {
  createAttackState,
  enterAttackMode,
  exitAttackMode,
  isAttackActive,
  isTileAttackable,
  calculateDamage,
  applyDamage,
  type AttackState,
} from "../systems/attackSystem";
import {
  moveUnit,
  setUnitFacing,
  setUnitAnimationState,
} from "../components/Unit";
import { loadGeneratedMap, getMapCameraBounds } from "../util/mapLoader";
import { MAP_KEYS } from "../assets/keys";
import { InputController } from "../input/InputController";
import { getTileCenter } from "../util/tile";

export class GameScene extends Phaser.Scene {
  private cursor = createCursor(0, 0); // Start at top-left tile
  private cursorVisual: Phaser.GameObjects.Sprite | null = null;
  private mapBounds: MapBounds = {
    minX: 0,
    minY: 0,
    maxX: 19, // Will be updated when map loads
    maxY: 19, // Will be updated when map loads
  };
  private inputController: InputController | null = null;
  // Store units and their sprites for future reference
  private units: UnitData[] = [];
  // Track unit selection state
  private selectionState: UnitSelectionState = createUnitSelectionState();
  // Track whether menu is currently active
  private isMenuActive = false;
  // Track movement state
  private movementState: MovementState = createMovementState();
  // Track attack state
  private attackState: AttackState = createAttackState();
  // Track tile highlights for movement range
  private tileHighlights: TileHighlightMap = createTileHighlightMap();
  // Track if unit is currently moving
  private isUnitMoving = false;

  constructor() {
    super("Game");
  }

  create() {
    // Load the AI-generated map
    this.mapBounds = loadGeneratedMap(this, MAP_KEYS.GENERATED_MAP_1);
    this.setupCamera();

    // Unit positions
    const ACOLYTE_01_POS = { x: 2, y: 2 };
    const ACOLYTE_06_POS = { x: 5, y: 5 };

    // Create and spawn units using the new Unit system
    const acolyte01 = createPredefinedUnit("ACOLYTE_01", "unit_001", {
      tileX: ACOLYTE_01_POS.x,
      tileY: ACOLYTE_01_POS.y,
    });
    const acolyte06 = createPredefinedUnit("ACOLYTE_06", "unit_002", {
      tileX: ACOLYTE_06_POS.x,
      tileY: ACOLYTE_06_POS.y,
    });

    // Spawn the units and store their data
    const unit1Data = spawnUnitFromData(this, acolyte01);
    const unit2Data = spawnUnitFromData(this, acolyte06);

    this.units.push(unit1Data, unit2Data);

    // Create cursor visual after the map is loaded
    this.setupCursor();
    this.setupInput();
    this.scene.launch("UI");

    // Listen for menu action selected from UI scene
    this.events.on("menu-action-selected", (actionName: string) => {
      this.handleMenuActionSelected(actionName);
    });

    // Emit initial hover event for cursor position
    this.emitUnitHoverEvent();
  }

  private setupCamera() {
    // Get the map data to calculate camera bounds
    const mapData = this.cache.json.get(MAP_KEYS.GENERATED_MAP_1);
    const cameraBounds = getMapCameraBounds(mapData);

    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, cameraBounds.width, cameraBounds.height);
    this.cameras.main.centerOn(0, 0);
  }

  private setupCursor() {
    // Create cursor visual - render above tiles but below UI
    this.cursorVisual = createCursorVisual(this, this.cursor);
    this.cursorVisual.setDepth(10); // Above tiles, below UI
  }

  private setupInput() {
    // Create InputController with default repeat settings
    this.inputController = new InputController(this);

    // Subscribe to movement events
    this.inputController
      .on("move:up", () => this.handleMoveUp())
      .on("move:down", () => this.handleMoveDown())
      .on("move:left", () => this.handleMoveLeft())
      .on("move:right", () => this.handleMoveRight())
      .on("confirm", () => this.handleConfirm())
      .on("cancel", () => this.handleCancel());
  }

  private handleMoveUp() {
    if (this.isMenuActive) {
      this.events.emit("menu-navigate-up");
    } else {
      this.moveCursor(Direction.UP);
    }
  }

  private handleMoveDown() {
    if (this.isMenuActive) {
      this.events.emit("menu-navigate-down");
    } else {
      this.moveCursor(Direction.DOWN);
    }
  }

  private handleMoveLeft() {
    if (!this.isMenuActive) {
      this.moveCursor(Direction.LEFT);
    }
    // Left/right do nothing in menu navigation
  }

  private handleMoveRight() {
    if (!this.isMenuActive) {
      this.moveCursor(Direction.RIGHT);
    }
    // Left/right do nothing in menu navigation
  }

  private moveCursor(direction: DirectionType) {
    if (!this.cursorVisual) return;
    if (this.isUnitMoving) return; // Don't move cursor while unit is moving

    this.cursor = moveCursorWithBounds(this.cursor, direction, this.mapBounds);
    updateCursorVisual(this.cursorVisual, this.cursor);

    // Emit hover event for unit at cursor position
    this.emitUnitHoverEvent();
  }

  /**
   * Emit hover event for unit at current cursor position
   */
  private emitUnitHoverEvent(): void {
    const unitAtCursor = findUnitAtCursor(this.units, this.cursor);
    this.events.emit("unit-hover", unitAtCursor ? unitAtCursor.unit : null);
  }

  update(_time: number, delta: number) {
    // Update InputController to handle key repeat
    this.inputController?.update(delta);
  }

  /**
   * Handle confirm input - select unit, navigate menu, or perform action
   */
  private handleConfirm(): void {
    if (this.isUnitMoving) {
      // Unit is moving - ignore input
      return;
    }

    if (isAttackActive(this.attackState)) {
      // Attack mode is active - try to attack target at cursor position
      this.handleAttackConfirm();
    } else if (isMovementActive(this.movementState)) {
      // Movement mode is active - try to move unit to cursor position
      this.handleMovementConfirm();
    } else if (this.isMenuActive) {
      // Menu is active - emit confirm event to UI scene
      this.events.emit("menu-confirm");
    } else if (hasSelectedUnit(this.selectionState)) {
      console.log("Unit already selected");
    } else {
      // No unit selected - try to select unit at cursor
      const unitAtCursor = findUnitAtCursor(this.units, this.cursor);
      if (unitAtCursor) {
        this.selectUnitAtCursor(unitAtCursor);
        this.activateMenuNavigation();
      }
    }
  }

  /**
   * Handle cancel input - deselect unit, close menu, or go back to map
   */
  private handleCancel(): void {
    if (this.isUnitMoving) {
      // Unit is moving - ignore input
      return;
    }

    if (isAttackActive(this.attackState)) {
      // Attack mode is active - exit attack mode
      this.exitAttackModeAndDeselectUnit();
    } else if (isMovementActive(this.movementState)) {
      // Movement mode is active - exit movement mode
      this.exitMovementModeAndDeselectUnit();
    } else if (this.isMenuActive) {
      // Menu is active - deactivate menu but keep unit selected
      this.deactivateMenuNavigation();
    } else if (hasSelectedUnit(this.selectionState)) {
      // Unit is selected but menu not active - deselect unit completely
      this.deselectCurrentUnit();
    }
    // If no unit selected, do nothing
  }

  /**
   * Select a unit and show action menu (but don't activate navigation yet)
   */
  private selectUnitAtCursor(unitData: UnitData): void {
    this.selectionState = selectUnit(this.selectionState, unitData);

    // Add highlight effect
    addHighlightEffect(unitData.sprite);

    // Emit event to UI scene to show action menu
    this.events.emit("unit-selected", unitData.unit);
  }

  /**
   * Activate menu navigation and show visual indicators
   */
  private activateMenuNavigation(): void {
    this.isMenuActive = true;
    this.events.emit("menu-activate");
  }

  /**
   * Deactivate menu navigation but keep menu visible
   */
  private deactivateMenuNavigation(): void {
    this.isMenuActive = false;
    this.events.emit("menu-deactivate");
  }

  /**
   * Handle menu action selected from UI scene
   */
  private handleMenuActionSelected(actionName: string): void {
    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    console.log(
      `Action "${actionName}" selected for unit ${selectedUnit.unit.id}`
    );

    // Close the menu
    this.events.emit("unit-deselected");
    this.isMenuActive = false;

    // Handle action based on name
    if (actionName === "Move") {
      this.enterMovementModeForSelectedUnit();
    } else if (actionName === "Attack") {
      this.enterAttackModeForSelectedUnit();
    } else {
      // Other actions - for now, just deselect
      this.deselectCurrentUnit();
    }
  }

  /**
   * Deselect current unit and hide menu
   */
  private deselectCurrentUnit(): void {
    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    // Remove highlight effect
    removeHighlightEffect(selectedUnit.sprite);

    // Emit event to UI scene to hide menu
    this.events.emit("unit-deselected");

    // Reset menu active state
    this.isMenuActive = false;

    // Update selection state
    this.selectionState = deselectUnit(this.selectionState);
  }

  /**
   * Enter movement mode for the currently selected unit
   */
  private enterMovementModeForSelectedUnit(): void {
    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    // Enter movement mode
    this.movementState = enterMovementMode(
      this.movementState,
      selectedUnit.unit,
      this.mapBounds,
      5 // movement range
    );

    // Highlight all reachable tiles
    this.movementState.reachableTiles.forEach((tile) => {
      addMovementHighlight(this, this.tileHighlights, tile.tileX, tile.tileY);
    });
  }

  /**
   * Exit movement mode and deselect unit
   */
  private exitMovementModeAndDeselectUnit(): void {
    // Clear movement highlights
    clearAllHighlights(this.tileHighlights);

    // Exit movement mode
    this.movementState = exitMovementMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  /**
   * Handle confirm during movement mode - move unit to cursor position
   */
  private handleMovementConfirm(): void {
    // Check if cursor is on a reachable tile
    if (!isTileReachable(this.movementState, this.cursor)) {
      return;
    }

    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    // Generate path to destination
    const path = generateMovementPath(
      selectedUnit.unit.position.tileX,
      selectedUnit.unit.position.tileY,
      this.cursor.tileX,
      this.cursor.tileY
    );

    // Start unit movement animation
    this.animateUnitMovement(selectedUnit, path);
  }

  /**
   * Animate unit movement along a path
   */
  private animateUnitMovement(
    unitData: UnitData,
    path: Array<{ tileX: number; tileY: number }>
  ): void {
    if (path.length === 0) {
      this.onUnitMovementComplete();
      return;
    }

    this.isUnitMoving = true;

    // Move one step at a time
    this.moveUnitOneStep(unitData, path, 0);
  }

  /**
   * Move unit one step along the path
   */
  private moveUnitOneStep(
    unitData: UnitData,
    path: Array<{ tileX: number; tileY: number }>,
    stepIndex: number
  ): void {
    if (stepIndex >= path.length) {
      this.onUnitMovementComplete();
      return;
    }

    const nextTile = path[stepIndex];
    const currentTile = unitData.unit.position;

    // Determine facing direction
    let facing: "front" | "left" | "right" | "back" = "front";
    if (nextTile.tileX > currentTile.tileX) {
      facing = "right";
    } else if (nextTile.tileX < currentTile.tileX) {
      facing = "left";
    } else if (nextTile.tileY > currentTile.tileY) {
      facing = "front";
    } else if (nextTile.tileY < currentTile.tileY) {
      facing = "back";
    }

    // Update unit data
    unitData.unit = setUnitFacing(unitData.unit, facing);
    unitData.unit = setUnitAnimationState(unitData.unit, "move");
    unitData.unit = moveUnit(unitData.unit, nextTile.tileX, nextTile.tileY);
    playUnitAnimation(unitData.sprite, unitData.unit);

    // Animate sprite to new position
    const { x, y } = getTileCenter(nextTile.tileX, nextTile.tileY);
    this.tweens.add({
      targets: unitData.sprite,
      x,
      y,
      duration: 200, // 200ms per tile
      ease: "Linear",
      onComplete: () => {
        // Move to next step
        this.moveUnitOneStep(unitData, path, stepIndex + 1);
      },
    });
  }

  /**
   * Called when unit movement is complete
   */
  private onUnitMovementComplete(): void {
    this.isUnitMoving = false;

    const selectedUnit = getSelectedUnit(this.selectionState);
    if (selectedUnit) {
      // Set unit back to idle
      selectedUnit.unit = setUnitAnimationState(selectedUnit.unit, "idle");
      playUnitAnimation(selectedUnit.sprite, selectedUnit.unit);
    }

    // Clear movement highlights and exit movement mode
    clearAllHighlights(this.tileHighlights);
    this.movementState = exitMovementMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  /**
   * Enter attack mode for the currently selected unit
   */
  private enterAttackModeForSelectedUnit(): void {
    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    // Enter attack mode with range 1 (basic attack)
    this.attackState = enterAttackMode(
      this.attackState,
      selectedUnit.unit,
      this.mapBounds,
      1 // attack range
    );

    // Highlight all attackable tiles in red
    this.attackState.attackableTiles.forEach((tile) => {
      addAttackHighlight(this, this.tileHighlights, tile.tileX, tile.tileY);
    });
  }

  /**
   * Exit attack mode and deselect unit
   */
  private exitAttackModeAndDeselectUnit(): void {
    // Clear attack highlights
    clearAllHighlights(this.tileHighlights);

    // Exit attack mode
    this.attackState = exitAttackMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  /**
   * Handle confirm during attack mode - attack target at cursor position
   */
  private handleAttackConfirm(): void {
    // Check if cursor is on an attackable tile
    if (!isTileAttackable(this.attackState, this.cursor)) {
      return;
    }

    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    // Check if there is a unit at the cursor position
    const targetUnit = findUnitAtCursor(this.units, this.cursor);
    if (!targetUnit) {
      // No unit at target position - do nothing
      return;
    }

    // Calculate damage
    const damage = calculateDamage(selectedUnit.unit, targetUnit.unit);

    // Apply damage to target
    targetUnit.unit = applyDamage(targetUnit.unit, damage);

    console.log(
      `${selectedUnit.unit.name} attacked ${targetUnit.unit.name} for ${damage} damage. HP: ${targetUnit.unit.stats.hp}/${targetUnit.unit.stats.maxHp}`
    );

    // Clear attack highlights and exit attack mode
    clearAllHighlights(this.tileHighlights);
    this.attackState = exitAttackMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  shutdown() {
    // Clean up movement highlights
    clearAllHighlights(this.tileHighlights);

    // Clean up selection state
    if (hasSelectedUnit(this.selectionState)) {
      this.deselectCurrentUnit();
    }

    // Clean up event listeners
    this.events.off("menu-action-selected");

    // Clean up InputController
    this.inputController?.destroy();
    this.inputController = null;
  }
}
