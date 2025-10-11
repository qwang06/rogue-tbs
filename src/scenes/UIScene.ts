import Phaser from "phaser";
import {
  createActionMenu,
  destroyActionMenu,
  updateMenuSelection,
  getActionAtIndex,
  type ActionMenuResult,
} from "../systems/actionMenuSystem";
import {
  createMenuNavigationState,
  activateMenuNavigation,
  deactivateMenuNavigation,
  moveMenuCursorUp,
  moveMenuCursorDown,
  getCurrentMenuIndex,
  isMenuNavigationActive,
  type MenuNavigationState,
} from "../systems/menuNavigationSystem";
import { Unit } from "../components/Unit";

export class UIScene extends Phaser.Scene {
  private actionMenu: ActionMenuResult | null = null;
  private menuNavigationState: MenuNavigationState =
    createMenuNavigationState(2); // 2 actions: Move, Attack

  constructor() {
    super("UI");
  }

  create() {
    const gameScene = this.scene.get("Game");

    // Listen for unit selection events from GameScene
    gameScene.events.on("unit-selected", (unit: Unit) => {
      this.showActionMenuForUnit(unit);
    });

    gameScene.events.on("unit-deselected", () => {
      this.hideActionMenu();
    });

    // Listen for menu navigation events from GameScene
    gameScene.events.on("menu-navigate-up", () => {
      this.handleMenuNavigateUp();
    });

    gameScene.events.on("menu-navigate-down", () => {
      this.handleMenuNavigateDown();
    });

    gameScene.events.on("menu-activate", () => {
      this.activateMenu();
    });

    gameScene.events.on("menu-deactivate", () => {
      this.deactivateMenu();
    });

    gameScene.events.on("menu-confirm", () => {
      this.handleMenuConfirm();
    });
  }

  /**
   * Show action menu for the selected unit
   */
  private showActionMenuForUnit(unit: Unit): void {
    // Clean up existing menu if any
    if (this.actionMenu) {
      destroyActionMenu(this.actionMenu.container);
    }

    this.actionMenu = createActionMenu(this, unit);
  }

  /**
   * Hide and destroy the action menu
   */
  private hideActionMenu(): void {
    if (this.actionMenu) {
      destroyActionMenu(this.actionMenu.container);
      this.actionMenu = null;
    }

    // Reset navigation state
    this.menuNavigationState = deactivateMenuNavigation(
      this.menuNavigationState
    );
  }

  /**
   * Activate menu navigation and show visual indicators
   */
  private activateMenu(): void {
    if (!this.actionMenu) return;

    this.menuNavigationState = activateMenuNavigation(this.menuNavigationState);
    this.updateMenuVisuals();
  }

  /**
   * Deactivate menu navigation but keep menu visible
   */
  private deactivateMenu(): void {
    this.menuNavigationState = deactivateMenuNavigation(
      this.menuNavigationState
    );
    this.updateMenuVisuals();
  }

  /**
   * Handle menu cursor moving up
   */
  private handleMenuNavigateUp(): void {
    if (!isMenuNavigationActive(this.menuNavigationState)) return;

    this.menuNavigationState = moveMenuCursorUp(this.menuNavigationState);
    this.updateMenuVisuals();
  }

  /**
   * Handle menu cursor moving down
   */
  private handleMenuNavigateDown(): void {
    if (!isMenuNavigationActive(this.menuNavigationState)) return;

    this.menuNavigationState = moveMenuCursorDown(this.menuNavigationState);
    this.updateMenuVisuals();
  }

  /**
   * Handle menu confirm action
   */
  private handleMenuConfirm(): void {
    if (!this.actionMenu) return;
    if (!isMenuNavigationActive(this.menuNavigationState)) return;

    const actionIndex = getCurrentMenuIndex(this.menuNavigationState);
    const actionName = getActionAtIndex(this.actionMenu, actionIndex);

    // Emit event back to GameScene to execute the action
    const gameScene = this.scene.get("Game");
    gameScene.events.emit("menu-action-selected", actionName);
  }

  /**
   * Update menu visual state based on current navigation
   */
  private updateMenuVisuals(): void {
    if (!this.actionMenu) return;

    const selectedIndex = isMenuNavigationActive(this.menuNavigationState)
      ? getCurrentMenuIndex(this.menuNavigationState)
      : -1; // -1 means no selection visible

    updateMenuSelection(this.actionMenu, selectedIndex);
  }

  shutdown() {
    // Clean up menu
    this.hideActionMenu();

    // Remove event listeners
    const gameScene = this.scene.get("Game");
    gameScene.events.off("unit-selected");
    gameScene.events.off("unit-deselected");
    gameScene.events.off("menu-navigate-up");
    gameScene.events.off("menu-navigate-down");
    gameScene.events.off("menu-activate");
    gameScene.events.off("menu-deactivate");
    gameScene.events.off("menu-confirm");
  }
}
