# Rogue TBS — Copilot Instructions (TypeScript + Phaser 3)

These guidelines are for GitHub Copilot Agent when working in this repository.  
**Always follow these rules first; only fall back to web search or shell commands when you encounter unexpected cases.**

---

## Project Overview

- **Stack:** TypeScript, Phaser 3, Vite, Vitest, ESLint (flat), Prettier
- **Game:** 2D, turn-based strategy (Fire Emblem style). Roguelike structure.
- **Architecture:** **Functional Core, Imperative Shell**. Logic is decoupled from Rendering.

---

## Repository Tasks (Run Order)

1. `npm install` — ensure it completes successfully.
2. `npm run typecheck` — no TypeScript errors.
3. `npm run lint` — autofix where possible; no remaining lint errors.
4. `npm run format` — keep diffs clean.
5. `npm test` — all tests pass (Vitest).
6. `npm run build` — Vite production build succeeds.

---

## Code & Architecture Rules (STRICT)

### 1. File Layout & Separation

- `src/scenes/` — **The Shell (View).** Phaser code only. Handles Input & Rendering.
- `src/components/` — **The Data.** Plain interfaces/types. NO methods. NO Phaser imports.
- `src/systems/` — **The Logic.** Pure functions `(State, Action) => NewState`. NO Phaser imports.
- `src/assets/` — Asset management and key definitions.

### 2. The "Sync" Protocol (View <-> Logic)

- **Unidirectional Flow:** Scenes listen to `GameModel` events (via Signal/EventBus). Scenes never "ask" for data in the update loop.
- **Input Locking:** The `GameModel` must have a `isBusy` or `inputLocked` state.
  - When an action occurs (e.g., Attack), Logic emits event -> Locks Input.
  - View receives event -> Plays Animation (tween).
  - **Crucial:** When Animation completes, View calls `GameModel.unlock()` or emits `AnimationComplete`.
- **Update Loop:** The Phaser `update()` loop is for **interpolation only**. Never put game rules (e.g., "if HP < 0") inside `update()`.

### 3. Coordinate Systems

- **Grid Space (Logic):** Integers (0,0 to 7,7). Used by Components/Systems.
- **World Space (Pixels):** Floats (32.5, 100.0). Used by Phaser/Tweens.
- **Conversion:** Use specific helper functions (e.g., `gridToWorld(x,y)`) to convert.
  - _Rule:_ Systems never calculate pixels. Scenes never calculate grid logic.

### 4. Asset Safety

- **No Magic Strings:** Never use raw strings for asset keys (e.g., `load.image('player')`).
- **Registry:** All keys must be defined in `src/assets/keys.ts` as `const` or `enum`.
- **Usage:** Usage must look like `scene.add.sprite(x, y, AssetKeys.Units.Warrior)`.

### 5. TypeScript Standards

- **Strict Mode:** No `any`. No `@ts-ignore` unless explicitly approved.
- **Naming:** PascalCase for Classes/Components, camelCase for variables/functions.
- **State:** Prefer `readonly` properties in Components to enforce immutability where possible.

---

## Tooling & Config

- **Vite config:** prefer `vite.config.ts`.
- **Testing:** Write unit tests for `systems/` only. Mock nothing; test pure logic.
- **ESLint/Prettier:** Must be green before PR.

---

## Pull Requests (required)

- PR must pass: `typecheck`, `lint`, `format`, `test`, `build`.
- Include a manual validation note (e.g., "Unit moves to (3,4) and animation plays").

---

## Roadmap Signals for Copilot (Prioritized)

1. **Grid System:** Data structure for the map + Helper to convert Grid <-> World.
2. **Turn State Machine:** Player Phase -> Enemy Phase -> Resolution.
3. **Command Queue:** A system to queue logic events so the View can play them one by one (solving the "Ghost Hit" problem).
