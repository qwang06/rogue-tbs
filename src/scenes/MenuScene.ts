import Phaser from "phaser";

export class MenuScene extends Phaser.Scene {
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
    
    // Listen for SPACE key and start GameScene when pressed
    this.input.keyboard?.once("keydown-SPACE", () => {
      this.scene.start("Game");
    });
  }
}
