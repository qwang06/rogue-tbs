import { ATLAS_KEYS, RPG_UI_FRAMES } from "../assets/keys";
import { TILE_SIZE } from "../util/tile";
import { Unit } from "../components/Unit";

/**
 * Action menu system - handles action menu UI creation and management
 */

export interface ActionMenuConfig {
  width: number;
  height: number;
  offsetX: number;
  buttonSpacing: number;
}

export const DEFAULT_ACTION_MENU_CONFIG: ActionMenuConfig = {
  width: 150,
  height: 200,
  offsetX: 40,
  buttonSpacing: 30,
};

const BUTTON_COLOR = "abcabc";

/**
 * Create action menu container with nineslice background and buttons
 */
export function createActionMenu(
  scene: Phaser.Scene,
  unit: Unit,
  config: ActionMenuConfig = DEFAULT_ACTION_MENU_CONFIG
): Phaser.GameObjects.Container {
  // Calculate menu position (to the right of the unit)
  const unitPixelPos = {
    x: unit.position.tileX * TILE_SIZE + TILE_SIZE / 2,
    y: unit.position.tileY * TILE_SIZE + TILE_SIZE / 2,
  };

  // Create menu container
  const actionMenu = scene.add.container(
    unitPixelPos.x + config.offsetX,
    unitPixelPos.y
  );
  actionMenu.setDepth(100); // Above everything else

  // Create nineslice background using rpg-ui patch-1 slice
  // According to rpg-ui.json, patch-1 has center bounds of 32x32 within a 96x96 frame
  const menuBg = scene.add.nineslice(
    0,
    0,
    ATLAS_KEYS.RPG_UI,
    RPG_UI_FRAMES.PATCH_1,
    config.width,
    config.height,
    32,
    32,
    32,
    32
  );
  menuBg.setOrigin(0, 0.5);
  actionMenu.add(menuBg);

  // Add action buttons
  // Align buttons to the top right, with a 40px margin in the top right
  const buttonX = config.width - 40;
  let currentY = -config.height / 2 + 40;

  const moveButton = scene.add
    .text(buttonX, currentY, "Move", {
      fontSize: "14px",
      color: BUTTON_COLOR,
    })
    .setOrigin(1, 0)
    .setInteractive();

  currentY += config.buttonSpacing;

  const attackButton = scene.add
    .text(buttonX, currentY, "Attack", {
      fontSize: "14px",
      color: BUTTON_COLOR,
    })
    .setOrigin(1, 0)
    .setInteractive();

  // Add button interactions
  moveButton.on("pointerdown", () => {
    console.log(`${unit.name} - Move action selected`);
  });

  attackButton.on("pointerdown", () => {
    console.log(`${unit.name} - Attack action selected`);
  });

  // Add hover effects
  addButtonHoverEffects(moveButton);
  addButtonHoverEffects(attackButton);

  actionMenu.add([moveButton, attackButton]);

  return actionMenu;
}

/**
 * Add hover effects to a button
 */
function addButtonHoverEffects(button: Phaser.GameObjects.Text): void {
  button.on("pointerover", () => {
    button.setColor("#ffffff");
  });
  button.on("pointerout", () => button.setColor(BUTTON_COLOR));
}

/**
 * Destroy action menu if it exists
 */
export function destroyActionMenu(
  actionMenu: Phaser.GameObjects.Container | null
): void {
  if (actionMenu) {
    actionMenu.destroy();
  }
}
