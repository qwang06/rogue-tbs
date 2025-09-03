# Rogue TBS — Copilot Instructions (TypeScript + Phaser 3)

These guidelines are for GitHub Copilot Agent when working in this repository.  
**Always follow these rules first; only fall back to web search or shell commands when you encounter unexpected cases.**

---

## Project Overview
- **Stack:** TypeScript, Phaser 3, Vite, Vitest, ESLint (flat), Prettier
- **Game:** 2D, turn-based strategy (in the vein of *Fire Emblem* / *Final Fantasy Tactics*). Roguelike structure inspired by *Vampire Survivors* (but turn-based).
- **Principles:** Clean Code (small, focused functions), composition over inheritance, testable core logic.

---

## Repository Tasks (Run Order)
1. `npm install` — ensure it completes successfully.
2. `npm run typecheck` — no TypeScript errors.
3. `npm run lint` — autofix where possible; no remaining lint errors.
4. `npm run format` — keep diffs clean.
5. `npm test` — all tests pass (Vitest).
6. `npm run build` — Vite production build succeeds.

> **Notes**
> - Do not rely on fixed duration estimates or kill commands by time. Ensure completion and success instead.
> - Prefer generous timeouts in automation; never cancel long-running tasks prematurely during setup/build.

---

## Run/Validate Locally
- **Dev server:** `npm run dev` (Vite at http://localhost:5173/).
- **Manual smoke test checklist:**
  - App loads without console errors.
  - Pixel art scene renders and displays “HELLO WORLD”.
  - Arrow keys / basic input are captured (no runtime exceptions).
  - Page hot-reload works.

---

## Code & Architecture Rules
- **TypeScript only.** No `.js` sources. TS strict mode; no `any`.
- **File layout (high-level):**
  - `src/scenes/` — Phaser scenes (Boot → Preload → Menu → Game → UI).
  - `src/components/` — plain data-only components (no Phaser imports).
  - `src/systems/` — pure functions operating on components (unit-testable).
  - `src/entities/` — factory functions for game objects/wrappers.
  - `src/util/` — helpers (pure where possible).
- **No Phaser imports** inside `components/`, `systems/`, or unit tests. Keep game logic framework-agnostic.
- **Inter-scene communication:** use an EventBus or explicit dependency injection; avoid direct cross-scene imports.
- **State management:** central `GameModel` (serializable) for persistent state; scenes read/update via events or injected services.
- **Physics:** **Do not enable** Arcade/Matter unless a ticket explicitly asks for it.
- **Config:** Use `src/config.ts` as the single source for game configuration (type, width/height, backgroundColor, scenes, etc.).
- **Naming/style:** PascalCase for classes, camelCase for variables/functions; descriptive names; small focused functions; early returns over deep nesting.
- **Magic strings:** Put asset keys in `src/assets/keys.ts`.

---

## Tooling & Config
- **Vite config:** prefer `vite.config.ts` (typed, consistent with TS).
- **Testing:** write unit tests for `systems/` and utilities. Avoid DOM/Phaser coupling in tests.
- **ESLint/Prettier:** keep both green locally before committing.

---

## Pull Requests (required)
- Reference the issue (e.g., `Closes #123`).
- Include a concise summary and any architectural notes.
- PR must pass: `typecheck`, `lint`, `format`, `test`, `build`.
- Include a short **manual validation note** (URL loaded, text visible, input works, no console errors).
- Keep PRs **small and focused** (single responsibility).

---

## Conventional Commits
Use: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`. Example:  
`feat: add config.ts and bootstrap Game with modular scene list`

---

## Known Warnings (OK to Ignore)
- Vite chunk size >500KB (Phaser bundling).
- Any ESLint “module type not specified” warning that is already accepted in the repo baseline.

---

## Roadmap Signals for Copilot (don’t act unless an issue requests)
- Tilemaps & grid rendering (Phaser tilemaps or custom grid).
- Turn manager (phase system: player → enemy → cleanup).
- Pathfinding (A* on grid, cost maps).
- Data-driven units (JSON) and composition-based abilities.
- UI overlays (turn order, action menu, combat forecast).
