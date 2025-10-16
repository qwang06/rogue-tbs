import Phaser from "phaser";
import {
  spawnUnitFromData,
  createPredefinedUnit,
} from "../entities/unitFactory";
import { createCursor } from "../components/Cursor";
import { createCursorVisual } from "../entities/cursorFactory";
import type { MapBounds } from "../systems/cursorSystem";
import {
  findUnitAtCursor,
  type UnitData,
} from "../systems/unitSelectionSystem";
import {
  addHighlightEffect,
  removeHighlightEffect,
} from "../systems/unitHighlightSystem";
import {
  addMovementHighlight,
  addAttackHighlight,
} from "../systems/tileHighlightSystem";
import {
  isTileReachable,
  generateMovementPath,
} from "../systems/movementSystem";
import {
  isTileAttackable,
  calculateDamage,
  applyDamage,
} from "../systems/attackSystem";
import { loadGeneratedMap, getMapCameraBounds } from "../util/mapLoader";
import { MAP_KEYS } from "../assets/keys";
import { GameStateManager } from "./managers/GameStateManager";
import { UnitAnimationController } from "./managers/UnitAnimationController";
import {
  GameInputHandler,
  type InputHandlerCallbacks,
} from "./managers/GameInputHandler";
import { GameEventEmitter } from "./managers/GameEventEmitter";

export class GameScene extends Phaser.Scene {
  private cursor = createCursor(0, 0); // Start at top-left tile
  private cursorVisual: Phaser.GameObjects.Sprite | null = null;
  private mapBounds: MapBounds = {
    minX: 0,
    minY: 0,
    maxX: 19, // Will be updated when map loads
    maxY: 19, // Will be updated when map loads
  };

  // Managers
  private stateManager!: GameStateManager;
  private animationController!: UnitAnimationController;
  private inputHandler!: GameInputHandler;
  private eventEmitter!: GameEventEmitter;

  constructor() {
    super("Game");
  }

