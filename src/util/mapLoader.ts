import Phaser from "phaser";
import { ATLAS_KEYS } from "../assets/keys";

/**
 * Interface for AI-generated map format
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
 * Loads and renders an AI-generated map from JSON format
 * @param scene The Phaser scene to render the map in
 * @param mapKey The key used to load the map JSON
 * @returns Map bounds for camera setup
 */
export function loadGeneratedMap(
  scene: Phaser.Scene,
  mapKey: string
): MapBounds {
  // Get the map data from cache
  const mapData = scene.cache.json.get(mapKey) as GeneratedMapData;

  if (!mapData) {
    throw new Error(`Map data not found for key: ${mapKey}`);
  }

  const { mapSize, tileSize, layers } = mapData;

  // Create container for map sprites
  const mapContainer = scene.add.container(0, 0);

  // Fill base layer with default tile
  fillBaseLayer(scene, mapContainer, mapSize, tileSize, layers.base.fill);

  // Add overlay tiles
  if (layers.overlay) {
    addLayerTiles(scene, mapContainer, layers.overlay, tileSize, "center");
  }

  // Add object tiles with anchoring
  if (layers.objects) {
    addLayerTiles(scene, mapContainer, layers.objects, tileSize, "bottom");
  }

  // Return map bounds for camera setup
  return {
    minX: 0,
    minY: 0,
    maxX: mapSize.w - 1,
    maxY: mapSize.h - 1,
  };
}

/**
 * Fills the base layer with the specified tile
 */
function fillBaseLayer(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  mapSize: { w: number; h: number },
  tileSize: number,
  tileName: string
): void {
  for (let x = 0; x < mapSize.w; x++) {
    for (let y = 0; y < mapSize.h; y++) {
      const worldX = x * tileSize + tileSize / 2;
      const worldY = y * tileSize + tileSize / 2;

      const sprite = scene.add.sprite(
        worldX,
        worldY,
        ATLAS_KEYS.RPG_OW,
        tileName
      );
      sprite.setOrigin(0.5, 0.5);
      container.add(sprite);
    }
  }
}

/**
 * Adds tiles from a layer to the map
 */
function addLayerTiles(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  tiles: Array<{ x: number; y: number; tile: string; anchor?: string }>,
  tileSize: number,
  defaultAnchor: "center" | "bottom"
): void {
  tiles.forEach(({ x, y, tile, anchor }) => {
    const worldX = x * tileSize + tileSize / 2;
    const worldY = y * tileSize + tileSize / 2;

    const sprite = scene.add.sprite(worldX, worldY, ATLAS_KEYS.RPG_OW, tile);

    // Set anchor based on tile specification or default
    const anchorType = anchor || defaultAnchor;
    if (anchorType === "bottom") {
      sprite.setOrigin(0.5, 1.0);
    } else {
      sprite.setOrigin(0.5, 0.5);
    }

    container.add(sprite);
  });
}

/**
 * Calculate camera bounds from map dimensions
 */
export function getMapCameraBounds(mapData: GeneratedMapData): {
  width: number;
  height: number;
} {
  return {
    width: mapData.mapSize.w * mapData.tileSize,
    height: mapData.mapSize.h * mapData.tileSize,
  };
}
