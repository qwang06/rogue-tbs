import { ATLAS_KEYS, RPG_UI_FRAMES } from "../assets/keys";
import { TILE_SIZE } from "../util/tile";
import { Unit } from "../components/Unit";

/**
 * Action menu system - handles action menu UI creation and management with keyboard navigation
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
const SELECTED_BUTTON_COLOR = "#ffffff";
const CURSOR_INDICATOR = ">";

export interface ActionMenuResult {
  container: Phaser.GameObjects.Container;
  actions: string[];
  buttons: Phaser.GameObjects.Text[];
  cursors: Phaser.GameObjects.Text[];
}

/**
 * Create action menu container with nineslice background and navigable buttons
 */
export function createActionMenu(
  scene: Phaser.Scene,
  unit: Unit,
  config: ActionMenuConfig = DEFAULT_ACTION_MENU_CONFIG
): ActionMenuResult {
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

  // Define menu actions
  const actions = ["Move", "Attack"];
  const buttons: Phaser.GameObjects.Text[] = [];
  const cursors: Phaser.GameObjects.Text[] = [];

  // Add action buttons and cursor indicators
  const buttonX = config.width - 40;
  const cursorGap = 8; // Space between cursor and button
  let currentY = -config.height / 2 + 40;

  actions.forEach((action) => {
    // Create cursor indicator
    const cursor = scene.add
      .text(0, currentY, CURSOR_INDICATOR, {
        fontSize: "14px",
        color: BUTTON_COLOR,
      })
      .setOrigin(1, 0);

    // Create action button (no longer interactive via mouse)
    const button = scene.add
      .text(buttonX, currentY, action, {
        fontSize: "14px",
        color: BUTTON_COLOR,
      })
      .setOrigin(1, 0);

    // Position cursor to the left of the button, accounting for cursor width
    cursor.x = buttonX - button.width - cursorGap;

    buttons.push(button);
    cursors.push(cursor);
    actionMenu.add([cursor, button]);

    currentY += config.buttonSpacing;
  });

  return {
    container: actionMenu,
    actions,
    buttons,
    cursors,
  };
}

/**
 * Update menu visual state based on current selection
 */
export function updateMenuSelection(
  menuResult: ActionMenuResult,
  selectedIndex: number
): void {
  menuResult.buttons.forEach((button, index) => {
    if (index === selectedIndex) {
      button.setColor(SELECTED_BUTTON_COLOR);
    } else {
      button.setColor(BUTTON_COLOR);
    }
  });

  menuResult.cursors.forEach((cursor, index) => {
    cursor.setVisible(index === selectedIndex);
  });
}

/**
 * Get the action name for the given index
 */
export function getActionAtIndex(
  menuResult: ActionMenuResult,
  index: number
): string {
  return menuResult.actions[index] || "";
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
