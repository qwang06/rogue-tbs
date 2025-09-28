import { describe, it, expect, vi } from 'vitest';
import {
  createSpritesheetFrames,
  create4x4Frames,
  DIRECTION_MAPPINGS,
  SPRITESHEET_PRESETS,
} from '../src/util/spritesheet';

// Mock Phaser texture object
const createMockTexture = (width: number = 128, height: number = 128) => ({
  source: [{ width, height }],
  has: vi.fn().mockReturnValue(false),
  add: vi.fn(),
});

describe('Spritesheet Utilities', () => {
  describe('createSpritesheetFrames', () => {
    it('should create frames for a 4x4 spritesheet with default direction mapping', () => {
      const mockTexture = createMockTexture(128, 128) as any;
      const config = { frameWidth: 32, frameHeight: 32, rows: 4, cols: 4 };
      
      createSpritesheetFrames(mockTexture, config);
      
      // Should create 16 frames (4 directions × 4 frames each)
      expect(mockTexture.add).toHaveBeenCalledTimes(16);
      
      // Check some specific frame calls
      expect(mockTexture.add).toHaveBeenCalledWith('front_0', 0, 0, 0, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('front_3', 0, 96, 0, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('back_0', 0, 0, 96, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('back_3', 0, 96, 96, 32, 32);
    });

    it('should work with custom direction mapping', () => {
      const mockTexture = createMockTexture(64, 64) as any;
      const config = { frameWidth: 32, frameHeight: 32, rows: 2, cols: 2 };
      const customMapping = { idle: 0, walk: 1 };
      
      createSpritesheetFrames(mockTexture, config, customMapping);
      
      // Should create 4 frames (2 states × 2 frames each)
      expect(mockTexture.add).toHaveBeenCalledTimes(4);
      
      // Check specific frame calls
      expect(mockTexture.add).toHaveBeenCalledWith('idle_0', 0, 0, 0, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('idle_1', 0, 32, 0, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('walk_0', 0, 0, 32, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('walk_1', 0, 32, 32, 32, 32);
    });

    it('should skip rows that exceed available rows', () => {
      const mockTexture = createMockTexture(64, 32) as any;
      const config = { frameWidth: 32, frameHeight: 32, rows: 1, cols: 2 };
      const mappingWithExtraRows = { valid: 0, invalid: 1, alsoInvalid: 2 };
      
      createSpritesheetFrames(mockTexture, config, mappingWithExtraRows);
      
      // Should only create frames for the valid row (2 frames)
      expect(mockTexture.add).toHaveBeenCalledTimes(2);
      expect(mockTexture.add).toHaveBeenCalledWith('valid_0', 0, 0, 0, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('valid_1', 0, 32, 0, 32, 32);
    });

    it('should not add frames that already exist', () => {
      const mockTexture = createMockTexture(64, 64) as any;
      mockTexture.has.mockReturnValue(true); // Simulate existing frames
      
      const config = { frameWidth: 32, frameHeight: 32, rows: 2, cols: 2 };
      
      createSpritesheetFrames(mockTexture, config);
      
      // Should not add any frames since they already exist
      expect(mockTexture.add).not.toHaveBeenCalled();
    });

    it('should calculate frame dimensions automatically', () => {
      const mockTexture = createMockTexture(256, 192) as any;
      const config = { frameWidth: 32, frameHeight: 32, rows: 3, cols: 4 };
      
      createSpritesheetFrames(mockTexture, config);
      
      // Actual frame dimensions should be calculated from texture size
      // 256/4 = 64, 192/3 = 64
      expect(mockTexture.add).toHaveBeenCalledWith('front_0', 0, 0, 0, 64, 64);
      expect(mockTexture.add).toHaveBeenCalledWith('front_3', 0, 192, 0, 64, 64);
    });
  });

  describe('create4x4Frames (backward compatibility)', () => {
    it('should work exactly like the old function', () => {
      const mockTexture = createMockTexture(128, 128) as any;
      
      create4x4Frames(mockTexture);
      
      // Should create 16 frames just like before
      expect(mockTexture.add).toHaveBeenCalledTimes(16);
      
      // Check that it creates the expected Acolyte-style frames
      expect(mockTexture.add).toHaveBeenCalledWith('front_0', 0, 0, 0, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('left_0', 0, 0, 32, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('right_0', 0, 0, 64, 32, 32);
      expect(mockTexture.add).toHaveBeenCalledWith('back_0', 0, 0, 96, 32, 32);
    });
  });

  describe('Presets and mappings', () => {
    it('should have expected spritesheet presets', () => {
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

    it('should have expected direction mappings', () => {
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