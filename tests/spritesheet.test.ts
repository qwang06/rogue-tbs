import { describe, it, expect } from "vitest";
import {
  getFrameIndex,
  createDirectionAnimationFrames,
  DIRECTION_MAPPINGS,
  SPRITESHEET_PRESETS,
  DIRECTION_ROWS,
} from "../src/util/spritesheet";

describe("Spritesheet Utilities", () => {
  describe("getFrameIndex", () => {
    it("should calculate correct frame index for front direction", () => {
      // Front is row 0: frame indices 0-3
      expect(getFrameIndex("front", 0)).toBe(0);
      expect(getFrameIndex("front", 1)).toBe(1);
      expect(getFrameIndex("front", 2)).toBe(2);
      expect(getFrameIndex("front", 3)).toBe(3);
    });

    it("should calculate correct frame index for left direction", () => {
      // Left is row 1: frame indices 4-7
      expect(getFrameIndex("left", 0)).toBe(4);
      expect(getFrameIndex("left", 1)).toBe(5);
      expect(getFrameIndex("left", 2)).toBe(6);
      expect(getFrameIndex("left", 3)).toBe(7);
    });

    it("should calculate correct frame index for right direction", () => {
      // Right is row 2: frame indices 8-11
      expect(getFrameIndex("right", 0)).toBe(8);
      expect(getFrameIndex("right", 1)).toBe(9);
      expect(getFrameIndex("right", 2)).toBe(10);
      expect(getFrameIndex("right", 3)).toBe(11);
    });

    it("should calculate correct frame index for back direction", () => {
      // Back is row 3: frame indices 12-15
      expect(getFrameIndex("back", 0)).toBe(12);
      expect(getFrameIndex("back", 1)).toBe(13);
      expect(getFrameIndex("back", 2)).toBe(14);
      expect(getFrameIndex("back", 3)).toBe(15);
    });

    it("should use default frameCol of 0 when not specified", () => {
      expect(getFrameIndex("front")).toBe(0);
      expect(getFrameIndex("left")).toBe(4);
      expect(getFrameIndex("right")).toBe(8);
      expect(getFrameIndex("back")).toBe(12);
    });

    it("should work with custom column count", () => {
      // For a 3-column spritesheet
      expect(getFrameIndex("front", 0, 3)).toBe(0);
      expect(getFrameIndex("left", 1, 3)).toBe(4); // row 1 * 3 cols + col 1
      expect(getFrameIndex("right", 2, 3)).toBe(8); // row 2 * 3 cols + col 2
    });
  });

  describe("createDirectionAnimationFrames", () => {
    it("should create correct frames for front direction", () => {
      const frames = createDirectionAnimationFrames("test_texture", "front", 4);

      expect(frames).toHaveLength(4);
      expect(frames[0]).toEqual({ key: "test_texture", frame: 0 });
      expect(frames[1]).toEqual({ key: "test_texture", frame: 1 });
      expect(frames[2]).toEqual({ key: "test_texture", frame: 2 });
      expect(frames[3]).toEqual({ key: "test_texture", frame: 3 });
    });

    it("should create correct frames for left direction", () => {
      const frames = createDirectionAnimationFrames("test_texture", "left", 4);

      expect(frames).toHaveLength(4);
      expect(frames[0]).toEqual({ key: "test_texture", frame: 4 });
      expect(frames[1]).toEqual({ key: "test_texture", frame: 5 });
      expect(frames[2]).toEqual({ key: "test_texture", frame: 6 });
      expect(frames[3]).toEqual({ key: "test_texture", frame: 7 });
    });

    it("should create correct frames for back direction", () => {
      const frames = createDirectionAnimationFrames("test_texture", "back", 4);

      expect(frames).toHaveLength(4);
      expect(frames[0]).toEqual({ key: "test_texture", frame: 12 });
      expect(frames[1]).toEqual({ key: "test_texture", frame: 13 });
      expect(frames[2]).toEqual({ key: "test_texture", frame: 14 });
      expect(frames[3]).toEqual({ key: "test_texture", frame: 15 });
    });

    it("should support custom frame count", () => {
      const frames = createDirectionAnimationFrames("test_texture", "front", 2);

      expect(frames).toHaveLength(2);
      expect(frames[0]).toEqual({ key: "test_texture", frame: 0 });
      expect(frames[1]).toEqual({ key: "test_texture", frame: 1 });
    });
  });

  describe("Presets and mappings", () => {
    it("should have expected spritesheet presets", () => {
      expect(SPRITESHEET_PRESETS.ACOLYTE_4X4).toEqual({
        frameWidth: 32,
        frameHeight: 32,
        rows: 4,
        cols: 4,
      });

      expect(SPRITESHEET_PRESETS.STANDARD_2X2).toEqual({
        frameWidth: 32,
        frameHeight: 32,
        rows: 2,
        cols: 2,
      });
    });

    it("should have expected direction mappings", () => {
      expect(DIRECTION_MAPPINGS.FOUR_DIRECTION).toEqual({
        front: 0,
        left: 1,
        right: 2,
        back: 3,
      });

      expect(DIRECTION_MAPPINGS.TWO_DIRECTION).toEqual({
        left: 0,
        right: 1,
      });

      expect(DIRECTION_MAPPINGS.ANIMATION_STATES).toEqual({
        idle: 0,
        walk: 1,
        run: 2,
        attack: 3,
      });
    });
  });
});
