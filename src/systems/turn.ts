/**
 * TurnManager system - handles turn-based phase control between player and enemy teams
 * This is a pure data system with no Phaser dependencies for testability
 */

/**
 * Available phase types in the game
 */
export enum Phase {
  Player = "player",
  Enemy = "enemy",
}

/**
 * Turn manager state tracking the current phase and phase history
 */
export interface TurnManagerState {
  currentPhase: Phase;
  phaseCount: number;
}

/**
 * Create initial turn manager state with player's turn active by default
 */
export function createTurnManagerState(): TurnManagerState {
  return {
    currentPhase: Phase.Player,
    phaseCount: 0,
  };
}

/**
 * Get the current active phase
 */
export function getCurrentPhase(state: TurnManagerState): Phase {
  return state.currentPhase;
}

/**
 * Check if it's currently the player's phase
 */
export function isPlayerPhase(state: TurnManagerState): boolean {
  return state.currentPhase === Phase.Player;
}

/**
 * Check if it's currently the enemy's phase
 */
export function isEnemyPhase(state: TurnManagerState): boolean {
  return state.currentPhase === Phase.Enemy;
}

/**
 * Get the total number of phases that have occurred
 */
export function getPhaseCount(state: TurnManagerState): number {
  return state.phaseCount;
}

/**
 * Start the player phase - transitions to player phase and runs start logic
 */
export function startPlayerPhase(state: TurnManagerState): TurnManagerState {
  console.log("[TurnManager] Starting Player Phase");
  return {
    ...state,
    currentPhase: Phase.Player,
    phaseCount: state.phaseCount + 1,
  };
}

/**
 * End the player phase - runs cleanup logic for player phase
 */
export function endPlayerPhase(state: TurnManagerState): TurnManagerState {
  console.log("[TurnManager] Ending Player Phase");
  return state;
}

/**
 * Start the enemy phase - transitions to enemy phase and runs start logic
 */
export function startEnemyPhase(state: TurnManagerState): TurnManagerState {
  console.log("[TurnManager] Starting Enemy Phase");
  return {
    ...state,
    currentPhase: Phase.Enemy,
    phaseCount: state.phaseCount + 1,
  };
}

/**
 * End the enemy phase - runs cleanup logic for enemy phase
 */
export function endEnemyPhase(state: TurnManagerState): TurnManagerState {
  console.log("[TurnManager] Ending Enemy Phase");
  return state;
}

/**
 * Advance to the next phase - alternates between player and enemy phases
 * This is the primary method for phase transitions during gameplay
 */
export function nextPhase(state: TurnManagerState): TurnManagerState {
  const currentPhase = state.currentPhase;

  if (currentPhase === Phase.Player) {
    // End player phase and start enemy phase
    const afterEndPlayer = endPlayerPhase(state);
    return startEnemyPhase(afterEndPlayer);
  } else {
    // End enemy phase and start player phase
    const afterEndEnemy = endEnemyPhase(state);
    return startPlayerPhase(afterEndEnemy);
  }
}
