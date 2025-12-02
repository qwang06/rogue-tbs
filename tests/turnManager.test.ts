import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createTurnManagerState,
  getCurrentPhase,
  isPlayerPhase,
  isEnemyPhase,
  getPhaseCount,
  startPlayerPhase,
  endPlayerPhase,
  startEnemyPhase,
  endEnemyPhase,
  nextPhase,
  Phase,
  type TurnManagerState,
} from "../src/systems/turnManager";

describe("turnManager", () => {
  // Spy on console.log to verify phase transition logging
  let consoleLogSpy: any;

  beforeEach(() => {
    consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  describe("createTurnManagerState", () => {
    it("creates initial state with player phase active by default", () => {
      const state = createTurnManagerState();
      expect(state.currentPhase).toBe(Phase.Player);
      expect(state.phaseCount).toBe(0);
    });
  });

  describe("getCurrentPhase", () => {
    it("returns the current phase", () => {
      const state = createTurnManagerState();
      expect(getCurrentPhase(state)).toBe(Phase.Player);
    });
  });

  describe("isPlayerPhase", () => {
    it("returns true when current phase is player", () => {
      const state = createTurnManagerState();
      expect(isPlayerPhase(state)).toBe(true);
    });

    it("returns false when current phase is enemy", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      expect(isPlayerPhase(state)).toBe(false);
    });
  });

  describe("isEnemyPhase", () => {
    it("returns false when current phase is player", () => {
      const state = createTurnManagerState();
      expect(isEnemyPhase(state)).toBe(false);
    });

    it("returns true when current phase is enemy", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      expect(isEnemyPhase(state)).toBe(true);
    });
  });

  describe("getPhaseCount", () => {
    it("returns 0 for initial state", () => {
      const state = createTurnManagerState();
      expect(getPhaseCount(state)).toBe(0);
    });

    it("increments when phases start", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      expect(getPhaseCount(state)).toBe(1);
      state = startPlayerPhase(state);
      expect(getPhaseCount(state)).toBe(2);
    });
  });

  describe("startPlayerPhase", () => {
    it("transitions to player phase", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      state = startPlayerPhase(state);
      expect(getCurrentPhase(state)).toBe(Phase.Player);
    });

    it("increments phase count", () => {
      let state = createTurnManagerState();
      const initialCount = getPhaseCount(state);
      state = startPlayerPhase(state);
      expect(getPhaseCount(state)).toBe(initialCount + 1);
    });

    it("logs phase transition", () => {
      let state = createTurnManagerState();
      state = startPlayerPhase(state);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Starting Player Phase"
      );
    });
  });

  describe("endPlayerPhase", () => {
    it("does not change phase", () => {
      let state = createTurnManagerState();
      const phaseBefore = getCurrentPhase(state);
      state = endPlayerPhase(state);
      expect(getCurrentPhase(state)).toBe(phaseBefore);
    });

    it("logs phase transition", () => {
      let state = createTurnManagerState();
      state = endPlayerPhase(state);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Ending Player Phase"
      );
    });
  });

  describe("startEnemyPhase", () => {
    it("transitions to enemy phase", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      expect(getCurrentPhase(state)).toBe(Phase.Enemy);
    });

    it("increments phase count", () => {
      let state = createTurnManagerState();
      const initialCount = getPhaseCount(state);
      state = startEnemyPhase(state);
      expect(getPhaseCount(state)).toBe(initialCount + 1);
    });

    it("logs phase transition", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Starting Enemy Phase"
      );
    });
  });

  describe("endEnemyPhase", () => {
    it("does not change phase", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      const phaseBefore = getCurrentPhase(state);
      state = endEnemyPhase(state);
      expect(getCurrentPhase(state)).toBe(phaseBefore);
    });

    it("logs phase transition", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      state = endEnemyPhase(state);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Ending Enemy Phase"
      );
    });
  });

  describe("nextPhase", () => {
    it("transitions from player to enemy phase", () => {
      let state = createTurnManagerState();
      expect(isPlayerPhase(state)).toBe(true);

      state = nextPhase(state);
      expect(isEnemyPhase(state)).toBe(true);
    });

    it("transitions from enemy to player phase", () => {
      let state = createTurnManagerState();
      state = startEnemyPhase(state);
      expect(isEnemyPhase(state)).toBe(true);

      state = nextPhase(state);
      expect(isPlayerPhase(state)).toBe(true);
    });

    it("alternates phases correctly over multiple transitions", () => {
      let state = createTurnManagerState();

      // Start: Player
      expect(isPlayerPhase(state)).toBe(true);

      // Transition 1: Player -> Enemy
      state = nextPhase(state);
      expect(isEnemyPhase(state)).toBe(true);

      // Transition 2: Enemy -> Player
      state = nextPhase(state);
      expect(isPlayerPhase(state)).toBe(true);

      // Transition 3: Player -> Enemy
      state = nextPhase(state);
      expect(isEnemyPhase(state)).toBe(true);

      // Transition 4: Enemy -> Player
      state = nextPhase(state);
      expect(isPlayerPhase(state)).toBe(true);
    });

    it("calls end and start methods in correct order", () => {
      let state = createTurnManagerState();

      // From player to enemy
      state = nextPhase(state);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Ending Player Phase"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Starting Enemy Phase"
      );

      consoleLogSpy.mockClear();

      // From enemy to player
      state = nextPhase(state);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Ending Enemy Phase"
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "[TurnManager] Starting Player Phase"
      );
    });

    it("increments phase count on each transition", () => {
      let state = createTurnManagerState();
      const initialCount = getPhaseCount(state);

      state = nextPhase(state);
      expect(getPhaseCount(state)).toBe(initialCount + 1);

      state = nextPhase(state);
      expect(getPhaseCount(state)).toBe(initialCount + 2);

      state = nextPhase(state);
      expect(getPhaseCount(state)).toBe(initialCount + 3);
    });
  });

  describe("phase immutability", () => {
    it("does not mutate original state when transitioning phases", () => {
      const state = createTurnManagerState();
      const originalPhase = state.currentPhase;
      const originalCount = state.phaseCount;

      nextPhase(state);

      // Original state should remain unchanged
      expect(state.currentPhase).toBe(originalPhase);
      expect(state.phaseCount).toBe(originalCount);
    });

    it("returns new state objects for each transition", () => {
      let state = createTurnManagerState();
      const state2 = nextPhase(state);
      const state3 = nextPhase(state2);

      // Each should be a different object
      expect(state).not.toBe(state2);
      expect(state2).not.toBe(state3);
      expect(state).not.toBe(state3);
    });
  });
});
