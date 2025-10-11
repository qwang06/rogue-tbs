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
  createActionMenu,
  destroyActionMenu,
  updateMenuSelection,
  getActionAtIndex,
  type ActionMenuResult,
} from "../systems/actionMenuSystem";
import {
  createMenuNavigationState,
  activateMenuNavigation,
  deactivateMenuNavigation,
  moveMenuCursorUp,
  moveMenuCursorDown,
  getCurrentMenuIndex,
  isMenuNavigationActive,
  type MenuNavigationState,
} from "../systems/menuNavigationSystem";
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
  private actionMenu: ActionMenuResult | null = null;
  // Track menu navigation state
  private menuNavigationState: MenuNavigationState =
    createMenuNavigationState(2); // 2 actions: Move, Attack

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
    if (isMenuNavigationActive(this.menuNavigationState)) {
      this.menuNavigationState = moveMenuCursorUp(this.menuNavigationState);
      this.updateMenuVisuals();
    } else {
      this.moveCursor(Direction.UP);
    }
  }

  private handleMoveDown() {
    if (isMenuNavigationActive(this.menuNavigationState)) {
      this.menuNavigationState = moveMenuCursorDown(this.menuNavigationState);
      this.updateMenuVisuals();
    } else {
      this.moveCursor(Direction.DOWN);
    }
  }

  private handleMoveLeft() {
    if (!isMenuNavigationActive(this.menuNavigationState)) {
      this.moveCursor(Direction.LEFT);
    }
    // Left/right do nothing in menu navigation
  }

  private handleMoveRight() {
    if (!isMenuNavigationActive(this.menuNavigationState)) {
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
    if (isMenuNavigationActive(this.menuNavigationState)) {
      // Menu is active - execute the selected action
      this.executeSelectedAction();
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
    if (isMenuNavigationActive(this.menuNavigationState)) {
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

    // Show action menu but don't activate navigation yet
    this.actionMenu = createActionMenu(this, unitData.unit);

    console.log(`Selected unit: ${unitData.unit.name} (${unitData.unit.id})`);
  }

  /**
   * Activate menu navigation and show visual indicators
   */
  private activateMenuNavigation(): void {
    if (!this.actionMenu) return;

    this.menuNavigationState = activateMenuNavigation(this.menuNavigationState);
    this.updateMenuVisuals();

    console.log("Menu navigation activated");
  }

  /**
   * Deactivate menu navigation but keep menu visible
   */
  private deactivateMenuNavigation(): void {
    this.menuNavigationState = deactivateMenuNavigation(
      this.menuNavigationState
    );
    this.updateMenuVisuals();

    console.log("Menu navigation deactivated");
  }

  /**
   * Update menu visual state based on current navigation
   */
  private updateMenuVisuals(): void {
    if (!this.actionMenu) return;

    const selectedIndex = isMenuNavigationActive(this.menuNavigationState)
      ? getCurrentMenuIndex(this.menuNavigationState)
      : -1; // -1 means no selection visible

    updateMenuSelection(this.actionMenu, selectedIndex);
  }

  /**
   * Execute the currently selected menu action
   */
  private executeSelectedAction(): void {
    if (!this.actionMenu) return;

    const selectedUnit = getSelectedUnit(this.selectionState);
    if (!selectedUnit) return;

    const actionIndex = getCurrentMenuIndex(this.menuNavigationState);
    const actionName = getActionAtIndex(this.actionMenu, actionIndex);

    console.log(`${selectedUnit.unit.name} - ${actionName} action selected`);

    // After executing action, deselect unit and hide menu
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

    // Hide action menu
    if (this.actionMenu) {
      destroyActionMenu(this.actionMenu.container);
      this.actionMenu = null;
    }

    // Reset navigation state
    this.menuNavigationState = deactivateMenuNavigation(
      this.menuNavigationState
    );

    // Update selection state
    this.selectionState = deselectUnit(this.selectionState);

    console.log(`Deselected unit: ${selectedUnit.unit.name}`);
  }

  shutdown() {
    // Clean up selection state
    if (hasSelectedUnit(this.selectionState)) {
      this.deselectCurrentUnit();
    }

    // Clean up InputController
    this.inputController?.destroy();
    this.inputController = null;
  }
}
