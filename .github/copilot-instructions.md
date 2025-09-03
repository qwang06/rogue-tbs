# rogue-tbs

**Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.**

Rogue TBS is a TypeScript/Phaser 3 roguelike turn-based strategy game built with Vite. The application runs in a web browser and shows a pixel art game world with characters that can be controlled via keyboard input.

## Working Effectively

### Bootstrap and build the repository:
1. `npm install` -- takes ~17 seconds. NEVER CANCEL. Set timeout to 60+ minutes.
2. `npm run typecheck` -- takes ~2 seconds. TypeScript compilation check.
3. `npm run lint` -- takes ~1 second. ESLint with automatic fixes.
4. `npm run format` -- takes ~2 seconds. Prettier code formatting.
5. `npm run build` -- takes ~7 seconds. Vite production build.

### Run the application:
- **Development server**: `npm run dev` or `npm start` -- starts Vite dev server at http://localhost:5173/
- **NEVER CANCEL development server during testing** - let it run in background
- The application shows a working Phaser 3 game with pixel art graphics and "HELLO WORLD" text

### Testing:
- **Unit tests**: `npm test` -- takes ~2 seconds. Uses Vitest with Node environment.
- Unit tests cover utility functions, components, and pure TypeScript logic

## Validation Scenarios

**ALWAYS manually validate any changes using these scenarios:**

1. **Basic application functionality**:
   - Run `npm run dev`
   - Navigate to http://localhost:5173/
   - Verify the game loads and shows pixel art with "HELLO WORLD"
   - Test arrow keys (Up, Down, Left, Right) to ensure input is captured

2. **Build validation**:
   - Run `npm run build`
   - Verify `dist/` directory is created with `index.html` and bundled JS
   - Check that build completes without errors (warnings about chunk size are normal)

3. **Code quality validation**:
   - Run `npm run typecheck && npm run lint && npm run format`
   - All commands must pass without errors before committing changes

## Command Timing and Timeouts

**CRITICAL: Set appropriate timeouts and NEVER CANCEL these commands:**

- `npm install`: ~17 seconds (set timeout: 300+ seconds)
- `npm run build`: ~7 seconds (set timeout: 120+ seconds)
- `npm run typecheck`: ~2 seconds (set timeout: 60+ seconds)
- `npm run lint`: ~1 second (set timeout: 60+ seconds)
- `npm run format`: ~2 seconds (set timeout: 60+ seconds)
- `npm test`: ~2 seconds (set timeout: 60+ seconds)

## Repository Structure

### Key directories:
- `src/` -- All TypeScript source code
  - `scenes/` -- Phaser game scenes (Boot, Preload, Menu, Game, UI)
  - `components/` -- Data-only components (no Phaser imports)
  - `systems/` -- Pure functions operating on components
  - `entities/` -- Factory functions for game objects
  - `util/` -- Utility functions
- `tests/` -- Unit tests (Vitest)
- `dist/` -- Build output (created by `npm run build`)
- `public/` -- Static assets served by Vite

### Important files:
- `package.json` -- Scripts and dependencies
- `vite.config.js` -- Vite build configuration
- `tsconfig.json` -- TypeScript configuration
- `vitest.config.ts` -- Unit test configuration
- `eslint.config.js` -- ESLint configuration (modern flat config)
- `.prettierrc.json` -- Prettier formatting rules

## Development Workflow

**Always run these commands in this order before submitting changes:**

1. `npm install` (if dependencies changed)
2. `npm run typecheck`
3. `npm run lint`
4. `npm run format`
5. `npm test`
6. `npm run build`
7. Manually test the application in browser

## Known Issues and Workarounds

- **ESLint warning**: "Module type not specified" warning is expected and can be ignored
- **Vite warning**: "CJS build deprecated" warning is expected and can be ignored
- **Build warning**: Large chunk size warning (>500KB) is expected due to Phaser bundle

## Architecture Notes

The codebase follows a clean architecture pattern:
- **Scenes**: Boot → Preload → Menu → Game → UI flow
- **ECS-like pattern**: Components (data) + Systems (logic) + Entities (factories)
- **State management**: GameModel holds persistent state, scenes communicate via events
- **Testability**: Logic is in pure TypeScript functions, separate from Phaser

## Common Patterns

- No Phaser imports in components/ or unit tests
- Use `src/assets/keys.ts` for asset keys instead of magic strings
- Avoid cross-scene imports, use EventBus or DI patterns
- TypeScript strict mode with explicit return types
- Conventional commit messages: `feat:`, `fix:`, `refactor:`, `test:`, `chore:`, `docs:`