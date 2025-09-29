/**
 * Menu navigation system - handles keyboard navigation within menus
 */

export interface MenuNavigationState {
  currentIndex: number;
  maxIndex: number;
  isActive: boolean;
}

/**
 * Create initial menu navigation state
 */
export function createMenuNavigationState(maxIndex: number): MenuNavigationState {
  return {
    currentIndex: 0,
    maxIndex: maxIndex - 1, // Convert count to max index (0-based)
    isActive: false
  };
}

/**
 * Activate menu navigation
 */
export function activateMenuNavigation(state: MenuNavigationState): MenuNavigationState {
  return {
    ...state,
    isActive: true,
    currentIndex: 0 // Reset to first option when activated
  };
}

/**
 * Deactivate menu navigation
 */
export function deactivateMenuNavigation(state: MenuNavigationState): MenuNavigationState {
  return {
    ...state,
    isActive: false
  };
}

/**
 * Move cursor up in menu (with wrapping)
 */
export function moveMenuCursorUp(state: MenuNavigationState): MenuNavigationState {
  if (!state.isActive) return state;
  
  const newIndex = state.currentIndex === 0 
    ? state.maxIndex 
    : state.currentIndex - 1;
    
  return {
    ...state,
    currentIndex: newIndex
  };
}

/**
 * Move cursor down in menu (with wrapping)
 */
export function moveMenuCursorDown(state: MenuNavigationState): MenuNavigationState {
  if (!state.isActive) return state;
  
  const newIndex = state.currentIndex === state.maxIndex 
    ? 0 
    : state.currentIndex + 1;
    
  return {
    ...state,
    currentIndex: newIndex
  };
}

/**
 * Get current selected menu option index
 */
export function getCurrentMenuIndex(state: MenuNavigationState): number {
  return state.currentIndex;
}

/**
 * Check if menu navigation is active
 */
export function isMenuNavigationActive(state: MenuNavigationState): boolean {
  return state.isActive;
}