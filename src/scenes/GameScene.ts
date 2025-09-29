import Phaser from "phaser";
import { spawnUnitFromData, createPredefinedUnit } from "../entities/unitFactory";
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
import { loadGeneratedMap, getMapCameraBounds } from "../util/mapLoader";
import { MAP_KEYS, RPG_UI_FRAMES, ATLAS_KEYS } from "../assets/keys";
import { InputController } from "../input/InputController";
import { Unit } from "../components/Unit";
import { TILE_SIZE } from "../util/tile";

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
  private units: Array<{ unit: Unit; sprite: Phaser.GameObjects.Sprite }> = [];
  // Track selected unit and UI state
  private selectedUnit: { unit: Unit; sprite: Phaser.GameObjects.Sprite } | null = null;
  private actionMenu: Phaser.GameObjects.Container | null = null;

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
      tileY: ACOLYTE_01_POS.y 
    });
    const acolyte06 = createPredefinedUnit("ACOLYTE_06", "unit_002", { 
      tileX: ACOLYTE_06_POS.x, 
      tileY: ACOLYTE_06_POS.y 
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
      .on('move:up', () => this.moveCursor(Direction.UP))
      .on('move:down', () => this.moveCursor(Direction.DOWN))
      .on('move:left', () => this.moveCursor(Direction.LEFT))
      .on('move:right', () => this.moveCursor(Direction.RIGHT))
      .on('confirm', () => this.handleConfirm())
      .on('cancel', () => this.handleCancel());
  }

  private moveCursor(direction: DirectionType) {
    if (!this.cursorVisual) return;
    
    this.cursor = moveCursorWithBounds(
      this.cursor,
      direction,
      this.mapBounds
    );
    updateCursorVisual(this.cursorVisual, this.cursor);
  }

  update(_time: number, delta: number) {
    // Update InputController to handle key repeat
    this.inputController?.update(delta);
  }

  /**
   * Find a unit at the current cursor position
   */
  private getUnitAtCursor(): { unit: Unit; sprite: Phaser.GameObjects.Sprite } | null {
    return this.units.find(unitData => 
      unitData.unit.position.tileX === this.cursor.tileX &&
      unitData.unit.position.tileY === this.cursor.tileY
    ) || null;
  }

  /**
   * Handle confirm input - select unit or perform action
   */
  private handleConfirm(): void {
    if (this.selectedUnit) {
      // Unit already selected - this would handle menu interactions in the future
      return;
    }

    // Try to select unit at cursor
    const unitAtCursor = this.getUnitAtCursor();
    if (unitAtCursor) {
      this.selectUnit(unitAtCursor);
    }
  }

  /**
   * Handle cancel input - deselect unit and hide menu
   */
  private handleCancel(): void {
    if (this.selectedUnit) {
      this.deselectUnit();
    }
  }

  /**
   * Select a unit and show action menu
   */
  private selectUnit(unitData: { unit: Unit; sprite: Phaser.GameObjects.Sprite }): void {
    this.selectedUnit = unitData;
    
    // Add highlight effect
    this.addHighlightEffect(unitData.sprite);
    
    // Show action menu
    this.showActionMenu(unitData);
    
    console.log(`Selected unit: ${unitData.unit.name} (${unitData.unit.id})`);
  }

  /**
   * Deselect current unit and hide menu
   */
  private deselectUnit(): void {
    if (!this.selectedUnit) return;
    
    // Remove highlight effect
    this.removeHighlightEffect(this.selectedUnit.sprite);
    
    // Hide action menu
    this.hideActionMenu();
    
    console.log(`Deselected unit: ${this.selectedUnit.unit.name}`);
    this.selectedUnit = null;
  }

  /**
   * Add highlight effect to a unit sprite
   */
  private addHighlightEffect(sprite: Phaser.GameObjects.Sprite): void {
    // Add a simple tint effect for now
    sprite.setTint(0xffff99); // Light yellow highlight
  }

  /**
   * Remove highlight effect from a unit sprite
   */
  private removeHighlightEffect(sprite: Phaser.GameObjects.Sprite): void {
    sprite.clearTint();
  }

  /**
   * Show action menu for selected unit
   */
  private showActionMenu(unitData: { unit: Unit; sprite: Phaser.GameObjects.Sprite }): void {
    if (this.actionMenu) {
      this.hideActionMenu();
    }

    // Calculate menu position (to the right of the unit)
    const unitPixelPos = {
      x: unitData.unit.position.tileX * TILE_SIZE + TILE_SIZE / 2,
      y: unitData.unit.position.tileY * TILE_SIZE + TILE_SIZE / 2
    };

    // Create menu container
    this.actionMenu = this.add.container(unitPixelPos.x + 40, unitPixelPos.y);
    this.actionMenu.setDepth(100); // Above everything else

    // Create nineslice background using rpg-ui patch-1 slice
    // According to rpg-ui.json, patch-1 has center bounds of 32x32 within a 96x96 frame
    const menuBg = this.add.nineslice(0, 0, ATLAS_KEYS.RPG_UI, RPG_UI_FRAMES.PATCH_1, 120, 80, 32, 32, 32, 32);
    menuBg.setOrigin(0, 0.5);
    this.actionMenu.add(menuBg);

    // Add action buttons
    const moveButton = this.add.text(10, -20, 'Move', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0, 0.5).setInteractive();
    
    const attackButton = this.add.text(10, 10, 'Attack', {
      fontSize: '14px', 
      color: '#ffffff'
    }).setOrigin(0, 0.5).setInteractive();

    // Add button interactions
    moveButton.on('pointerdown', () => {
      console.log(`${unitData.unit.name} - Move action selected`);
    });

    attackButton.on('pointerdown', () => {
      console.log(`${unitData.unit.name} - Attack action selected`);
    });

    // Add hover effects
    moveButton.on('pointerover', () => moveButton.setTint(0xcccccc));
    moveButton.on('pointerout', () => moveButton.clearTint());
    attackButton.on('pointerover', () => attackButton.setTint(0xcccccc));
    attackButton.on('pointerout', () => attackButton.clearTint());

    this.actionMenu.add([moveButton, attackButton]);
  }

  /**
   * Hide action menu
   */
  private hideActionMenu(): void {
    if (this.actionMenu) {
      this.actionMenu.destroy();
      this.actionMenu = null;
    }
  }

  shutdown() {
    // Clean up selection state
    if (this.selectedUnit) {
      this.deselectUnit();
    }
    
    // Clean up InputController
    this.inputController?.destroy();
    this.inputController = null;
  }
}
