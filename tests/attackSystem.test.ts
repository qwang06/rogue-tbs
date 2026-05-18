import { describe, it, expect } from "vitest";
import {
  createAttackState,
  isAttackActive,
  calculateAttackRange,
  enterAttackMode,
  exitAttackMode,
  isTileAttackable,
  calculateDamage,
  applyDamage,
} from "../src/systems/attack";
import { createUnit } from "../src/components/Unit";
import { createCursor } from "../src/components/Cursor";

describe("attackSystem", () => {
  const mockSprites = {
    baseKey: "test",
    idleKey: "test_idle",
    moveKey: "test_move",
    portraitKey: "test_portrait",
  };

  const mapBounds = {
    minX: 0,
    minY: 0,
    maxX: 9,
    maxY: 9,
  };

  describe("createAttackState", () => {
    it("should create initial attack state", () => {
      const state = createAttackState();

      expect(state.isActive).toBe(false);
      expect(state.attackingUnit).toBeNull();
      expect(state.attackableTiles).toEqual([]);
    });
  });

  describe("isAttackActive", () => {
    it("should return false for initial state", () => {
      const state = createAttackState();
      expect(isAttackActive(state)).toBe(false);
    });

    it("should return true when attack mode is active", () => {
      const state = {
        isActive: true,
        attackingUnit: null,
        attackableTiles: [],
      };
      expect(isAttackActive(state)).toBe(true);
    });
  });

  describe("calculateAttackRange", () => {
    it("should calculate orthogonal tiles with range 1", () => {
      const tiles = calculateAttackRange(5, 5, 1, mapBounds);

      expect(tiles).toHaveLength(4);
      expect(tiles).toContainEqual({ tileX: 5, tileY: 4 }); // up
      expect(tiles).toContainEqual({ tileX: 5, tileY: 6 }); // down
      expect(tiles).toContainEqual({ tileX: 4, tileY: 5 }); // left
      expect(tiles).toContainEqual({ tileX: 6, tileY: 5 }); // right
    });

    it("should respect map boundaries at edge", () => {
      const tiles = calculateAttackRange(0, 0, 1, mapBounds);

      expect(tiles).toHaveLength(2);
      expect(tiles).toContainEqual({ tileX: 0, tileY: 1 }); // down
      expect(tiles).toContainEqual({ tileX: 1, tileY: 0 }); // right
    });

    it("should respect map boundaries at corner", () => {
      const tiles = calculateAttackRange(9, 9, 1, mapBounds);

      expect(tiles).toHaveLength(2);
      expect(tiles).toContainEqual({ tileX: 9, tileY: 8 }); // up
      expect(tiles).toContainEqual({ tileX: 8, tileY: 9 }); // left
    });

    it("should support larger attack ranges", () => {
      const tiles = calculateAttackRange(5, 5, 2, mapBounds);

      expect(tiles).toHaveLength(8);
      // Up direction
      expect(tiles).toContainEqual({ tileX: 5, tileY: 4 });
      expect(tiles).toContainEqual({ tileX: 5, tileY: 3 });
      // Down direction
      expect(tiles).toContainEqual({ tileX: 5, tileY: 6 });
      expect(tiles).toContainEqual({ tileX: 5, tileY: 7 });
      // Left direction
      expect(tiles).toContainEqual({ tileX: 4, tileY: 5 });
      expect(tiles).toContainEqual({ tileX: 3, tileY: 5 });
      // Right direction
      expect(tiles).toContainEqual({ tileX: 6, tileY: 5 });
      expect(tiles).toContainEqual({ tileX: 7, tileY: 5 });
    });

    it("should stop at boundaries for larger ranges", () => {
      const tiles = calculateAttackRange(1, 1, 3, mapBounds);

      // Up should have 1 tile (0), Down should have 3 tiles (2,3,4)
      // Left should have 1 tile (0), Right should have 3 tiles (2,3,4)
      expect(tiles).toHaveLength(8);
      expect(tiles).toContainEqual({ tileX: 1, tileY: 0 }); // up 1
      expect(tiles).toContainEqual({ tileX: 0, tileY: 1 }); // left 1
    });
  });

  describe("enterAttackMode", () => {
    it("should enter attack mode and calculate attackable tiles", () => {
      const unit = createUnit(
        "unit_001",
        "Test Unit",
        "Warrior",
        { tileX: 5, tileY: 5 },
        mockSprites
      );
      const initialState = createAttackState();

      const newState = enterAttackMode(initialState, unit, mapBounds);

      expect(newState.isActive).toBe(true);
      expect(newState.attackingUnit).toBe(unit);
      expect(newState.attackableTiles).toHaveLength(4);
      expect(newState.attackableTiles).toContainEqual({ tileX: 5, tileY: 4 });
      expect(newState.attackableTiles).toContainEqual({ tileX: 5, tileY: 6 });
      expect(newState.attackableTiles).toContainEqual({ tileX: 4, tileY: 5 });
      expect(newState.attackableTiles).toContainEqual({ tileX: 6, tileY: 5 });
    });
  });

  describe("exitAttackMode", () => {
    it("should clear attack state", () => {
      const state = exitAttackMode();

      expect(state.isActive).toBe(false);
      expect(state.attackingUnit).toBeNull();
      expect(state.attackableTiles).toEqual([]);
    });
  });

  describe("isTileAttackable", () => {
    it("should return false when attack mode is not active", () => {
      const state = createAttackState();
      const cursor = createCursor(5, 5);

      expect(isTileAttackable(state, cursor)).toBe(false);
    });

    it("should return true for attackable tiles", () => {
      const unit = createUnit(
        "unit_001",
        "Test Unit",
        "Warrior",
        { tileX: 5, tileY: 5 },
        mockSprites
      );
      const state = enterAttackMode(createAttackState(), unit, mapBounds);
      const cursor = createCursor(5, 6); // Down from unit

      expect(isTileAttackable(state, cursor)).toBe(true);
    });

    it("should return false for non-attackable tiles", () => {
      const unit = createUnit(
        "unit_001",
        "Test Unit",
        "Warrior",
        { tileX: 5, tileY: 5 },
        mockSprites
      );
      const state = enterAttackMode(createAttackState(), unit, mapBounds);
      const cursor = createCursor(7, 7); // Diagonal, not attackable

      expect(isTileAttackable(state, cursor)).toBe(false);
    });
  });

  describe("calculateDamage", () => {
    it("should calculate damage as attack minus defense", () => {
      const attacker = createUnit(
        "unit_001",
        "Attacker",
        "Warrior",
        { tileX: 0, tileY: 0 },
        mockSprites,
        { attack: 30, defense: 10 }
      );
      const defender = createUnit(
        "unit_002",
        "Defender",
        "Warrior",
        { tileX: 1, tileY: 0 },
        mockSprites,
        { attack: 20, defense: 15 }
      );

      const damage = calculateDamage(attacker, defender);

      expect(damage).toBe(15); // 30 - 15
    });

    it("should have minimum damage of 1 when defense is higher", () => {
      const attacker = createUnit(
        "unit_001",
        "Attacker",
        "Warrior",
        { tileX: 0, tileY: 0 },
        mockSprites,
        { attack: 10, defense: 10 }
      );
      const defender = createUnit(
        "unit_002",
        "Defender",
        "Warrior",
        { tileX: 1, tileY: 0 },
        mockSprites,
        { attack: 20, defense: 50 }
      );

      const damage = calculateDamage(attacker, defender);

      expect(damage).toBe(1); // max(1, 10 - 50)
    });

    it("should have minimum damage of 1 when attack equals defense", () => {
      const attacker = createUnit(
        "unit_001",
        "Attacker",
        "Warrior",
        { tileX: 0, tileY: 0 },
        mockSprites,
        { attack: 25, defense: 10 }
      );
      const defender = createUnit(
        "unit_002",
        "Defender",
        "Warrior",
        { tileX: 1, tileY: 0 },
        mockSprites,
        { attack: 20, defense: 25 }
      );

      const damage = calculateDamage(attacker, defender);

      expect(damage).toBe(1); // max(1, 25 - 25)
    });
  });

  describe("applyDamage", () => {
    it("should reduce unit HP by damage amount", () => {
      const unit = createUnit(
        "unit_001",
        "Test Unit",
        "Warrior",
        { tileX: 0, tileY: 0 },
        mockSprites,
        { hp: 100, maxHp: 100 }
      );

      const damagedUnit = applyDamage(unit, 30);

      expect(damagedUnit.stats.hp).toBe(70);
      expect(damagedUnit.stats.maxHp).toBe(100);
    });

    it("should not reduce HP below 0", () => {
      const unit = createUnit(
        "unit_001",
        "Test Unit",
        "Warrior",
        { tileX: 0, tileY: 0 },
        mockSprites,
        { hp: 20, maxHp: 100 }
      );

      const damagedUnit = applyDamage(unit, 50);

      expect(damagedUnit.stats.hp).toBe(0);
    });

    it("should not mutate original unit", () => {
      const unit = createUnit(
        "unit_001",
        "Test Unit",
        "Warrior",
        { tileX: 0, tileY: 0 },
        mockSprites,
        { hp: 100, maxHp: 100 }
      );
      const originalHp = unit.stats.hp;

      applyDamage(unit, 30);

      expect(unit.stats.hp).toBe(originalHp);
    });
  });
});
