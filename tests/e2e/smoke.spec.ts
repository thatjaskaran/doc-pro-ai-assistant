import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/./);
});

test('sign-in page renders the form', async ({ page }) => {
  await page.goto('/sign-in');
  await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
});