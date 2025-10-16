import type { Unit } from "../../components/Unit";
import type {
  UnitSelectionState,
  UnitData,
} from "../../systems/unitSelectionSystem";
import {
  createUnitSelectionState,
  selectUnit,
  deselectUnit,
  hasSelectedUnit,
  getSelectedUnit,
} from "../../systems/unitSelectionSystem";
import type { MovementState } from "../../systems/movementSystem";
import {
  createMovementState,
  enterMovementMode,
  exitMovementMode,
  isMovementActive,
} from "../../systems/movementSystem";
import type { AttackState } from "../../systems/attackSystem";
import {
  createAttackState,
  enterAttackMode,
  exitAttackMode,
  isAttackActive,
} from "../../systems/attackSystem";
import type { MapBounds } from "../../systems/cursorSystem";
import type { TileHighlightMap } from "../../systems/tileHighlightSystem";
import {
  createTileHighlightMap,
  clearAllHighlights,
} from "../../systems/tileHighlightSystem";

/**
 * Manages all game state including units, selection, movement, and attack modes.
 * This class provides a clean interface for querying and updating game state.
 */
export class GameStateManager {
  private units: UnitData[] = [];
  private selectionState: UnitSelectionState = createUnitSelectionState();
  private movementState: MovementState = createMovementState();
  private attackState: AttackState = createAttackState();
  private tileHighlights: TileHighlightMap = createTileHighlightMap();
  private isMenuActive = false;
  private isUnitMoving = false;

  // Getters for state
  getUnits(): UnitData[] {
    return this.units;
  }

  getSelectionState(): UnitSelectionState {
    return this.selectionState;
  }

  getMovementState(): MovementState {
    return this.movementState;
  }

  getAttackState(): AttackState {
    return this.attackState;
  }

  getTileHighlights(): TileHighlightMap {
    return this.tileHighlights;
  }

  isMenuCurrentlyActive(): boolean {
    return this.isMenuActive;
  }

  isUnitCurrentlyMoving(): boolean {
    return this.isUnitMoving;
  }

  hasSelectedUnit(): boolean {
    return hasSelectedUnit(this.selectionState);
  }

  getSelectedUnit(): UnitData | null {
    return getSelectedUnit(this.selectionState);
  }

  isInMovementMode(): boolean {
    return isMovementActive(this.movementState);
  }

  isInAttackMode(): boolean {
    return isAttackActive(this.attackState);
  }

  // Unit management
  addUnit(unitData: UnitData): void {
    this.units.push(unitData);
  }

  updateUnit(unitId: string, updatedUnit: Unit): void {
    const unitData = this.units.find((u) => u.unit.id === unitId);
    if (unitData) {
      unitData.unit = updatedUnit;
    }
  }

  // Selection management
  selectUnit(unitData: UnitData): void {
    this.selectionState = selectUnit(this.selectionState, unitData);
  }

  deselectUnit(): void {
    this.selectionState = deselectUnit(this.selectionState);
  }

  // Menu state management
  activateMenu(): void {
    this.isMenuActive = true;
  }

  deactivateMenu(): void {
    this.isMenuActive = false;
  }

  // Movement state management
  enterMovementMode(unit: Unit, mapBounds: MapBounds, range: number): void {
    this.movementState = enterMovementMode(
      this.movementState,
      unit,
      mapBounds,
      range
    );
  }

  exitMovementMode(): void {
    this.movementState = exitMovementMode();
  }

  // Attack state management
  enterAttackMode(unit: Unit, mapBounds: MapBounds, range: number): void {
    this.attackState = enterAttackMode(
      this.attackState,
      unit,
      mapBounds,
      range
    );
  }

  exitAttackMode(): void {
    this.attackState = exitAttackMode();
  }

  // Unit movement flag management
  setUnitMoving(moving: boolean): void {
    this.isUnitMoving = moving;
  }

  // Clear all highlights
  clearHighlights(): void {
    clearAllHighlights(this.tileHighlights);
  }

  // Clean up on scene shutdown
  cleanup(): void {
    clearAllHighlights(this.tileHighlights);
    if (hasSelectedUnit(this.selectionState)) {
      this.deselectUnit();
    }
  }
}
