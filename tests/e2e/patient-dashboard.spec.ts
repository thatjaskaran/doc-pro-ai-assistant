import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('patient.demo@docpro.test');
  await page.getByLabel('Password').fill('PatientPass123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL('http://localhost:3000/');
});

test('dashboard shows the seeded upcoming appointment', async ({ page }) => {
  await page.goto('/patient/dashboard');
  await expect(page.getByText('Dr. Ananya Mehta')).toBeVisible(); // seeded upcoming appointment is with Dr. Mehta
});

test('dashboard shows the seeded completed appointment in history', async ({ page }) => {
  await page.goto('/patient/dashboard');
  // Note: patient.demo's seeded COMPLETED appointment is with Dr. Rao, not
  // Dr. Mehta -- check tests/e2e output against your actual seed data if
  // this fails, don't assume the doctor name without checking prisma/seed.ts.
  await expect(page.getByText('Dr. Karthik Rao')).toBeVisible();
});