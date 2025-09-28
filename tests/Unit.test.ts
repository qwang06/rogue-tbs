import { describe, it, expect } from 'vitest';
import {
  createUnit,
  getUnitFrameName,
  moveUnit,
  setUnitFacing,
  setUnitAnimationState,
  Unit,
  UnitSprites,
} from '../src/components/Unit';

describe('Unit Component', () => {
  const mockSprites: UnitSprites = {
    baseKey: "test_unit",
    idleKey: "test_unit_idle",
    moveKey: "test_unit_move",
    portraitKey: "test_unit_portrait",
  };

  const mockPosition = { tileX: 5, tileY: 3 };

  describe('createUnit', () => {
    it('should create a unit with default stats', () => {
      const unit = createUnit("test_001", "Test Unit", "TestType", mockPosition, mockSprites);

      expect(unit.id).toBe("test_001");
      expect(unit.name).toBe("Test Unit");
      expect(unit.unitType).toBe("TestType");
      expect(unit.position).toEqual(mockPosition);
      expect(unit.sprites).toEqual(mockSprites);
      expect(unit.facing).toBe('front');
      expect(unit.animationState).toBe('idle');
      expect(unit.stats.hp).toBe(100);
      expect(unit.stats.maxHp).toBe(100);
      expect(unit.stats.mp).toBe(20);
      expect(unit.stats.attack).toBe(25);
      expect(unit.stats.defense).toBe(15);
    });

    it('should create a unit with custom stats', () => {
      const customStats = {
        hp: 150,
        maxHp: 150,
        attack: 35,
        defense: 20,
      };

      const unit = createUnit(
        "test_002",
        "Custom Unit",
        "CustomType",
        mockPosition,
        mockSprites,
        customStats
      );

      expect(unit.stats.hp).toBe(150);
      expect(unit.stats.maxHp).toBe(150);
      expect(unit.stats.attack).toBe(35);
      expect(unit.stats.defense).toBe(20);
      // Default values should still be set for non-overridden stats
      expect(unit.stats.mp).toBe(20);
      expect(unit.stats.maxMp).toBe(20);
    });

    it('should include expansion fields in stats', () => {
      const unit = createUnit("test_003", "Expansion Unit", "ExpansionType", mockPosition, mockSprites);

      expect(unit.stats.magicAttack).toBe(10);
      expect(unit.stats.magicDefense).toBe(10);
      expect(unit.stats.speed).toBe(10);
      expect(unit.stats.luck).toBe(5);
    });
  });

  describe('getUnitFrameName', () => {
    it('should return correct frame name for front facing', () => {
      const unit = createUnit("test_001", "Test Unit", "TestType", mockPosition, mockSprites);
      
      expect(getUnitFrameName(unit)).toBe('front_0');
      expect(getUnitFrameName(unit, 2)).toBe('front_2');
    });

    it('should return correct frame name for different facings', () => {
      let unit = createUnit("test_001", "Test Unit", "TestType", mockPosition, mockSprites);
      
      unit = setUnitFacing(unit, 'left');
      expect(getUnitFrameName(unit)).toBe('left_0');
      
      unit = setUnitFacing(unit, 'right');
      expect(getUnitFrameName(unit, 1)).toBe('right_1');
      
      unit = setUnitFacing(unit, 'back');
      expect(getUnitFrameName(unit, 3)).toBe('back_3');
    });
  });

  describe('moveUnit', () => {
    it('should update unit position', () => {
      const unit = createUnit("test_001", "Test Unit", "TestType", mockPosition, mockSprites);
      const newPosition = { tileX: 10, tileY: 7 };
      
      const movedUnit = moveUnit(unit, newPosition.tileX, newPosition.tileY);
      
      expect(movedUnit.position).toEqual(newPosition);
      // Original unit should be unchanged (immutable)
      expect(unit.position).toEqual(mockPosition);
      // Other properties should remain the same
      expect(movedUnit.id).toBe(unit.id);
      expect(movedUnit.name).toBe(unit.name);
    });
  });

  describe('setUnitFacing', () => {
    it('should update unit facing direction', () => {
      const unit = createUnit("test_001", "Test Unit", "TestType", mockPosition, mockSprites);
      
      const leftFacingUnit = setUnitFacing(unit, 'left');
      expect(leftFacingUnit.facing).toBe('left');
      
      const rightFacingUnit = setUnitFacing(unit, 'right');
      expect(rightFacingUnit.facing).toBe('right');
      
      const backFacingUnit = setUnitFacing(unit, 'back');
      expect(backFacingUnit.facing).toBe('back');
      
      // Original unit should be unchanged
      expect(unit.facing).toBe('front');
    });
  });

  describe('setUnitAnimationState', () => {
    it('should update unit animation state', () => {
      const unit = createUnit("test_001", "Test Unit", "TestType", mockPosition, mockSprites);
      
      const moveUnit = setUnitAnimationState(unit, 'move');
      expect(moveUnit.animationState).toBe('move');
      
      const attackUnit = setUnitAnimationState(unit, 'attack');
      expect(attackUnit.animationState).toBe('attack');
      
      const damagedUnit = setUnitAnimationState(unit, 'damaged');
      expect(damagedUnit.animationState).toBe('damaged');
      
      // Original unit should be unchanged
      expect(unit.animationState).toBe('idle');
    });
  });

  describe('Unit immutability', () => {
    it('should not mutate original unit when using helper functions', () => {
      const originalUnit = createUnit("test_001", "Test Unit", "TestType", mockPosition, mockSprites);
      const originalUnitCopy = { ...originalUnit };
      
      // Apply all transformations
      moveUnit(originalUnit, 10, 10);
      setUnitFacing(originalUnit, 'back');
      setUnitAnimationState(originalUnit, 'attack');
      
      // Original unit should be unchanged
      expect(originalUnit).toEqual(originalUnitCopy);
    });
  });
});