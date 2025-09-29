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
  width: 140,   // Updated: was 120, now 120 + 20 = 140
  height: 120,  // Updated: was 80, now 80 + 40 = 120
  offsetX: 40,
  buttonSpacing: 30
};

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
    y: unit.position.tileY * TILE_SIZE + TILE_SIZE / 2
  };

  // Create menu container
  const actionMenu = scene.add.container(unitPixelPos.x + config.offsetX, unitPixelPos.y);
  actionMenu.setDepth(100); // Above everything else

  // Create nineslice background using rpg-ui patch-1 slice
  // According to rpg-ui.json, patch-1 has center bounds of 32x32 within a 96x96 frame
  const menuBg = scene.add.nineslice(
    0, 0, 
    ATLAS_KEYS.RPG_UI, 
    RPG_UI_FRAMES.PATCH_1, 
    config.width, 
    config.height, 
    32, 32, 32, 32
  );
  menuBg.setOrigin(0, 0.5);
  actionMenu.add(menuBg);

  // Add action buttons
  const moveButton = scene.add.text(10, -config.buttonSpacing/2, 'Move', {
    fontSize: '14px',
    color: '#ffffff'
  }).setOrigin(0, 0.5).setInteractive();
  
  const attackButton = scene.add.text(10, config.buttonSpacing/2, 'Attack', {
    fontSize: '14px', 
    color: '#ffffff'
  }).setOrigin(0, 0.5).setInteractive();

  // Add button interactions
  moveButton.on('pointerdown', () => {
    console.log(`${unit.name} - Move action selected`);
  });

  attackButton.on('pointerdown', () => {
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
  button.on('pointerover', () => button.setTint(0xcccccc));
  button.on('pointerout', () => button.clearTint());
}

/**
 * Destroy action menu if it exists
 */
export function destroyActionMenu(actionMenu: Phaser.GameObjects.Container | null): void {
  if (actionMenu) {
    actionMenu.destroy();
  }
}