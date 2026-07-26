import { test, expect } from '@playwright/test';

test('redirectTo survives navigating from sign-in to sign-up and back', async ({ page }) => {
  await page.goto('/patient/dashboard'); // protected route, not logged in
  await expect(page).toHaveURL(/\/sign-in\?redirectTo=/);

  // Only the in-form link carries redirectTo in its href -- the navbar and
  // footer's Sign Up/Sign In links don't. Matching on href substring alone
  // is unambiguous and avoids depending on exact link text/case.
  await page.locator('a[href*="redirectTo"]', { hasText: /sign up/i }).click();
  await expect(page).toHaveURL(/\/sign-up\?redirectTo=%2Fpatient%2Fdashboard/);

  await page.locator('a[href*="redirectTo"]', { hasText: /sign in/i }).click();
  await expect(page).toHaveURL(/\/sign-in\?redirectTo=%2Fpatient%2Fdashboard/);
});