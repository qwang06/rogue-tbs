# Testing Strategy

## Unit
- Test pure logic: systems, state machines, math.
- No Phaser imports in unit tests.

## Integration
- Validate contracts: asset loader, config parsers.

## E2E (Playwright)
- Smoke: boot Preload, load assets, start Game scene.
- Input: simulate basic keys/taps; expect scene transitions and a few entity properties.

## Commands
- `npm test`        # unit/integration
- `npm run test:ui` # e2e smoke
