import Phaser from "phaser";
import { InputController } from "../input/InputController";

export class MenuScene extends Phaser.Scene {
  private inputController: InputController | null = null;

  constructor() {
    super("Menu");
  }

  create() {
    const { width, height } = this.cameras.main;

    // Display title text
    this.add
      .text(width / 2, height / 2 - 60, "Rogue TBS", {
        font: "32px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Display instructions
    this.add
      .text(width / 2, height / 2 + 20, "Press SPACE to Start", {
        font: "20px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Setup InputController
    this.setupInput();
  }

  private setupInput() {
    // Create InputController
    this.inputController = new InputController(this);

    // Listen for confirm event to start the game
    this.inputController.on("confirm", () => {
      this.scene.start("Game");
    });
  }

  update(_time: number, delta: number) {
    // Update InputController
    this.inputController?.update(delta);
  }

  shutdown() {
    // Clean up InputController
    this.inputController?.destroy();
    this.inputController = null;
  }
}
