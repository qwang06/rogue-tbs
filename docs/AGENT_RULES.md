# Agent Rules

You are an AI assistant working *inside this repository*. Follow these rules strictly.

## 0) Operating Principles
- **Small, reviewable changes.** Prefer a sequence of small diffs over one large change.
- **Tests first.** If you add or change logic, add/update tests in the same PR.
- **Ask only if blocking.** If a requirement is ambiguous but not blocking, make the safest assumption and document it in the PR.
- **Never break the dev loop.** `npm run dev`, `npm run typecheck`, `npm run lint`, and `npm test` must pass locally.

## 1) Coding Standards
- Language: **TypeScript** (ES modules).
- Style: obey ESLint/Prettier (don’t override rules in files).
- Return types: **explicit** for exported functions.
- Error handling: no silent `catch`; propagate with context or return `Result`-style objects.
- Logging: use `console.error` for errors; avoid stray `console.log`.

## 2) Phaser Architecture (Baseline)
- Use **Scenes** for high-level flows (`Boot`, `Preload`, `Menu`, `Game`, `UI`).
- Prefer a light **ECS-like composition** for game objects (components for movement, health, input).
- Keep **render code** (Sprites/Animations) separate from **game logic** (systems/components).
- Centralize global state in a `GameModel` (plain TS objects) and pass via scene data or a DI container.
- Events: prefer a dedicated `EventBus` (Phaser Events or a small emitter) over cross-imports.

## 3) Files & Folders
- `src/engine/` — reusable engine utilities (ECS, EventBus, math, timing).
- `src/game/` — game-specific content (scenes, systems, entities, assets config).
- `src/ui/` — UI overlays, HUD, menus.
- `src/assets/` — asset manifests, loaders, keys (no binaries committed if large).
- `tests/` — unit tests; `tests/e2e/` for Playwright/interactive tests.
- Keep each file under ~200–300 LoC where possible; split by concern.

## 4) Testing Rules
- **Unit test** pure logic (systems, math, state machines).
- **Contract tests** for APIs or data loaders.
- **E2E smoke tests**: simple Playwright checks for scene boot, asset load, basic input loop.
- Every new public function/class must have at least one unit test unless trivial (getter/setter).

## 5) Performance & Memory
- Avoid per-frame allocations in update loops (cache vectors, rects, etc.).
- Use object pools for frequently spawned/despawned entities.
- Prefer atlas/spritesheet animations; minimize draw calls where possible.
- Document any algorithm > O(n log n) that runs per frame and justify it.

## 6) Assets & Data
- All assets referenced by **string keys** defined in `src/assets/keys.ts`.
- Preload assets in `PreloadScene` via a **single manifest**; no ad hoc loads in random modules.

## 7) Security & Safety
- No dynamic `eval`/`Function`.
- No network access unless a task explicitly requires it; then isolate to `src/services/` with typed interfaces.

## 8) Git Hygiene
- One topic per branch/PR.
- Commit messages: `feat: …`, `fix: …`, `refactor: …`, `test: …`, `chore: …`, `docs: …`.
- If you touch code, update `CHANGELOG.md` and `docs/DecisionLog.md` if decisions were made.

## 9) When You’re Unsure
- Choose the **least risky** path, annotate rationale in code comments, and add a `// TODO(agent):` note with a suggested follow-up.

## 10) Sprite Animation Rule
- Always use the `idle-0` animation as the default sprite animation for all entities unless a different animation is explicitly required by gameplay or design.
- Define and reference `idle-0` in asset manifests and animation configs.
- Document any exceptions in code comments.
