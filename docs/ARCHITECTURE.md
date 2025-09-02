# Architecture Overview

## High-Level
- **Scenes**: Boot → Preload → Menu → Game → UI
- **Composition**: Simple ECS-like pattern
  - `components/` (data only; no Phaser imports)
  - `systems/` (pure functions operating on components)
  - `entities/` (factory functions that assemble game objects + components)
- **State**: `GameModel` holds persistent game state; scenes read/write via events.

## Data Flow
- Input → System updates `GameModel` → Render systems update Phaser objects.

## Why this shape?
- Testable (logic is in pure TS).
- Replaceable UI (UI scene is thin over state).
- Scalable to new scenes/mechanics without spaghetti.
