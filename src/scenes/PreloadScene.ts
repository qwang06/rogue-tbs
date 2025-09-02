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
      "archer",
      "assets/sprites/archer.png",
      "assets/sprites/archer.json"
    );
    this.load.atlas(
      "ff7-cloud",
      "assets/sprites/ff7-cloud.png",
      "assets/sprites/ff7-cloud.json"
    );
    // Load tileset image for the map
    this.load.image("fe7-tiles", "assets/maps/FE7-variant.png");
    // Bitmap font (arcade)
    this.load.bitmapFont(
      "arcade",
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );

    // Load Tiled map (FE7-map.json)
    this.load.tilemapTiledJSON("fe7-map", "assets/maps/FE7-map.json");
  }

  create() {
    this.scene.start("Menu");
  }
}
