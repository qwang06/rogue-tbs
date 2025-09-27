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

export class GameScene extends Phaser.Scene {
  private cursor = createCursor(0, 0); // Start at top-left tile
  private cursorVisual: Phaser.GameObjects.Sprite | null = null;
  private mapBounds: MapBounds = {
    minX: 0,
    minY: 0,
    maxX: 19, // Will be updated when map loads
    maxY: 19, // Will be updated when map loads
  };
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasdKeys: { [key: string]: Phaser.Input.Keyboard.Key } = {};

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
    // Setup arrow keys
    this.cursors = this.input.keyboard?.createCursorKeys() || null;

    // Setup WASD keys
    if (this.input.keyboard) {
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  update() {
    this.handleCursorInput();
  }

  private handleCursorInput() {
    if (!this.cursors || !this.cursorVisual) return;

    let direction: DirectionType | null = null;

    // Check arrow keys
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      direction = Direction.UP;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      direction = Direction.DOWN;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      direction = Direction.LEFT;
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      direction = Direction.RIGHT;
    }

    // Check WASD keys
    if (!direction && this.wasdKeys) {
      if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.W)) {
        direction = Direction.UP;
      } else if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.S)) {
        direction = Direction.DOWN;
      } else if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.A)) {
        direction = Direction.LEFT;
      } else if (Phaser.Input.Keyboard.JustDown(this.wasdKeys.D)) {
        direction = Direction.RIGHT;
      }
    }

    // Move cursor if direction was detected
    if (direction) {
      this.cursor = moveCursorWithBounds(
        this.cursor,
        direction,
        this.mapBounds
      );
      updateCursorVisual(this.cursorVisual, this.cursor);
    }
  }
}
