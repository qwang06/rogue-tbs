# Contributing Guide

## Dev loop
1. `npm install`
2. `npm run dev` (local server)
3. `npm run typecheck && npm run lint`
4. `npm test` (unit) and `npm run test:ui` (e2e) when applicable

All four should be green before you open/ask for a PR.

## Branch & Commit
- Branch: `feat/<short-name>` or `fix/<short-name>`
- Commit style: Conventional Commits (e.g., `feat: add movement system`)

## PR Requirements
- Checklist at top of PR (see template).
- Keep diff small; include rationale in PR description.
- Include/adjust tests with any behavior change.
- Update docs/DecisionLog.md if you made a notable choice.

## Code Style (must)
- TypeScript strict mode; explicit return types.
- No magic strings for asset keys—use `src/assets/keys.ts`.
- Avoid cross-scene imports; use an EventBus or DI pattern.

## Testing Expectations
- Unit tests for logic.
- E2E smoke for scene boot and critical inputs.
- Fast tests: keep unit tests <1s per file; e2e kept to smoke level.
