import Phaser from "phaser";
import { Unit } from "../components/Unit";
import { ATLAS_KEYS, RPG_UI_FRAMES } from "../assets/keys";
import { extractUnitInfoData } from "./unitInfoSystem";

/**
 * Unit info panel system - handles rendering of FFT-style unit info panel
 * Displays unit portrait, name, HP, MP with color bars
 */

export interface UnitInfoPanelConfig {
  x: number;
  y: number;
  width: number;
  height: number;
  portraitSize: number;
  barHeight: number;
  padding: number;
}

export const DEFAULT_UNIT_INFO_PANEL_CONFIG: UnitInfoPanelConfig = {
  x: 20,
  y: 580, // Bottom left, accounting for padding
  width: 340,
  height: 120,
  portraitSize: 80,
  barHeight: 8,
  padding: 12,
};

const TEXT_COLOR = "#ffffff";
const LABEL_COLOR = "#aaaaaa";
const HP_BAR_COLOR = 0x3cc13b; // Green for HP
const HP_BAR_LOW_COLOR = 0xf13c20; // Red for low HP
const MP_BAR_COLOR = 0x00bfff; // Blue for MP
const BAR_BG_COLOR = 0x333333;

export interface UnitInfoPanelResult {
  container: Phaser.GameObjects.Container;
  portrait: Phaser.GameObjects.Image;
  nameText: Phaser.GameObjects.Text;
  hpLabel: Phaser.GameObjects.Text;
  hpValueText: Phaser.GameObjects.Text;
  hpBarBg: Phaser.GameObjects.Graphics;
  hpBarFill: Phaser.GameObjects.Graphics;
  mpLabel: Phaser.GameObjects.Text;
  mpValueText: Phaser.GameObjects.Text;
  mpBarBg: Phaser.GameObjects.Graphics;
  mpBarFill: Phaser.GameObjects.Graphics;
}

/**
 * Create unit info panel with FFT-style layout
 */
export function createUnitInfoPanel(
  scene: Phaser.Scene,
  unit: Unit,
  config: UnitInfoPanelConfig = DEFAULT_UNIT_INFO_PANEL_CONFIG
): UnitInfoPanelResult {
  const unitInfo = extractUnitInfoData(unit);

  // Create container at bottom-left position
  const container = scene.add.container(config.x, config.y);
  container.setDepth(150); // Above action menu and other UI

  // Create nineslice background using rpg-ui
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

  // Portrait on the left side
  const portraitX = config.padding;
  const portraitY = -config.height + config.padding;
  const portrait = scene.add.image(portraitX, portraitY, unitInfo.portraitKey);
  portrait.setOrigin(0, 0);
  portrait.setDisplaySize(config.portraitSize, config.portraitSize);
  container.add(portrait);

  // Text and bars to the right of portrait
  const contentX = portraitX + config.portraitSize + config.padding;
  const contentWidth = config.width - config.portraitSize - config.padding * 3;

  // Name at the top
  const nameY = portraitY + 8;
  const nameText = scene.add.text(contentX, nameY, unitInfo.name, {
    fontSize: "16px",
    color: TEXT_COLOR,
    fontStyle: "bold",
  });
  nameText.setOrigin(0, 0);
  container.add(nameText);

  // HP section
  const hpY = nameY + 24;
  const hpLabel = scene.add.text(contentX, hpY, "HP", {
    fontSize: "12px",
    color: LABEL_COLOR,
  });
  hpLabel.setOrigin(0, 0);
  container.add(hpLabel);

  const hpValueX = contentX + contentWidth - 60;
  const hpValueText = scene.add.text(hpValueX, hpY, unitInfo.hp, {
    fontSize: "12px",
    color: TEXT_COLOR,
  });
  hpValueText.setOrigin(0, 0);
  container.add(hpValueText);

  // HP bar
  const barY = hpY + 16;
  const hpBarBg = scene.add.graphics();
  hpBarBg.fillStyle(BAR_BG_COLOR, 1);
  hpBarBg.fillRect(contentX, barY, contentWidth, config.barHeight);
  container.add(hpBarBg);

  const hpBarFill = scene.add.graphics();
  const hpColor = unitInfo.hpPercentage < 0.3 ? HP_BAR_LOW_COLOR : HP_BAR_COLOR;
  hpBarFill.fillStyle(hpColor, 1);
  hpBarFill.fillRect(
    contentX,
    barY,
    contentWidth * unitInfo.hpPercentage,
    config.barHeight
  );
  container.add(hpBarFill);

  // MP section
  const mpY = barY + config.barHeight + 8;
  const mpLabel = scene.add.text(contentX, mpY, "MP", {
    fontSize: "12px",
    color: LABEL_COLOR,
  });
  mpLabel.setOrigin(0, 0);
  container.add(mpLabel);

  const mpValueX = contentX + contentWidth - 60;
  const mpValueText = scene.add.text(mpValueX, mpY, unitInfo.mp, {
    fontSize: "12px",
    color: TEXT_COLOR,
  });
  mpValueText.setOrigin(0, 0);
  container.add(mpValueText);

  // MP bar
  const mpBarY = mpY + 16;
  const mpBarBg = scene.add.graphics();
  mpBarBg.fillStyle(BAR_BG_COLOR, 1);
  mpBarBg.fillRect(contentX, mpBarY, contentWidth, config.barHeight);
  container.add(mpBarBg);

  const mpBarFill = scene.add.graphics();
  mpBarFill.fillStyle(MP_BAR_COLOR, 1);
  mpBarFill.fillRect(
    contentX,
    mpBarY,
    contentWidth * unitInfo.mpPercentage,
    config.barHeight
  );
  container.add(mpBarFill);

  return {
    container,
    portrait,
    nameText,
    hpLabel,
    hpValueText,
    hpBarBg,
    hpBarFill,
    mpLabel,
    mpValueText,
    mpBarBg,
    mpBarFill,
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
  const contentX = config.padding + config.portraitSize + config.padding;
  const contentWidth = config.width - config.portraitSize - config.padding * 3;

  // Update portrait
  panelResult.portrait.setTexture(unitInfo.portraitKey);

  // Update name
  panelResult.nameText.setText(unitInfo.name);

  // Update HP value
  panelResult.hpValueText.setText(unitInfo.hp);

  // Update HP bar
  panelResult.hpBarFill.clear();
  const hpColor = unitInfo.hpPercentage < 0.3 ? HP_BAR_LOW_COLOR : HP_BAR_COLOR;
  panelResult.hpBarFill.fillStyle(hpColor, 1);
  const hpBarY =
    panelResult.hpBarBg.y || config.padding + config.portraitSize + 8;
  panelResult.hpBarFill.fillRect(
    contentX,
    hpBarY,
    contentWidth * unitInfo.hpPercentage,
    config.barHeight
  );

  // Update MP value
  panelResult.mpValueText.setText(unitInfo.mp);

  // Update MP bar
  panelResult.mpBarFill.clear();
  panelResult.mpBarFill.fillStyle(MP_BAR_COLOR, 1);
  const mpBarY = hpBarY + config.barHeight + 8;
  panelResult.mpBarFill.fillRect(
    contentX,
    mpBarY,
    contentWidth * unitInfo.mpPercentage,
    config.barHeight
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
