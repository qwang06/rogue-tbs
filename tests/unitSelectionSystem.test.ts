import { describe, it, expect } from 'vitest';
import {
  createUnitSelectionState,
  findUnitAtCursor,
  hasSelectedUnit,
  selectUnit,
  deselectUnit,
  getSelectedUnit,
  type UnitData
} from '../src/systems/unitSelection';
import { createCursor } from '../src/components/Cursor';
import { createUnit } from '../src/components/Unit';

// Mock Phaser sprite for testing
const mockSprite = {} as any;

const createMockUnitData = (id: string, tileX: number, tileY: number): UnitData => ({
  unit: createUnit(
    id,
    `Unit ${id}`,
    "TestUnit",
    { tileX, tileY },
    {
      baseKey: "test",
      idleKey: "test_idle",
      moveKey: "test_move",
      portraitKey: "test_portrait"
    }
  ),
  sprite: mockSprite
});

describe('unitSelectionSystem', () => {
  describe('createUnitSelectionState', () => {
    it('creates initial state with no selected unit', () => {
      const state = createUnitSelectionState();
      expect(state.selectedUnit).toBeNull();
    });
  });

  describe('findUnitAtCursor', () => {
    it('finds unit at cursor position', () => {
      const units = [
        createMockUnitData('1', 2, 3),
        createMockUnitData('2', 5, 5)
      ];
      const cursor = createCursor(2, 3);

      const result = findUnitAtCursor(units, cursor);
      expect(result).toBe(units[0]);
    });

    it('returns null when no unit at cursor position', () => {
      const units = [
        createMockUnitData('1', 2, 3),
        createMockUnitData('2', 5, 5)
      ];
      const cursor = createCursor(0, 0);

      const result = findUnitAtCursor(units, cursor);
      expect(result).toBeNull();
    });
  });

  describe('hasSelectedUnit', () => {
    it('returns false for initial state', () => {
      const state = createUnitSelectionState();
      expect(hasSelectedUnit(state)).toBe(false);
    });

    it('returns true when unit is selected', () => {
      const unitData = createMockUnitData('1', 2, 3);
      let state = createUnitSelectionState();
      state = selectUnit(state, unitData);
      expect(hasSelectedUnit(state)).toBe(true);
    });
  });

  describe('selectUnit and getSelectedUnit', () => {
    it('selects unit and returns it', () => {
      const unitData = createMockUnitData('1', 2, 3);
      let state = createUnitSelectionState();
      
      state = selectUnit(state, unitData);
      const selected = getSelectedUnit(state);
      
      expect(selected).toBe(unitData);
    });
  });

  describe('deselectUnit', () => {
    it('deselects currently selected unit', () => {
      const unitData = createMockUnitData('1', 2, 3);
      let state = createUnitSelectionState();
      
      state = selectUnit(state, unitData);
      expect(hasSelectedUnit(state)).toBe(true);
      
      state = deselectUnit(state);
      expect(hasSelectedUnit(state)).toBe(false);
      expect(getSelectedUnit(state)).toBeNull();
    });
  });
});