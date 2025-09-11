import Phaser from "phaser";
import { spawnUnit } from "../entities/unitFactory";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  create() {
    const map = this.createTilemap();
    if (map) {
      this.setupCamera(map);
      
      // Sprite positions
      const ARCHER_TILE_POS = { x: 2, y: 2 };
      const CLOUD_TILE_POS = { x: 5, y: 5 };

      // Spawn units using the helper function
      spawnUnit(this, "archer", "idle-0", ARCHER_TILE_POS.x, ARCHER_TILE_POS.y);
      spawnUnit(this, "ff7-cloud", "idle-0", CLOUD_TILE_POS.x, CLOUD_TILE_POS.y);
    }
    this.scene.launch("UI");
  }

  private createTilemap(): Phaser.Tilemaps.Tilemap | null {
    const map = this.make.tilemap({ key: "fe7-map" });
    const tileset = map.addTilesetImage("FE7-variant", "fe7-tiles");
    if (!tileset) {
      return null;
    }
    map.createLayer("Ground", tileset, 0, 0);
    if (map.getLayer("Terrain")) {
      map.createLayer("Terrain", tileset, 0, 0);
    }
    return map;
  }

  private setupCamera(map: Phaser.Tilemaps.Tilemap) {
    this.cameras.main.setZoom(2);
    this.cameras.main.roundPixels = true;
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.centerOn(0, 0);
  }
}
