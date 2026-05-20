import type Phaser from "phaser";

/**
 * Interface for map format
 */
export interface GeneratedMapData {
  mapSize: { w: number; h: number };
  tileSize: number;
  tileset: string;
  defaults: { base: string };
  layers: {
    base: { fill: string };
    overlay?: Array<{ x: number; y: number; tile: string }>;
    objects?: Array<{ x: number; y: number; tile: string; anchor?: string }>;
  };
  rules?: Array<{ if: any; then: string }>;
}

/**
 * Interface for map bounds used by the game
 */
export interface MapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Loads map data from cache
 * @param scene The Phaser scene to read map data from
 * @param mapKey The key used to load the map JSON
 * @returns Parsed map data
 */
export function getGeneratedMapData(
  scene: Phaser.Scene,
  mapKey: string
): GeneratedMapData {
  const mapData = scene.cache.json.get(mapKey) as GeneratedMapData;

  if (!mapData) {
    throw new Error(`Map data not found for key: ${mapKey}`);
  }

  return mapData;
}

/**
 * Calculate map bounds from map dimensions
 */
export function getMapBounds(mapData: GeneratedMapData): MapBounds {
  return {
    minX: 0,
    minY: 0,
    maxX: mapData.mapSize.w - 1,
    maxY: mapData.mapSize.h - 1,
  };
}
