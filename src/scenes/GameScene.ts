import Phaser from "phaser";

export class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");
  }
  create() {
    this.scene.launch("UI");
  }
}
