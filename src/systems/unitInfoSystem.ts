import { Unit } from "../components/Unit";

/**
 * Unit info system - pure functions for extracting and formatting unit data
 * This is a pure data system with no Phaser dependencies for testability
 */

/**
 * Format HP value for display (e.g., "194 194")
 */
export function formatHpValue(unit: Unit): string {
  return `${unit.stats.hp} ${unit.stats.maxHp}`;
}

/**
 * Format MP value for display (e.g., "33 33")
 */
export function formatMpValue(unit: Unit): string {
  return `${unit.stats.mp} ${unit.stats.maxMp}`;
}

/**
 * Calculate HP percentage for color bar rendering (0.0 to 1.0)
 */
export function calculateHpPercentage(unit: Unit): number {
  if (unit.stats.maxHp === 0) return 0;
  return Math.max(0, Math.min(1, unit.stats.hp / unit.stats.maxHp));
}

/**
 * Calculate MP percentage for color bar rendering (0.0 to 1.0)
 */
export function calculateMpPercentage(unit: Unit): number {
  if (unit.stats.maxMp === 0) return 0;
  return Math.max(0, Math.min(1, unit.stats.mp / unit.stats.maxMp));
}

/**
 * Get unit name for display
 */
export function getUnitName(unit: Unit): string {
  return unit.name;
}

/**
 * Get unit portrait key for rendering
 */
export function getUnitPortraitKey(unit: Unit): string {
  return unit.sprites.portraitKey;
}

/**
 * Interface for unit info data that can be extended with additional fields
 */
export interface UnitInfoData {
  name: string;
  portraitKey: string;
  hp: string;
  mp: string;
  hpPercentage: number;
  mpPercentage: number;
  // Future extensibility: add level, class, CT, etc.
  level?: number;
  unitType?: string;
  // Additional stats can be added here
}

/**
 * Extract all unit info data in a single call for efficiency
 */
export function extractUnitInfoData(unit: Unit): UnitInfoData {
  return {
    name: getUnitName(unit),
    portraitKey: getUnitPortraitKey(unit),
    hp: formatHpValue(unit),
    mp: formatMpValue(unit),
    hpPercentage: calculateHpPercentage(unit),
    mpPercentage: calculateMpPercentage(unit),
    unitType: unit.unitType,
  };
}
