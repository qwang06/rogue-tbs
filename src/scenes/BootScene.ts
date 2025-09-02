import Phaser from "phaser";

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }
  preload() {
    // Preload assets needed for PreloadScene
  }
  create() {
    this.scene.start("Preload");
  }
}
