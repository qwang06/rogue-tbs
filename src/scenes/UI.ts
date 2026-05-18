import Phaser from "phaser";
import {
  createActionMenu,
  destroyActionMenu,
  updateMenuSelection,
  getActionAtIndex,
  type ActionMenuResult,
} from "../systems/actionMenu";
import {
  createMenuNavigationState,
  activateMenuNavigation,
  deactivateMenuNavigation,
  moveMenuCursorUp,
  moveMenuCursorDown,
  getCurrentMenuIndex,
  isMenuNavigationActive,
  type MenuNavigationState,
} from "../systems/menuNavigation";
import {
  createUnitInfoPanel,
  updateUnitInfoPanel,
  showUnitInfoPanel,
  hideUnitInfoPanel,
  destroyUnitInfoPanel,
  type UnitInfoPanelResult,
} from "../systems/unitInfoPanel";
import { Unit } from "../components/Unit";

export class UIScene extends Phaser.Scene {
  private actionMenu: ActionMenuResult | null = null;
  private menuNavigationState: MenuNavigationState =
    createMenuNavigationState(2); // 2 actions: Move, Attack
  private unitInfoPanel: UnitInfoPanelResult | null = null;
  private hoveredUnit: Unit | null = null;
  private selectedUnit: Unit | null = null;

  constructor() {
    super("UI");
  }

  create() {
    const gameScene = this.scene.get("Game");

    // Listen for unit selection events from GameScene
    gameScene.events.on("unit-selected", (unit: Unit) => {
      this.showActionMenuForUnit(unit);
      this.handleUnitSelected(unit);
    });

    gameScene.events.on("unit-deselected", () => {
      this.hideActionMenu();
      this.handleUnitDeselected();
    });

    // Listen for unit hover events from GameScene
    gameScene.events.on("unit-hover", (unit: Unit | null) => {
      this.handleUnitHover(unit);
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

    // Listen for unit damage events from GameScene
    gameScene.events.on("unit-damaged", (unit: Unit) => {
      this.handleUnitDamaged(unit);
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

  /**
   * Handle unit taking damage - update info panel if it's being displayed
   */
  private handleUnitDamaged(unit: Unit): void {
    // If the damaged unit is currently hovered, update the info panel
    if (this.hoveredUnit && this.hoveredUnit.id === unit.id) {
      this.hoveredUnit = unit;
      if (this.unitInfoPanel) {
        updateUnitInfoPanel(this.unitInfoPanel, unit);
      }
    }

    // If the damaged unit is currently selected, update it as well
    if (this.selectedUnit && this.selectedUnit.id === unit.id) {
      this.selectedUnit = unit;
    }
  }

  /**
   * Handle unit hover event - show info panel if not already shown for selected unit
   */
  private handleUnitHover(unit: Unit | null): void {
    this.hoveredUnit = unit;
    this.updateUnitInfoPanelVisibility();
  }

  /**
   * Handle unit selected event - track selected unit for info panel
   */
  private handleUnitSelected(unit: Unit): void {
    this.selectedUnit = unit;
    this.updateUnitInfoPanelVisibility();
  }

  /**
   * Handle unit deselected event - clear selected unit for info panel
   */
  private handleUnitDeselected(): void {
    this.selectedUnit = null;
    this.updateUnitInfoPanelVisibility();
  }

  /**
   * Update unit info panel visibility based on hover and selection state
   * Panel should be visible when unit is hovered or selected
   */
  private updateUnitInfoPanelVisibility(): void {
    const displayUnit = this.selectedUnit || this.hoveredUnit;

    if (displayUnit) {
      if (this.unitInfoPanel) {
        // Panel exists, update it
        updateUnitInfoPanel(this.unitInfoPanel, displayUnit);
        showUnitInfoPanel(this.unitInfoPanel);
      } else {
        // Create new panel
        this.unitInfoPanel = createUnitInfoPanel(this, displayUnit);
      }
    } else {
      // No unit to display, hide panel
      if (this.unitInfoPanel) {
        hideUnitInfoPanel(this.unitInfoPanel);
      }
    }
  }

  shutdown() {
    // Clean up menu and unit info panel
    this.hideActionMenu();
    destroyUnitInfoPanel(this.unitInfoPanel);
    this.unitInfoPanel = null;

    // Remove event listeners
    const gameScene = this.scene.get("Game");
    gameScene.events.off("unit-selected");
    gameScene.events.off("unit-deselected");
    gameScene.events.off("unit-hover");
    gameScene.events.off("menu-navigate-up");
    gameScene.events.off("menu-navigate-down");
    gameScene.events.off("menu-activate");
    gameScene.events.off("menu-deactivate");
    gameScene.events.off("menu-confirm");
    gameScene.events.off("unit-damaged");
  }
}
