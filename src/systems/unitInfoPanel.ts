import Phaser from "phaser";
import { Unit } from "../components/Unit";
import { ATLAS_KEYS, FONT_KEYS, RPG_UI_FRAMES } from "../assets/keys";
import { extractUnitInfoData } from "./unitInfo";

/**
 * Unit info panel system - handles rendering of unit info panel
 * Displays unit portrait, name, HP, MP with color bars
 */

export interface UnitInfoPanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  portraitSize: number;
  barHeight: number;
  portraitPadding: number;
  textPadding: number;
}

export const DEFAULT_UNIT_INFO_PANEL_CONFIG: UnitInfoPanelConfig = {
  x: 20,
  y: 580, // Bottom left, accounting for padding
  width: 340,
  height: 140,
  portraitSize: 80,
  barHeight: 8,
  portraitPadding: 30,
  textPadding: 10,
};

const FONT_SIZE = 10;
const TEXT_COLOR = 0x121212;
const LABEL_COLOR = 0x333333;
const HP_BAR_COLOR = 0x3cc13b; // Green for HP
const HP_BAR_LOW_COLOR = 0xf13c20; // Red for low HP
const MP_BAR_COLOR = 0x00bfff; // Blue for MP
const BAR_BG_COLOR = 0x333333;

/**
 * Calculate panel layout positions based on config
 */
interface PanelLayout {
  portraitX: number;
  portraitY: number;
  contentX: number;
  contentWidth: number;
  hpY: number;
  hpBarY: number;
  mpY: number;
  mpBarY: number;
}

function calculatePanelLayout(config: UnitInfoPanelConfig): PanelLayout {
  const portraitX = config.portraitPadding;
  const portraitY = -config.height + config.portraitPadding;
  const contentX = portraitX + config.portraitSize + config.textPadding;
  const contentWidth =
    config.width - config.portraitSize - config.textPadding * 10;

  const hpY = portraitY + 24;
  const hpBarY = hpY + 16;
  const mpY = hpBarY + config.barHeight + 8;
  const mpBarY = mpY + 16;

  return {
    portraitX,
    portraitY,
    contentX,
    contentWidth,
    hpY,
    hpBarY,
    mpY,
    mpBarY,
  };
}

/**
 * Create a stat bar (label, value, background, and fill)
 */
interface StatBarElements {
  label: Phaser.GameObjects.BitmapText;
  valueText: Phaser.GameObjects.BitmapText;
  barBg: Phaser.GameObjects.Graphics;
  barFill: Phaser.GameObjects.Graphics;
}

function createStatBar(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  labelText: string,
  valueText: string,
  percentage: number,
  barColor: number,
  layout: {
    x: number;
    y: number;
    barY: number;
    valueX: number;
    width: number;
    barHeight: number;
  }
): StatBarElements {
  // Label
  const label = scene.add.bitmapText(
    layout.x,
    layout.y,
    FONT_KEYS.ARCADE,
    labelText,
    FONT_SIZE
  );
  label.setOrigin(0, 0);
  label.setTint(TEXT_COLOR);
  container.add(label);

  // Value
  const value = scene.add.bitmapText(
    layout.valueX,
    layout.y,
    FONT_KEYS.ARCADE,
    valueText,
    FONT_SIZE
  );
  value.setOrigin(0, 0);
  value.setTint(LABEL_COLOR);
  container.add(value);

  // Bar background
  const barBg = scene.add.graphics();
  barBg.fillStyle(BAR_BG_COLOR, 1);
  barBg.fillRect(layout.x, layout.barY, layout.width, layout.barHeight);
  container.add(barBg);

  // Bar fill
  const barFill = scene.add.graphics();
  barFill.fillStyle(barColor, 1);
  barFill.fillRect(
    layout.x,
    layout.barY,
    layout.width * percentage,
    layout.barHeight
  );
  container.add(barFill);

  return { label, valueText: value, barBg, barFill };
}

/**
 * Update a stat bar fill
 */
function updateStatBarFill(
  barFill: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  percentage: number,
  color: number
): void {
  barFill.clear();
  barFill.fillStyle(color, 1);
  barFill.fillRect(x, y, width * percentage, height);
}

export interface UnitInfoPanelResult {
  container: Phaser.GameObjects.Container;
  portrait: Phaser.GameObjects.Image;
  nameText: Phaser.GameObjects.BitmapText;
  hpLabel: Phaser.GameObjects.BitmapText;
  hpValueText: Phaser.GameObjects.BitmapText;
  hpBarBg: Phaser.GameObjects.Graphics;
  hpBarFill: Phaser.GameObjects.Graphics;
  mpLabel: Phaser.GameObjects.BitmapText;
  mpValueText: Phaser.GameObjects.BitmapText;
  mpBarBg: Phaser.GameObjects.Graphics;
  mpBarFill: Phaser.GameObjects.Graphics;
}

