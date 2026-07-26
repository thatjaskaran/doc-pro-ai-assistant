import { test, expect } from '@playwright/test';

test('logout signs the user out and hides authenticated nav links', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('patient.demo@docpro.test');
  await page.getByLabel('Password').fill('PatientPass123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('http://localhost:3000/', { timeout: 15000 });

  const nav = page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: 'My Appointments', exact: true })).toBeVisible();

  await page.getByRole('button', { name: /log out/i }).click();

  await expect(nav.getByRole('link', { name: 'Sign In' })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'My Appointments', exact: true })).not.toBeVisible();

  await page.goto('/patient/dashboard');
  await expect(page).toHaveURL(/\/sign-in/);
});