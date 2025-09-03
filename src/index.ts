import Phaser from "phaser";
import { config } from "./config";

window.addEventListener("DOMContentLoaded", () => {
  new Phaser.Game(config);
});
