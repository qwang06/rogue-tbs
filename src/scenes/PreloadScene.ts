import Phaser from "phaser";

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super("Preload");
  }
  preload() {
    // Bitmap font (arcade)
    this.load.bitmapFont(
      "arcade",
      "assets/fonts/arcade.png",
      "assets/fonts/arcade.xml"
    );
    // TTF webfont (VT323)
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );
  }
  create() {
    // Load VT323 webfont using WebFont Loader
    // @ts-ignore
    if ((window as any).WebFont) {
      // @ts-ignore
      (window as any).WebFont.load({
        custom: {
          families: ["VT323"],
          urls: ["assets/fonts/VT323-Regular.ttf"],
        },
        active: () => {
          this.scene.start("Menu");
        },
        inactive: () => {
          this.scene.start("Menu");
        },
      });
    } else {
      this.scene.start("Menu");
    }
  }
}
