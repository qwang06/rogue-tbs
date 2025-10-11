import Phaser from "phaser";
import {
  spawnUnitFromData,
  createPredefinedUnit,
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
import { loadGeneratedMap, getMapCameraBounds } from "../util/mapLoader";
import { MAP_KEYS } from "../assets/keys";
import { InputController } from "../input/InputController";

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

    this.cursor = moveCursorWithBounds(this.cursor, direction, this.mapBounds);
    updateCursorVisual(this.cursorVisual, this.cursor);
  }

  update(_time: number, delta: number) {
    // Update InputController to handle key repeat
    this.inputController?.update(delta);
  }

  /**
   * Handle confirm input - select unit, navigate menu, or perform action
   */
  private handleConfirm(): void {
    if (this.isMenuActive) {
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
    if (this.isMenuActive) {
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
  private handleMenuActionSelected(_actionName: string): void {
    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    // TODO: Execute action based on _actionName
    // For now, just deselect the unit after action is selected
    console.log(
      `Action "${_actionName}" selected for unit ${selectedUnit.unit.id}`
    );

    // After executing action, deselect unit
    this.deselectCurrentUnit();
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

  shutdown() {
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
