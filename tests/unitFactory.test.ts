import { describe, it, expect, vi } from 'vitest';
import { spawnUnit } from '../src/entities/unitFactory';
import { TILE_SIZE } from '../src/util/tile';

// Mock Phaser objects for testing
const createMockScene = () => ({
  add: {
    sprite: vi.fn().mockReturnValue({
      setOrigin: vi.fn().mockReturnThis(),
      setScale: vi.fn().mockReturnThis(),
    }),
  },
  textures: {
    get: vi.fn().mockReturnValue({
      get: vi.fn().mockReturnValue({
        width: 32, // Mock frame width
      }),
    }),
  },
});

describe('Unit Factory', () => {
  it('should create sprite at correct tile position', () => {
    const mockScene = createMockScene() as any;
    const sprite = spawnUnit(mockScene, 'test-key', 'test-frame', 2, 3);

    // Should call add.sprite with tile center coordinates
    expect(mockScene.add.sprite).toHaveBeenCalledWith(
      2 * TILE_SIZE + TILE_SIZE / 2, // x = 40
      3 * TILE_SIZE + TILE_SIZE / 2, // y = 56
      'test-key',
      'test-frame'
    );
  });

  it('should set origin for feet alignment', () => {
    const mockScene = createMockScene() as any;
    const mockSprite = mockScene.add.sprite();
    const sprite = spawnUnit(mockScene, 'test-key', 'test-frame', 0, 0);

    // Should set origin to (0.5, 1) for bottom-center alignment
    expect(mockSprite.setOrigin).toHaveBeenCalledWith(0.5, 1);
  });

  it('should scale sprite based on TILE_SIZE and frame width', () => {
    const mockScene = createMockScene() as any;
    const mockSprite = mockScene.add.sprite();
    
    // Mock frame width of 32px
    mockScene.textures.get().get.mockReturnValue({ width: 32 });
    
    const sprite = spawnUnit(mockScene, 'test-key', 'test-frame', 0, 0);

    // Should scale to fit TILE_SIZE (16px / 32px = 0.5)
    expect(mockSprite.setScale).toHaveBeenCalledWith(0.5);
  });

  it('should handle different frame widths correctly', () => {
    const mockScene = createMockScene() as any;
    const mockSprite = mockScene.add.sprite();
    
    // Mock frame width of 20px
    mockScene.textures.get().get.mockReturnValue({ width: 20 });
    
    const sprite = spawnUnit(mockScene, 'test-key', 'test-frame', 0, 0);

    // Should scale to fit TILE_SIZE (16px / 20px = 0.8)
    expect(mockSprite.setScale).toHaveBeenCalledWith(0.8);
  });

  it('should access correct texture and frame data', () => {
    const mockScene = createMockScene() as any;
    spawnUnit(mockScene, 'archer', 'idle-0', 1, 1);

    expect(mockScene.textures.get).toHaveBeenCalledWith('archer');
    expect(mockScene.textures.get().get).toHaveBeenCalledWith('idle-0');
  });
});