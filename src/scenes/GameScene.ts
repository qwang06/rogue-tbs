import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  create() {
    const map = this.createTilemap();
    if (map) {
      this.setupCamera(map);
    }
    this.scene.launch("UI");
  }

  private createTilemap(): Phaser.Tilemaps.Tilemap | null {
    const map = this.make.tilemap({ key: "fe7-map" });
    const tileset = map.addTilesetImage("FE7-variant", "fe7-tiles");
    if (!tileset) {
      // eslint-disable-next-line no-console
      console.warn("Tileset FE7-variant not found!");
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
