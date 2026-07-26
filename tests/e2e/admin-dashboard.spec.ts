import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/sign-in');
  await page.getByLabel('Email').fill('admin@docpro.test');
  await page.getByLabel('Password').fill('AdminPass123!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL('http://localhost:3000/admin/dashboard', { timeout: 15000 });
});

test('admin can change a doctor application status', async ({ page }) => {
  await page.goto('/admin/doctors');

  // Dr. Kapoor is the seeded fixture reserved for this test to mutate --
  // Dr. Khan must stay untouched, since other tests (doctor-directory,
  // doctor-dashboard) depend on him always remaining PENDING. This test
  // doesn't assume Kapoor's starting state, since a prior run in the same
  // session may have already approved him -- it reads whichever action
  // button is actually present and asserts the resulting status matches.
  const kapoorArticle = page.locator('article').filter({ hasText: 'Dr. Neha Kapoor' });
  await expect(kapoorArticle).toBeVisible();

  const approveButton = kapoorArticle.getByRole('button', { name: 'Approve Doctor' });
  const rejectButton = kapoorArticle.getByRole('button', { name: 'Reject Application' });

  if (await approveButton.isVisible().catch(() => false)) {
    await approveButton.click();
    await expect(kapoorArticle.getByText(/^APPROVED$/)).toBeVisible({ timeout: 10000 });
  } else {
    // Already approved from a prior run this session -- confirm the
    // Reject path still works instead, so the test still verifies a real
    // status-change action rather than a no-op.
    await rejectButton.click();
    await expect(kapoorArticle.getByText(/^REJECTED$/)).toBeVisible({ timeout: 10000 });
  }
});

test('specialty management page lists seeded specialties', async ({ page }) => {
  await page.goto('/admin/specialties');
  await expect(page.getByText('Cardiology')).toBeVisible();
});