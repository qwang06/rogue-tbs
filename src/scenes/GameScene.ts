import Phaser from "phaser";
import { spawnUnit } from "../entities/unitFactory";
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

  constructor() {
    super("Game");
  }

  create() {
    // Load the AI-generated map
    this.mapBounds = loadGeneratedMap(this, MAP_KEYS.GENERATED_MAP_1);
    this.setupCamera();

    // Sprite positions
    const ARCHER_TILE_POS = { x: 2, y: 2 };
    const CLOUD_TILE_POS = { x: 5, y: 5 };

    // Spawn units using the helper function
    spawnUnit(this, "archer", "idle-0", ARCHER_TILE_POS.x, ARCHER_TILE_POS.y);
    spawnUnit(this, "ff7-cloud", "idle-0", CLOUD_TILE_POS.x, CLOUD_TILE_POS.y);

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
