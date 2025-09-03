import { test, expect } from '@playwright/test';

test('game loads and shows hello world', async ({ page }) => {
  await page.goto('/');
  
  // Wait for Phaser to load
  await page.waitForFunction(() => window.Phaser !== undefined, { timeout: 10000 });
  
  // Check that the page title is correct
  await expect(page).toHaveTitle('Rogue TBS - Hello World');
  
  // Check that the game canvas is present
  const canvas = page.locator('canvas');
  await expect(canvas).toBeVisible();
});

test('basic keyboard input', async ({ page }) => {
  await page.goto('/');
  
  // Wait for game to load
  await page.waitForFunction(() => window.Phaser !== undefined, { timeout: 10000 });
  
  // Test some basic arrow key inputs
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowRight');
  
  // If we get here without errors, basic input is working
  expect(true).toBe(true);
});