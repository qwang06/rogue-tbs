import { describe, expect, it } from "vitest";
import {
  manhattanDistance,
  tilesInManhattanRange,
  ORTHOGONAL_DIRECTIONS,
} from "../src/util/gridMath";
import {
  calculateReachableTiles,
  generateOrthogonalPath,
  projectOrthogonalRange,
} from "../src/util/pathing";

describe("gridMath utilities", () => {
  it("calculates Manhattan distance", () => {
    expect(
      manhattanDistance({ tileX: 1, tileY: 1 }, { tileX: 4, tileY: 3 })
    ).toBe(5);
  });

  it("exports four orthogonal directions", () => {
    expect(ORTHOGONAL_DIRECTIONS).toHaveLength(4);
  });

  it("returns tiles in Manhattan range", () => {
    const tiles = tilesInManhattanRange({ tileX: 5, tileY: 5 }, 1);

    expect(tiles).toHaveLength(4);
    expect(tiles).toContainEqual({ tileX: 5, tileY: 4 });
    expect(tiles).toContainEqual({ tileX: 5, tileY: 6 });
    expect(tiles).toContainEqual({ tileX: 4, tileY: 5 });
    expect(tiles).toContainEqual({ tileX: 6, tileY: 5 });
  });
});

describe("pathing utilities", () => {
  const bounds = { minX: 0, minY: 0, maxX: 9, maxY: 9 };

  it("calculates reachable tiles with BFS", () => {
    const tiles = calculateReachableTiles(5, 5, 1, bounds);

    expect(tiles).toHaveLength(4);
    expect(tiles).toContainEqual({ tileX: 5, tileY: 4 });
    expect(tiles).toContainEqual({ tileX: 5, tileY: 6 });
    expect(tiles).toContainEqual({ tileX: 4, tileY: 5 });
    expect(tiles).toContainEqual({ tileX: 6, tileY: 5 });
  });

  it("generates orthogonal path in deterministic order", () => {
    const path = generateOrthogonalPath(0, 0, 2, 2);

    expect(path).toEqual([
      { tileX: 1, tileY: 0 },
      { tileX: 2, tileY: 0 },
      { tileX: 2, tileY: 1 },
      { tileX: 2, tileY: 2 },
    ]);
  });

  it("projects orthogonal range within bounds", () => {
    const tiles = projectOrthogonalRange(0, 0, 2, bounds);

    expect(tiles).toHaveLength(4);
    expect(tiles).toContainEqual({ tileX: 0, tileY: 1 });
    expect(tiles).toContainEqual({ tileX: 0, tileY: 2 });
    expect(tiles).toContainEqual({ tileX: 1, tileY: 0 });
    expect(tiles).toContainEqual({ tileX: 2, tileY: 0 });
  });
});
