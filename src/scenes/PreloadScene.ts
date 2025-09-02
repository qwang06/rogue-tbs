import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }
  preload() {
    // Preload assets for Menu/Game
  }
  create() {
    this.scene.start("Menu");
  }
}