  create() {
    // Initialize managers
    this.stateManager = new GameStateManager();
    this.animationController = new UnitAnimationController(this);
    this.eventEmitter = new GameEventEmitter(this.events);

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

    this.stateManager.addUnit(unit1Data);
    this.stateManager.addUnit(unit2Data);

    // Create cursor visual after the map is loaded
    this.setupCursor();
    this.setupInput();
    this.scene.launch("UI");

    // Listen for menu action selected from UI scene
    this.eventEmitter.onMenuActionSelected((actionName: string) => {
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
    const callbacks: InputHandlerCallbacks = {
      onMenuNavigateUp: () => this.eventEmitter.emitMenuNavigateUp(),
      onMenuNavigateDown: () => this.eventEmitter.emitMenuNavigateDown(),
      onCursorMove: () => this.emitUnitHoverEvent(),
      onConfirm: () => this.handleConfirm(),
      onCancel: () => this.handleCancel(),
    };

    this.inputHandler = new GameInputHandler(
      this,
      this.cursor,
      this.cursorVisual!,
      this.mapBounds,
      () => this.stateManager.isMenuCurrentlyActive(),
      () => this.stateManager.isUnitCurrentlyMoving(),
      callbacks
    );
  }

  /**
   * Emit hover event for unit at current cursor position
   */
  private emitUnitHoverEvent(): void {
    this.cursor = this.inputHandler.getCursor();
    const unitAtCursor = findUnitAtCursor(
      this.stateManager.getUnits(),
      this.cursor
    );
    this.eventEmitter.emitUnitHover(unitAtCursor ? unitAtCursor.unit : null);
  }

  update(_time: number, delta: number) {
    // Update InputController to handle key repeat
    this.inputHandler.update(delta);
  }

  /**
   * Handle confirm input - select unit, navigate menu, or perform action
   */
  private handleConfirm(): void {
    if (this.stateManager.isUnitCurrentlyMoving()) {
      // Unit is moving - ignore input
      return;
    }

    if (this.stateManager.isInAttackMode()) {
      // Attack mode is active - try to attack target at cursor position
      this.handleAttackConfirm();
    } else if (this.stateManager.isInMovementMode()) {
      // Movement mode is active - try to move unit to cursor position
      this.handleMovementConfirm();
    } else if (this.stateManager.isMenuCurrentlyActive()) {
      // Menu is active - emit confirm event to UI scene
      this.eventEmitter.emitMenuConfirm();
    } else if (this.stateManager.hasSelectedUnit()) {
      console.log("Unit already selected");
    } else {
      // No unit selected - try to select unit at cursor
      this.cursor = this.inputHandler.getCursor();
      const unitAtCursor = findUnitAtCursor(
        this.stateManager.getUnits(),
        this.cursor
      );
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
    if (this.stateManager.isUnitCurrentlyMoving()) {
      // Unit is moving - ignore input
      return;
    }

    if (this.stateManager.isInAttackMode()) {
      // Attack mode is active - exit attack mode
      this.exitAttackModeAndDeselectUnit();
    } else if (this.stateManager.isInMovementMode()) {
      // Movement mode is active - exit movement mode
      this.exitMovementModeAndDeselectUnit();
    } else if (this.stateManager.isMenuCurrentlyActive()) {
      // Menu is active - deactivate menu but keep unit selected
      this.deactivateMenuNavigation();
    } else if (this.stateManager.hasSelectedUnit()) {
      // Unit is selected but menu not active - deselect unit completely
      this.deselectCurrentUnit();
    }
    // If no unit selected, do nothing
  }

  /**
   * Select a unit and show action menu (but don't activate navigation yet)
   */
  private selectUnitAtCursor(unitData: UnitData): void {
    this.stateManager.selectUnit(unitData);

    // Add highlight effect
    addHighlightEffect(unitData.sprite);

    // Emit event to UI scene to show action menu
    this.eventEmitter.emitUnitSelected(unitData.unit);
  }

  /**
   * Activate menu navigation and show visual indicators
   */
  private activateMenuNavigation(): void {
    this.stateManager.activateMenu();
    this.eventEmitter.emitMenuActivate();
  }

  /**
   * Deactivate menu navigation but keep menu visible
   */
  private deactivateMenuNavigation(): void {
    this.stateManager.deactivateMenu();
    this.eventEmitter.emitMenuDeactivate();
  }

  /**
   * Handle menu action selected from UI scene
   */
  private handleMenuActionSelected(actionName: string): void {
    const selectedUnit = this.stateManager.getSelectedUnit();
    if (!selectedUnit) return;

    console.log(
      `Action "${actionName}" selected for unit ${selectedUnit.unit.id}`
    );

    // Close the menu
    this.eventEmitter.emitUnitDeselected();
    this.stateManager.deactivateMenu();

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
    const selectedUnit = this.stateManager.getSelectedUnit();
    if (!selectedUnit) return;

    // Remove highlight effect
    removeHighlightEffect(selectedUnit.sprite);

    // Emit event to UI scene to hide menu
    this.eventEmitter.emitUnitDeselected();

    // Reset menu active state
    this.stateManager.deactivateMenu();

    // Update selection state
    this.stateManager.deselectUnit();
  }

  /**
   * Enter movement mode for the currently selected unit
   */
  private enterMovementModeForSelectedUnit(): void {
    const selectedUnit = this.stateManager.getSelectedUnit();
    if (!selectedUnit) return;

    // Enter movement mode
    this.stateManager.enterMovementMode(selectedUnit.unit, this.mapBounds, 5); // movement range

    // Highlight all reachable tiles
    const movementState = this.stateManager.getMovementState();
    const tileHighlights = this.stateManager.getTileHighlights();
    movementState.reachableTiles.forEach((tile) => {
      addMovementHighlight(this, tileHighlights, tile.tileX, tile.tileY);
    });
  }

  /**
   * Exit movement mode and deselect unit
   */
  private exitMovementModeAndDeselectUnit(): void {
    // Clear movement highlights
    this.stateManager.clearHighlights();

    // Exit movement mode
    this.stateManager.exitMovementMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  /**
   * Handle confirm during movement mode - move unit to cursor position
   */
  private handleMovementConfirm(): void {
    this.cursor = this.inputHandler.getCursor();

    // Check if cursor is on a reachable tile
    const movementState = this.stateManager.getMovementState();
    if (!isTileReachable(movementState, this.cursor)) {
      return;
    }

    const selectedUnit = this.stateManager.getSelectedUnit();
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
    this.stateManager.setUnitMoving(true);

    this.animationController.animateMovement(unitData, path, () => {
      this.onUnitMovementComplete();
    });
  }

  /**
   * Called when unit movement is complete
   */
  private onUnitMovementComplete(): void {
    this.stateManager.setUnitMoving(false);

    const selectedUnit = this.stateManager.getSelectedUnit();
    if (selectedUnit) {
      // Set unit back to idle
      this.animationController.setUnitIdle(selectedUnit);
    }

    // Clear movement highlights and exit movement mode
    this.stateManager.clearHighlights();
    this.stateManager.exitMovementMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  /**
   * Enter attack mode for the currently selected unit
   */
  private enterAttackModeForSelectedUnit(): void {
    const selectedUnit = this.stateManager.getSelectedUnit();
    if (!selectedUnit) return;

    // Enter attack mode with range 1 (basic attack)
    this.stateManager.enterAttackMode(selectedUnit.unit, this.mapBounds, 1); // attack range

    // Highlight all attackable tiles in red
    const attackState = this.stateManager.getAttackState();
    const tileHighlights = this.stateManager.getTileHighlights();
    attackState.attackableTiles.forEach((tile) => {
      addAttackHighlight(this, tileHighlights, tile.tileX, tile.tileY);
    });
  }

  /**
   * Exit attack mode and deselect unit
   */
  private exitAttackModeAndDeselectUnit(): void {
    // Clear attack highlights
    this.stateManager.clearHighlights();

    // Exit attack mode
    this.stateManager.exitAttackMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  /**
   * Handle confirm during attack mode - attack target at cursor position
   */
  private handleAttackConfirm(): void {
    this.cursor = this.inputHandler.getCursor();

    // Check if cursor is on an attackable tile
    const attackState = this.stateManager.getAttackState();
    if (!isTileAttackable(attackState, this.cursor)) {
      return;
    }

    const selectedUnit = this.stateManager.getSelectedUnit();
    if (!selectedUnit) return;

    // Check if there is a unit at the cursor position
    const targetUnit = findUnitAtCursor(
      this.stateManager.getUnits(),
      this.cursor
    );
    if (!targetUnit) {
      // No unit at target position - do nothing
      return;
    }

    // Update attacker's facing direction to face the target
    this.animationController.updateUnitFacing(
      selectedUnit,
      targetUnit.unit.position.tileX,
      targetUnit.unit.position.tileY
    );

    // Calculate damage
    const damage = calculateDamage(selectedUnit.unit, targetUnit.unit);

    // Apply damage to target
    const updatedUnit = applyDamage(targetUnit.unit, damage);
    this.stateManager.updateUnit(targetUnit.unit.id, updatedUnit);
    targetUnit.unit = updatedUnit;

    console.log(
      `${selectedUnit.unit.name} attacked ${targetUnit.unit.name} for ${damage} damage. HP: ${targetUnit.unit.stats.hp}/${targetUnit.unit.stats.maxHp}`
    );

    // Emit event to update UI with damaged unit
    this.eventEmitter.emitUnitDamaged(targetUnit.unit);

    // Play damage effect on target sprite
    this.animationController.playDamageEffect(targetUnit.sprite);

    // Clear attack highlights and exit attack mode
    this.stateManager.clearHighlights();
    this.stateManager.exitAttackMode();

    // Deselect unit
    this.deselectCurrentUnit();
  }

  shutdown() {
    // Clean up state
    this.stateManager.cleanup();

    // Clean up event listeners
    this.eventEmitter.cleanup();

    // Clean up InputController
    this.inputHandler.destroy();
  }
}