/**
 * Create unit info panel
 */
export function createUnitInfoPanel(
  scene: Phaser.Scene,
  unit: Unit,
  config: UnitInfoPanelConfig = DEFAULT_UNIT_INFO_PANEL_CONFIG
): UnitInfoPanelResult {
  const unitInfo = extractUnitInfoData(unit);
  const layout = calculatePanelLayout(config);

  // Create container at bottom-left position
  const container = scene.add.container(config.x, config.y);
  container.setDepth(150); // Above action menu and other UI

  // Create nineslice background
  const bg = scene.add.nineslice(
    0,
    0,
    ATLAS_KEYS.RPG_UI,
    RPG_UI_FRAMES.PATCH_1,
    config.width,
    config.height,
    32,
    32,
    32,
    32
  );
  bg.setOrigin(0, 1); // Anchor bottom-left
  container.add(bg);

  // Portrait
  const portrait = scene.add.image(
    layout.portraitX,
    layout.portraitY,
    unitInfo.portraitKey
  );
  portrait.setOrigin(0, 0);
  portrait.setDisplaySize(config.portraitSize, config.portraitSize);
  container.add(portrait);

  // Unit name
  const nameText = scene.add.bitmapText(
    layout.contentX,
    layout.portraitY,
    FONT_KEYS.ARCADE,
    unitInfo.name,
    FONT_SIZE
  );
  nameText.setOrigin(0, 0);
  nameText.setTint(TEXT_COLOR);
  container.add(nameText);

  // HP stat bar
  const hpColor = unitInfo.hpPercentage < 0.3 ? HP_BAR_LOW_COLOR : HP_BAR_COLOR;
  const hpValueX = layout.contentX + layout.contentWidth - 60;
  const hpBar = createStatBar(
    scene,
    container,
    "HP",
    unitInfo.hp,
    unitInfo.hpPercentage,
    hpColor,
    {
      x: layout.contentX,
      y: layout.hpY,
      barY: layout.hpBarY,
      valueX: hpValueX,
      width: layout.contentWidth,
      barHeight: config.barHeight,
    }
  );

  // MP stat bar
  const mpValueX = layout.contentX + layout.contentWidth - 60;
  const mpBar = createStatBar(
    scene,
    container,
    "MP",
    unitInfo.mp,
    unitInfo.mpPercentage,
    MP_BAR_COLOR,
    {
      x: layout.contentX,
      y: layout.mpY,
      barY: layout.mpBarY,
      valueX: mpValueX,
      width: layout.contentWidth,
      barHeight: config.barHeight,
    }
  );

  return {
    container,
    portrait,
    nameText,
    hpLabel: hpBar.label,
    hpValueText: hpBar.valueText,
    hpBarBg: hpBar.barBg,
    hpBarFill: hpBar.barFill,
    mpLabel: mpBar.label,
    mpValueText: mpBar.valueText,
    mpBarBg: mpBar.barBg,
    mpBarFill: mpBar.barFill,
  };
}

/**
 * Update unit info panel with new unit data
 */
export function updateUnitInfoPanel(
  panelResult: UnitInfoPanelResult,
  unit: Unit,
  config: UnitInfoPanelConfig = DEFAULT_UNIT_INFO_PANEL_CONFIG
): void {
  const unitInfo = extractUnitInfoData(unit);
  const layout = calculatePanelLayout(config);

  // Update portrait and name
  panelResult.portrait.setTexture(unitInfo.portraitKey);
  panelResult.nameText.setText(unitInfo.name);

  // Update HP value and bar
  panelResult.hpValueText.setText(unitInfo.hp);
  const hpColor = unitInfo.hpPercentage < 0.3 ? HP_BAR_LOW_COLOR : HP_BAR_COLOR;
  updateStatBarFill(
    panelResult.hpBarFill,
    layout.contentX,
    layout.hpBarY,
    layout.contentWidth,
    config.barHeight,
    unitInfo.hpPercentage,
    hpColor
  );

  // Update MP value and bar
  panelResult.mpValueText.setText(unitInfo.mp);
  updateStatBarFill(
    panelResult.mpBarFill,
    layout.contentX,
    layout.mpBarY,
    layout.contentWidth,
    config.barHeight,
    unitInfo.mpPercentage,
    MP_BAR_COLOR
  );
}

/**
 * Show unit info panel
 */
export function showUnitInfoPanel(panelResult: UnitInfoPanelResult): void {
  panelResult.container.setVisible(true);
}

/**
 * Hide unit info panel
 */
export function hideUnitInfoPanel(panelResult: UnitInfoPanelResult): void {
  panelResult.container.setVisible(false);
}

/**
 * Destroy unit info panel
 */
export function destroyUnitInfoPanel(panel: UnitInfoPanelResult | null): void {
  if (panel) {
    panel.container.destroy();
  }
}
