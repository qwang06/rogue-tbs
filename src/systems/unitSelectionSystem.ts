import { Unit } from "../components/Unit";
import { Cursor } from "../components/Cursor";

/**
 * Unit selection system - handles unit selection logic and state management
 * This is a pure data system with no Phaser dependencies for testability
 */

export interface UnitData {
  unit: Unit;
  sprite: Phaser.GameObjects.Sprite;
}

export interface UnitSelectionState {
  selectedUnit: UnitData | null;
}

/**
 * Create initial unit selection state
 */
export function createUnitSelectionState(): UnitSelectionState {
  return {
    selectedUnit: null
  };
}

/**
 * Find a unit at the given cursor position
 */
export function findUnitAtCursor(
  units: UnitData[],
  cursor: Cursor
): UnitData | null {
  return units.find(unitData => 
    unitData.unit.position.tileX === cursor.tileX &&
    unitData.unit.position.tileY === cursor.tileY
  ) || null;
}

/**
 * Check if a unit is currently selected
 */
export function hasSelectedUnit(state: UnitSelectionState): boolean {
  return state.selectedUnit !== null;
}

/**
 * Select a unit and update state
 */
export function selectUnit(
  state: UnitSelectionState,
  unitData: UnitData
): UnitSelectionState {
  return {
    ...state,
    selectedUnit: unitData
  };
}

/**
 * Deselect the current unit
 */
export function deselectUnit(state: UnitSelectionState): UnitSelectionState {
  return {
    ...state,
    selectedUnit: null
  };
}

/**
 * Get the currently selected unit
 */
export function getSelectedUnit(state: UnitSelectionState): UnitData | null {
  return state.selectedUnit;
}