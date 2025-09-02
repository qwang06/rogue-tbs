import Phaser from "phaser";
import { getTileCenter } from "../util/tile";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  create() {
    const map = this.createTilemap();
    if (map) {
      this.setupCamera(map);
      // Add archer sprite at tile (2,2)
      // Sprite positions
      const ARCHER_TILE_POS = { x: 2, y: 2 };
      const CLOUD_TILE_POS = { x: 5, y: 5 };

      const archerPos = getTileCenter(ARCHER_TILE_POS.x, ARCHER_TILE_POS.y);
      const cloudPos = getTileCenter(CLOUD_TILE_POS.x, CLOUD_TILE_POS.y);

      const archer = this.add.sprite(
        archerPos.x,
        archerPos.y,
        "archer",
        "idle-0"
      );
      archer.setOrigin(0.5, 0.5);

      const cloud = this.add.sprite(
        cloudPos.x,
        cloudPos.y,
        "ff7-cloud",
        "idle-0"
      );
      cloud.setOrigin(0.5, 0.5);
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
