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
import { MAP_KEYS } from "../assets/keys";
import { InputController } from "../input/InputController";
import { Unit } from "../components/Unit";

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
      .on('move:right', () => this.moveCursor(Direction.RIGHT));
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

  shutdown() {
    // Clean up InputController
    this.inputController?.destroy();
    this.inputController = null;
  }
}
