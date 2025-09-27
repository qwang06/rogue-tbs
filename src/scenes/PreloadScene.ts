import { ATLAS_KEYS, FONT_KEYS, MAP_KEYS } from "../assets/keys";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }

  preload() {
    this.setupLoadingUI();
    this.loadGameAssets();
  }

  private setupLoadingUI() {
    const { width, height } = this.cameras.main;
    const barWidth = Math.floor(width * 0.6);
    const barHeight = 24;
    const barX = (width - barWidth) / 2;
    const barY = height / 2 - barHeight / 2;
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0xaa00aa, 0.8);
    progressBox.fillRect(barX, barY, barWidth, barHeight);
    const loadingText = this.add
      .text(width / 2, barY - 32, "Loading...", {
        font: "20px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    const percentText = this.add
      .text(width / 2, barY + barHeight / 2, "0%", {
        font: "18px Arial",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    this.load.on("progress", (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0xffffff, 1);
      progressBar.fillRect(
        barX + 2,
        barY + 2,
        (barWidth - 4) * value,
        barHeight - 4
      );
      percentText.setText(Math.floor(value * 100) + "%");
    });
    this.load.on("complete", () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
      percentText.destroy();
    });
  }

  private loadGameAssets() {
    // Load archer and ff7-cloud spritesheets (with JSON)
    this.load.atlas(
      ATLAS_KEYS.ARCHER,
      "assets/sprites/archer.png",
      "assets/sprites/archer.json"
    );
    this.load.atlas(
      ATLAS_KEYS.FF7_CLOUD,
      "assets/sprites/ff7-cloud.png",
      "assets/sprites/ff7-cloud.json"
    );

    // Load RPG spritesheets
    this.load.atlas(
      ATLAS_KEYS.RPG_OW,
      "assets/sprites/rpg-ow.png",
      "assets/sprites/rpg-ow.json"
    );
    this.load.atlas(
      ATLAS_KEYS.RPG_UI,
      "assets/sprites/rpg-ui.png",
      "assets/sprites/rpg-ui.json"
    );

    // Bitmap font (arcade)
    this.load.bitmapFont(
      FONT_KEYS.ARCADE,
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );

    // Load AI-generated map JSON
    this.load.json(MAP_KEYS.GENERATED_MAP_1, "assets/maps/map-1.json");
  }

  create() {
    // Create custom frames from slices for rpg-ow atlas
    this.createFramesFromSlices();

    this.scene.start("Menu");
  }

  private createFramesFromSlices() {
    // Get the rpg-ow texture
    const texture = this.textures.get(ATLAS_KEYS.RPG_OW);

    // Manually create frames from the RPG overworld atlas slices
    // This is needed because Phaser doesn't automatically create frames from slice data
    const slices = [
      { name: "grass-plain", x: 0, y: 0, w: 32, h: 32 },
      { name: "multiple-trees", x: 0, y: 32, w: 32, h: 32 },
      { name: "three-trees", x: 32, y: 32, w: 32, h: 32 },
      { name: "two-trees", x: 64, y: 32, w: 32, h: 32 },
      { name: "short-mountain", x: 96, y: 32, w: 32, h: 32 },
      { name: "tall-mountain", x: 128, y: 16, w: 32, h: 48 },
      { name: "two-tall-mountains", x: 160, y: 16, w: 32, h: 80 },
      { name: "short-and-tall-mountains", x: 192, y: 0, w: 32, h: 64 },
      { name: "short-with-two-tall-mountains", x: 224, y: 0, w: 32, h: 96 },
      { name: "multiple-trees-with-mountain", x: 256, y: 32, w: 32, h: 64 },
      { name: "three-trees-with-mountain", x: 288, y: 32, w: 32, h: 64 },
      { name: "two-trees-with-mountain", x: 320, y: 32, w: 32, h: 64 },
      { name: "pillar", x: 352, y: 32, w: 32, h: 64 },
      { name: "cursor-0", x: 896, y: 1984, w: 32, h: 32 },
      { name: "cursor-1", x: 928, y: 1984, w: 32, h: 32 },
    ];

    slices.forEach((slice) => {
      if (!texture.has(slice.name)) {
        texture.add(slice.name, 0, slice.x, slice.y, slice.w, slice.h);
      }
    });
  }
}
