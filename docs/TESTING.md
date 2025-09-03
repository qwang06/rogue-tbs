# Testing Strategy

## Unit
- Test pure logic: systems, state machines, math.
- No Phaser imports in unit tests.

## Integration
- Validate contracts: asset loader, config parsers.

## Manual Testing
- Boot Preload, load assets, start Game scene in browser.
- Simulate basic keys/taps; check scene transitions and basic functionality.

## Commands
- `npm test`        # unit/integration
