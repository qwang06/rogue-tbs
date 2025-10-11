import { describe, it, expect } from "vitest";
import {
  createMovementState,
  enterMovementMode,
  exitMovementMode,
  isMovementActive,
  isTileReachable,
  calculateMovementRange,
  generateMovementPath,
} from "../src/systems/movementSystem";
import { createUnit } from "../src/components/Unit";
import { createCursor } from "../src/components/Cursor";

describe("movementSystem", () => {
  describe("createMovementState", () => {
    it("should create initial movement state", () => {
      const state = createMovementState();
      expect(state.isActive).toBe(false);
      expect(state.unit).toBe(null);
      expect(state.reachableTiles).toEqual([]);
    });
  });

  describe("isMovementActive", () => {
    it("should return false for initial state", () => {
      const state = createMovementState();
      expect(isMovementActive(state)).toBe(false);
    });

    it("should return true when movement is active", () => {
      const unit = createUnit("u1", "Test", "Warrior", { tileX: 5, tileY: 5 }, {
        baseKey: "test",
        idleKey: "test-idle",
        moveKey: "test-move",
        portraitKey: "test-portrait",
      });
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const state = enterMovementMode(createMovementState(), unit, mapBounds, 3);
      expect(isMovementActive(state)).toBe(true);
    });
  });

  describe("enterMovementMode", () => {
    it("should calculate reachable tiles within range", () => {
      const unit = createUnit("u1", "Test", "Warrior", { tileX: 5, tileY: 5 }, {
        baseKey: "test",
        idleKey: "test-idle",
        moveKey: "test-move",
        portraitKey: "test-portrait",
      });
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const state = enterMovementMode(createMovementState(), unit, mapBounds, 2);

      expect(state.isActive).toBe(true);
      expect(state.unit).toBe(unit);
      expect(state.reachableTiles.length).toBeGreaterThan(0);
      
      // At range 2, should have tiles orthogonally adjacent within 2 steps
      // Not including starting position
      expect(state.reachableTiles.some(t => t.tileX === 5 && t.tileY === 4)).toBe(true); // up 1
      expect(state.reachableTiles.some(t => t.tileX === 5 && t.tileY === 6)).toBe(true); // down 1
      expect(state.reachableTiles.some(t => t.tileX === 4 && t.tileY === 5)).toBe(true); // left 1
      expect(state.reachableTiles.some(t => t.tileX === 6 && t.tileY === 5)).toBe(true); // right 1
    });

    it("should respect map bounds", () => {
      const unit = createUnit("u1", "Test", "Warrior", { tileX: 0, tileY: 0 }, {
        baseKey: "test",
        idleKey: "test-idle",
        moveKey: "test-move",
        portraitKey: "test-portrait",
      });
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const state = enterMovementMode(createMovementState(), unit, mapBounds, 2);

      // Should not have negative coordinates
      expect(state.reachableTiles.every(t => t.tileX >= 0 && t.tileY >= 0)).toBe(true);
    });
  });

  describe("exitMovementMode", () => {
    it("should reset movement state", () => {
      const unit = createUnit("u1", "Test", "Warrior", { tileX: 5, tileY: 5 }, {
        baseKey: "test",
        idleKey: "test-idle",
        moveKey: "test-move",
        portraitKey: "test-portrait",
      });
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      let state = enterMovementMode(createMovementState(), unit, mapBounds, 3);
      state = exitMovementMode();

      expect(state.isActive).toBe(false);
      expect(state.unit).toBe(null);
      expect(state.reachableTiles).toEqual([]);
    });
  });

  describe("calculateMovementRange", () => {
    it("should calculate all tiles within range", () => {
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const tiles = calculateMovementRange(5, 5, 1, mapBounds);

      // With range 1, should have 4 orthogonal neighbors
      expect(tiles.length).toBe(4);
      expect(tiles).toContainEqual({ tileX: 5, tileY: 4 }); // up
      expect(tiles).toContainEqual({ tileX: 5, tileY: 6 }); // down
      expect(tiles).toContainEqual({ tileX: 4, tileY: 5 }); // left
      expect(tiles).toContainEqual({ tileX: 6, tileY: 5 }); // right
    });

    it("should not include diagonal tiles", () => {
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const tiles = calculateMovementRange(5, 5, 1, mapBounds);

      // Should not have diagonal neighbors
      expect(tiles).not.toContainEqual({ tileX: 4, tileY: 4 });
      expect(tiles).not.toContainEqual({ tileX: 6, tileY: 4 });
      expect(tiles).not.toContainEqual({ tileX: 4, tileY: 6 });
      expect(tiles).not.toContainEqual({ tileX: 6, tileY: 6 });
    });

    it("should not include starting tile", () => {
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const tiles = calculateMovementRange(5, 5, 2, mapBounds);

      expect(tiles).not.toContainEqual({ tileX: 5, tileY: 5 });
    });
  });

  describe("isTileReachable", () => {
    it("should return false if movement is not active", () => {
      const state = createMovementState();
      const cursor = createCursor(5, 5);
      expect(isTileReachable(state, cursor)).toBe(false);
    });

    it("should return true if tile is reachable", () => {
      const unit = createUnit("u1", "Test", "Warrior", { tileX: 5, tileY: 5 }, {
        baseKey: "test",
        idleKey: "test-idle",
        moveKey: "test-move",
        portraitKey: "test-portrait",
      });
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const state = enterMovementMode(createMovementState(), unit, mapBounds, 2);
      const cursor = createCursor(5, 6); // One tile down

      expect(isTileReachable(state, cursor)).toBe(true);
    });

    it("should return false if tile is not reachable", () => {
      const unit = createUnit("u1", "Test", "Warrior", { tileX: 5, tileY: 5 }, {
        baseKey: "test",
        idleKey: "test-idle",
        moveKey: "test-move",
        portraitKey: "test-portrait",
      });
      const mapBounds = { minX: 0, minY: 0, maxX: 19, maxY: 19 };
      const state = enterMovementMode(createMovementState(), unit, mapBounds, 2);
      const cursor = createCursor(10, 10); // Too far

      expect(isTileReachable(state, cursor)).toBe(false);
    });
  });

  describe("generateMovementPath", () => {
    it("should generate path moving right", () => {
      const path = generateMovementPath(0, 0, 2, 0);
      expect(path).toEqual([
        { tileX: 1, tileY: 0 },
        { tileX: 2, tileY: 0 },
      ]);
    });

    it("should generate path moving down", () => {
      const path = generateMovementPath(0, 0, 0, 2);
      expect(path).toEqual([
        { tileX: 0, tileY: 1 },
        { tileX: 0, tileY: 2 },
      ]);
    });

    it("should generate path moving right then down", () => {
      const path = generateMovementPath(0, 0, 2, 2);
      expect(path).toEqual([
        { tileX: 1, tileY: 0 },
        { tileX: 2, tileY: 0 },
        { tileX: 2, tileY: 1 },
        { tileX: 2, tileY: 2 },
      ]);
    });

    it("should generate path moving left then up", () => {
      const path = generateMovementPath(5, 5, 3, 3);
      expect(path).toEqual([
        { tileX: 4, tileY: 5 },
        { tileX: 3, tileY: 5 },
        { tileX: 3, tileY: 4 },
        { tileX: 3, tileY: 3 },
      ]);
    });

    it("should return empty path if already at destination", () => {
      const path = generateMovementPath(5, 5, 5, 5);
      expect(path).toEqual([]);
    });
  });
});
