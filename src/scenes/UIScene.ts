import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UI");
  }
  create() {
    // Use the arcade bitmap font for Hello, World!
    this.add.bitmapText(400, 300, "arcade", "Hello, World!", 32).setOrigin(0.5);
  }
}
