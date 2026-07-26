import { test, expect } from '@playwright/test';

test('lists approved doctors and excludes pending ones', async ({ page }) => {
  await page.goto('/doctors');
  await expect(page.getByText('Dr. Ananya Mehta')).toBeVisible();
  await expect(page.getByText('Dr. Farhan Khan')).not.toBeVisible();
});

test('filtering by specialty updates the URL and the results', async ({ page }) => {
  await page.goto('/doctors');
  await page.waitForSelector('#specialty-filter[data-hydrated="true"]');
  await page.getByLabel('Specialty').selectOption({ label: 'Cardiology' });
  await expect(page).toHaveURL(/specialty=/, { timeout: 10000 });
  await expect(page.getByText('Dr. Ananya Mehta')).toBeVisible();
  await expect(page.getByText('Dr. Karthik Rao')).not.toBeVisible();
});