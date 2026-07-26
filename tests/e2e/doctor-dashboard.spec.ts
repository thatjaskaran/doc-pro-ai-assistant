import { test, expect } from '@playwright/test';

test('doctor can view upcoming appointments', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('dr.mehta@docpro.test');
  await page.getByLabel('Password').fill('DoctorPass123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('http://localhost:3000/doctor/dashboard'); // now lands directly, no separate goto needed

  await expect(page.getByText('Aarav Gupta')).toBeVisible();
  await expect(page.getByText(/via Sneha Gupta/)).toBeVisible();
});

test('a pending doctor sees an under-review message, not the appointment list', async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('dr.khan@docpro.test');
  await page.getByLabel('Password').fill('DoctorPass123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('http://localhost:3000/doctor/dashboard');

  await expect(page.getByText(/under review/i)).toBeVisible();
});