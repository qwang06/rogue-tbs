import { describe, it, expect } from 'vitest';
import { getTileCenter, TILE_SIZE } from '../src/util/tile';

describe('Tile utility', () => {
  it('should calculate tile center correctly', () => {
    const result = getTileCenter(0, 0);
    expect(result.x).toBe(TILE_SIZE / 2);
    expect(result.y).toBe(TILE_SIZE / 2);
  });

  it('should calculate tile center for non-zero coordinates', () => {
    const result = getTileCenter(2, 3);
    expect(result.x).toBe(2 * TILE_SIZE + TILE_SIZE / 2);
    expect(result.y).toBe(3 * TILE_SIZE + TILE_SIZE / 2);
  });

  it('should have correct TILE_SIZE constant', () => {
    expect(TILE_SIZE).toBe(16);
  });
});