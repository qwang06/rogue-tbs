import { describe, it, expect } from "vitest";
import { TILE_SIZE } from "../src/util/tile";

describe("Tile utility", () => {
  it("should have correct TILE_SIZE constant", () => {
    expect(TILE_SIZE).toBe(32);
  });
});
