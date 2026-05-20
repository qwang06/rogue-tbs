import Phaser from "phaser";
import { ATLAS_KEYS } from "../../assets/keys";
import { tileToWorldCenter } from "./coordinates";
import type { GeneratedMapData } from "../../util/mapLoader";

export function renderGeneratedMap(
  scene: Phaser.Scene,
  mapData: GeneratedMapData
): void {
  const { mapSize, tileSize, layers } = mapData;
  const mapContainer = scene.add.container(0, 0);

  for (let x = 0; x < mapSize.w; x++) {
    for (let y = 0; y < mapSize.h; y++) {
      const world = tileToWorldCenter(x, y, tileSize);
      const sprite = scene.add.sprite(
        world.x,
        world.y,
        ATLAS_KEYS.RPG_OW,
        layers.base.fill
      );
      sprite.setOrigin(0.5, 0.5);
      mapContainer.add(sprite);
    }
  }

  if (layers.overlay) {
    addLayerTiles(scene, mapContainer, layers.overlay, tileSize, "center");
  }

  if (layers.objects) {
    addLayerTiles(scene, mapContainer, layers.objects, tileSize, "bottom");
  }
}

function addLayerTiles(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  tiles: Array<{ x: number; y: number; tile: string; anchor?: string }>,
  tileSize: number,
  defaultAnchor: "center" | "bottom"
): void {
  tiles.forEach(({ x, y, tile, anchor }) => {
    const world = tileToWorldCenter(x, y, tileSize);
    const sprite = scene.add.sprite(world.x, world.y, ATLAS_KEYS.RPG_OW, tile);

    const anchorType = anchor || defaultAnchor;
    if (anchorType === "bottom") {
      sprite.setOrigin(0.5, 1.0);
    } else {
      sprite.setOrigin(0.5, 0.5);
    }

    container.add(sprite);
  });
}

export function mapCameraBoundsFromData(mapData: GeneratedMapData): {
  width: number;
  height: number;
} {
  return {
    width: mapData.mapSize.w * mapData.tileSize,
    height: mapData.mapSize.h * mapData.tileSize,
  };
}
