import Phaser from "phaser";

export class UIScene extends Phaser.Scene {
  constructor() {
    super("UI");
  }
  create() {
    this.add
      .text(400, 300, "Hello, World!", {
        font: "32px Arial",
        color: "#fff",
      })
      .setOrigin(0.5);
  }
}
