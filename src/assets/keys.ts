/**
 * Asset keys for the game
 * Single source of truth for all asset identifiers
 */

// Atlas keys
export const ATLAS_KEYS = {
  ARCHER: "archer",
  FF7_CLOUD: "ff7-cloud",
  RPG_OW: "rpg-ow",
  RPG_UI: "rpg-ui",
} as const;

// Font keys
export const FONT_KEYS = {
  ARCADE: "arcade",
} as const;

// Generated map JSON keys
export const MAP_KEYS = {
  GENERATED_MAP_1: "map-1",
} as const;

// Animation keys
export const ANIMATION_KEYS = {
  CURSOR_BLINK: "cursor-blink",
} as const;

// Frame keys for RPG overworld sprites
export const RPG_OW_FRAMES = {
  CURSOR_0: "cursor-0",
  CURSOR_1: "cursor-1",
} as const;

// Frame keys for RPG UI sprites
export const RPG_UI_FRAMES = {
  PATCH_1: "patch-1",
  PATCH_2: "patch-2",
} as const;
