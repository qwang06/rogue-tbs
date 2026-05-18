import type Phaser from "phaser";
import type { Unit } from "../../components/Unit";

interface MenuCallback {
  (actionName: string): void;
}

/**
 * Helper class to centralize event emission for the game scene.
 * Provides a clean interface for emitting game events to the UI scene and other listeners.
 */
export class GameEventEmitter {
  private events: Phaser.Events.EventEmitter;

  constructor(events: Phaser.Events.EventEmitter) {
    this.events = events;
  }

  // Unit selection events
  emitUnitSelected(unit: Unit): void {
    this.events.emit("unit-selected", unit);
  }

  emitUnitDeselected(): void {
    this.events.emit("unit-deselected");
  }

  emitUnitHover(unit: Unit | null): void {
    this.events.emit("unit-hover", unit);
  }

  emitUnitDamaged(unit: Unit): void {
    this.events.emit("unit-damaged", unit);
  }

  // Menu events
  emitMenuActivate(): void {
    this.events.emit("menu-activate");
  }

  emitMenuDeactivate(): void {
    this.events.emit("menu-deactivate");
  }

  emitMenuNavigateUp(): void {
    this.events.emit("menu-navigate-up");
  }

  emitMenuNavigateDown(): void {
    this.events.emit("menu-navigate-down");
  }

  emitMenuConfirm(): void {
    this.events.emit("menu-confirm");
  }

  // Event listeners
  onMenuActionSelected(callback: MenuCallback): void {
    this.events.on("menu-action-selected", callback);
  }

  offMenuActionSelected(callback: MenuCallback): void {
    this.events.off("menu-action-selected", callback);
  }

  // Cleanup
  cleanup(): void {
    this.events.off("menu-action-selected");
  }
}
