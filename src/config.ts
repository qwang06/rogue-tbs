import Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { MenuScene } from "./scenes/MenuScene";
import { GameScene } from "./scenes/GameScene";
import { UIScene } from "./scenes/UIScene";

export const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: "#222",
  parent: "game-container",
  scene: [BootScene, PreloadScene, MenuScene, GameScene, UIScene],
  render: {
    pixelArt: false, // Disable global pixel art mode
    antialias: true, // Enable antialiasing for smoother fonts
    roundPixels: true, // Round pixel positions to avoid sub-pixel rendering
  },
};
