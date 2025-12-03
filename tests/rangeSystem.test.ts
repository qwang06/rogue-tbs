import { describe, it, expect } from "vitest";
import {
  getManhattanDistance,
  getTilesInRange,
  isInRange,
} from "../src/systems/rangeSystem";

describe("Range System", () => {
  describe("getManhattanDistance", () => {
    it("should calculate distance between same tile as 0", () => {
      const distance = getManhattanDistance(
        { tileX: 5, tileY: 5 },
        { tileX: 5, tileY: 5 }
      );
      expect(distance).toBe(0);
    });

    it("should calculate orthogonal distance correctly", () => {
      expect(
        getManhattanDistance({ tileX: 0, tileY: 0 }, { tileX: 1, tileY: 0 })
      ).toBe(1);
      expect(
        getManhattanDistance({ tileX: 0, tileY: 0 }, { tileX: 0, tileY: 1 })
      ).toBe(1);
      expect(
        getManhattanDistance({ tileX: 5, tileY: 5 }, { tileX: 8, tileY: 5 })
      ).toBe(3);
      expect(
        getManhattanDistance({ tileX: 5, tileY: 5 }, { tileX: 5, tileY: 2 })
      ).toBe(3);
    });

    it("should calculate diagonal distance correctly", () => {
      // Diagonal at (1,1) from (0,0) has Manhattan distance 2
      expect(
        getManhattanDistance({ tileX: 0, tileY: 0 }, { tileX: 1, tileY: 1 })
      ).toBe(2);
      expect(
        getManhattanDistance({ tileX: 5, tileY: 5 }, { tileX: 7, tileY: 7 })
      ).toBe(4);
      expect(
        getManhattanDistance({ tileX: 3, tileY: 3 }, { tileX: 4, tileY: 4 })
      ).toBe(2);
    });

    it("should handle negative coordinates", () => {
      expect(
        getManhattanDistance({ tileX: -2, tileY: -2 }, { tileX: 0, tileY: 0 })
      ).toBe(4);
      expect(
        getManhattanDistance({ tileX: 0, tileY: 0 }, { tileX: -1, tileY: 0 })
      ).toBe(1);
    });
  });

  describe("getTilesInRange", () => {
    it("should return 4 tiles for range 1 (orthogonal only)", () => {
      const tiles = getTilesInRange({ tileX: 5, tileY: 5 }, 1);
      expect(tiles).toHaveLength(4);
      expect(tiles).toContainEqual({ tileX: 5, tileY: 4 }); // Up
      expect(tiles).toContainEqual({ tileX: 5, tileY: 6 }); // Down
      expect(tiles).toContainEqual({ tileX: 4, tileY: 5 }); // Left
      expect(tiles).toContainEqual({ tileX: 6, tileY: 5 }); // Right
    });

    it("should return 12 tiles for range 2", () => {
      const tiles = getTilesInRange({ tileX: 5, tileY: 5 }, 2);
      expect(tiles).toHaveLength(12);

      // Range 1 tiles (orthogonal)
      expect(tiles).toContainEqual({ tileX: 5, tileY: 4 });
      expect(tiles).toContainEqual({ tileX: 5, tileY: 6 });
      expect(tiles).toContainEqual({ tileX: 4, tileY: 5 });
      expect(tiles).toContainEqual({ tileX: 6, tileY: 5 });

      // Diagonals at distance 2
      expect(tiles).toContainEqual({ tileX: 4, tileY: 4 });
      expect(tiles).toContainEqual({ tileX: 6, tileY: 6 });
      expect(tiles).toContainEqual({ tileX: 4, tileY: 6 });
      expect(tiles).toContainEqual({ tileX: 6, tileY: 4 });

      // Distance 2 orthogonal
      expect(tiles).toContainEqual({ tileX: 5, tileY: 3 });
      expect(tiles).toContainEqual({ tileX: 5, tileY: 7 });
      expect(tiles).toContainEqual({ tileX: 3, tileY: 5 });
      expect(tiles).toContainEqual({ tileX: 7, tileY: 5 });
    });

    it("should return 20 tiles for range 3", () => {
      const tiles = getTilesInRange({ tileX: 5, tileY: 5 }, 3);
      expect(tiles).toHaveLength(24); // (3*2+1)^2 - 1 - corners = 24
    });

    it("should not include the source tile", () => {
      const tiles = getTilesInRange({ tileX: 5, tileY: 5 }, 2);
      expect(tiles).not.toContainEqual({ tileX: 5, tileY: 5 });
    });

    it("should respect map bounds - corner position", () => {
      const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
      const tiles = getTilesInRange({ tileX: 0, tileY: 0 }, 1, bounds);

      expect(tiles).toHaveLength(2); // Only right and down
      expect(tiles).toContainEqual({ tileX: 1, tileY: 0 });
      expect(tiles).toContainEqual({ tileX: 0, tileY: 1 });
      expect(tiles).not.toContainEqual({ tileX: -1, tileY: 0 });
      expect(tiles).not.toContainEqual({ tileX: 0, tileY: -1 });
    });

    it("should respect map bounds - edge position", () => {
      const bounds = { minX: 0, minY: 0, maxX: 10, maxY: 10 };
      const tiles = getTilesInRange({ tileX: 10, tileY: 5 }, 1, bounds);

      expect(tiles).toHaveLength(3); // Up, down, left (not right)
      expect(tiles).toContainEqual({ tileX: 10, tileY: 4 });
      expect(tiles).toContainEqual({ tileX: 10, tileY: 6 });
      expect(tiles).toContainEqual({ tileX: 9, tileY: 5 });
      expect(tiles).not.toContainEqual({ tileX: 11, tileY: 5 });
    });

    it("should work without map bounds", () => {
      const tiles = getTilesInRange({ tileX: 0, tileY: 0 }, 1);
      expect(tiles).toHaveLength(4);
      // Should include negative coordinates
      expect(tiles).toContainEqual({ tileX: -1, tileY: 0 });
      expect(tiles).toContainEqual({ tileX: 0, tileY: -1 });
    });
  });

  describe("isInRange", () => {
    it("should return true for tiles within range 1", () => {
      const source = { tileX: 5, tileY: 5 };
      expect(isInRange(source, { tileX: 5, tileY: 4 }, 1)).toBe(true);
      expect(isInRange(source, { tileX: 6, tileY: 5 }, 1)).toBe(true);
      expect(isInRange(source, { tileX: 4, tileY: 5 }, 1)).toBe(true);
      expect(isInRange(source, { tileX: 5, tileY: 6 }, 1)).toBe(true);
    });

    it("should return false for tiles outside range 1", () => {
      const source = { tileX: 5, tileY: 5 };
      expect(isInRange(source, { tileX: 7, tileY: 5 }, 1)).toBe(false);
      expect(isInRange(source, { tileX: 4, tileY: 4 }, 1)).toBe(false); // Diagonal
      expect(isInRange(source, { tileX: 5, tileY: 3 }, 1)).toBe(false);
    });

    it("should handle range 2 correctly", () => {
      const source = { tileX: 5, tileY: 5 };
      expect(isInRange(source, { tileX: 4, tileY: 4 }, 2)).toBe(true); // Diagonal
      expect(isInRange(source, { tileX: 7, tileY: 5 }, 2)).toBe(true); // Orthogonal
      expect(isInRange(source, { tileX: 5, tileY: 3 }, 2)).toBe(true);
      expect(isInRange(source, { tileX: 8, tileY: 5 }, 2)).toBe(false); // Distance 3
      expect(isInRange(source, { tileX: 7, tileY: 7 }, 2)).toBe(false); // Distance 4
    });

    it("should include source tile (distance 0)", () => {
      const source = { tileX: 5, tileY: 5 };
      expect(isInRange(source, source, 1)).toBe(true);
      expect(isInRange(source, source, 2)).toBe(true);
    });

    it("should handle edge cases", () => {
      expect(isInRange({ tileX: 0, tileY: 0 }, { tileX: 0, tileY: 0 }, 0)).toBe(
        true
      );
      expect(isInRange({ tileX: 0, tileY: 0 }, { tileX: 1, tileY: 0 }, 0)).toBe(
        false
      );
    });
  });

  describe("Range visualization examples", () => {
    it("should match expected pattern for range 1", () => {
      // Pattern for range 1 around (5,5):
      //     X
      //   X O X
      //     X
      const tiles = getTilesInRange({ tileX: 5, tileY: 5 }, 1);
      const pattern = tiles.map((t) => `${t.tileX},${t.tileY}`).sort();
      expect(pattern).toEqual(["4,5", "5,4", "5,6", "6,5"]);
    });

    it("should match expected pattern for range 2", () => {
      // Pattern for range 2 around (5,5):
      //       X
      //     X X X
      //   X X O X X
      //     X X X
      //       X
      const tiles = getTilesInRange({ tileX: 5, tileY: 5 }, 2);
      expect(tiles).toHaveLength(12);

      // All tiles should be at distance 1 or 2
      tiles.forEach((tile) => {
        const dist = getManhattanDistance({ tileX: 5, tileY: 5 }, tile);
        expect(dist).toBeGreaterThan(0);
        expect(dist).toBeLessThanOrEqual(2);
      });
    });
  });
});
