import { describe, it, expect } from 'vitest';
import {
  createMenuNavigationState,
  activateMenuNavigation,
  deactivateMenuNavigation,
  moveMenuCursorUp,
  moveMenuCursorDown,
  getCurrentMenuIndex,
  isMenuNavigationActive
} from '../src/systems/menuNavigation';

describe('menuNavigationSystem', () => {
  describe('createMenuNavigationState', () => {
    it('creates initial state with correct max index', () => {
      const state = createMenuNavigationState(3);
      expect(state.currentIndex).toBe(0);
      expect(state.maxIndex).toBe(2); // 3 items = max index 2
      expect(state.isActive).toBe(false);
    });
  });

  describe('activateMenuNavigation', () => {
    it('activates navigation and resets to first option', () => {
      let state = createMenuNavigationState(3);
      state = moveMenuCursorDown(state); // This should have no effect when inactive
      state = activateMenuNavigation(state);
      
      expect(state.isActive).toBe(true);
      expect(state.currentIndex).toBe(0);
    });
  });

  describe('deactivateMenuNavigation', () => {
    it('deactivates navigation', () => {
      let state = createMenuNavigationState(3);
      state = activateMenuNavigation(state);
      state = deactivateMenuNavigation(state);
      
      expect(state.isActive).toBe(false);
    });
  });

  describe('moveMenuCursorDown', () => {
    it('moves cursor down when active', () => {
      let state = createMenuNavigationState(3);
      state = activateMenuNavigation(state);
      state = moveMenuCursorDown(state);
      
      expect(state.currentIndex).toBe(1);
    });

    it('wraps to first option when at end', () => {
      let state = createMenuNavigationState(2);
      state = activateMenuNavigation(state);
      state = moveMenuCursorDown(state); // Go to index 1
      state = moveMenuCursorDown(state); // Should wrap to index 0
      
      expect(state.currentIndex).toBe(0);
    });

    it('does nothing when navigation is inactive', () => {
      let state = createMenuNavigationState(3);
      const originalIndex = state.currentIndex;
      state = moveMenuCursorDown(state);
      
      expect(state.currentIndex).toBe(originalIndex);
    });
  });

  describe('moveMenuCursorUp', () => {
    it('moves cursor up when active', () => {
      let state = createMenuNavigationState(3);
      state = activateMenuNavigation(state);
      state = moveMenuCursorDown(state); // Go to index 1
      state = moveMenuCursorUp(state); // Back to index 0
      
      expect(state.currentIndex).toBe(0);
    });

    it('wraps to last option when at beginning', () => {
      let state = createMenuNavigationState(3);
      state = activateMenuNavigation(state);
      state = moveMenuCursorUp(state); // Should wrap to index 2
      
      expect(state.currentIndex).toBe(2);
    });

    it('does nothing when navigation is inactive', () => {
      let state = createMenuNavigationState(3);
      const originalIndex = state.currentIndex;
      state = moveMenuCursorUp(state);
      
      expect(state.currentIndex).toBe(originalIndex);
    });
  });

  describe('getCurrentMenuIndex', () => {
    it('returns current index', () => {
      let state = createMenuNavigationState(3);
      state = activateMenuNavigation(state);
      state = moveMenuCursorDown(state);
      
      expect(getCurrentMenuIndex(state)).toBe(1);
    });
  });

  describe('isMenuNavigationActive', () => {
    it('returns correct active state', () => {
      let state = createMenuNavigationState(3);
      expect(isMenuNavigationActive(state)).toBe(false);
      
      state = activateMenuNavigation(state);
      expect(isMenuNavigationActive(state)).toBe(true);
      
      state = deactivateMenuNavigation(state);
      expect(isMenuNavigationActive(state)).toBe(false);
    });
  });
});