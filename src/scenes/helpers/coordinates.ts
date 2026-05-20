import { TILE_SIZE } from "../../util/tile";

export interface WorldPosition {
  x: number;
  y: number;
}

export function tileToWorldCenter(
  tileX: number,
  tileY: number,
  tileSize: number = TILE_SIZE
): WorldPosition {
  const offset = tileSize / 2;
  return {
    x: tileX * tileSize + offset,
    y: tileY * tileSize + offset,
  };
}
