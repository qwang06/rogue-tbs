import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  create() {
    const map = this.createTilemap();
    if (map) {
      this.setupCamera(map);
      // Add archer sprite at tile (2,2)
      const archer = this.add.sprite(
        2 * 16 + 8,
        2 * 16 + 8,
        "archer",
        "idle-1"
      );
      archer.setOrigin(0.5, 0.5);
      // Add ff7-cloud sprite at tile (5,5)
      const cloud = this.add.sprite(
        5 * 16 + 8,
        5 * 16 + 8,
        "ff7-cloud",
        "idle-1"
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
