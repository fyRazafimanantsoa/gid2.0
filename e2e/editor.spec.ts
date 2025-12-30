import { test, expect } from '@playwright/test';

test('open gallery, add template and verify editor shows template title', async ({ page }) => {
  await page.goto('/');

  // Open the sidebar gallery button
  const galleryBtn = page.getByRole('button', { name: /View Gallery/i });
  await galleryBtn.click();

  // Wait for gallery modal
  await expect(page.getByText('Workspace Gallery')).toBeVisible();

  // Pick the first template card
  const firstCard = page.locator('.grid button').first();
  const title = await firstCard.locator('h3').innerText();
  await firstCard.click();

  // After selection, Editor should show the new page title
  const titleInput = page.locator('input[placeholder="Draft Context Name"]');
  await expect(titleInput).toHaveValue(title);

  // Ensure at least one block from template appears in editor
  const firstBlock = page.locator('.space-y-4 textarea').first();
  await expect(firstBlock).toBeVisible();
});
