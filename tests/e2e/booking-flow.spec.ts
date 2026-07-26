import { test, expect } from '@playwright/test';

// Finds the nearest date, starting today, that falls on a weekday the
// seeded doctor actually works (Mon-Fri) -- computed directly rather than
// discovered by clicking through the UI, which avoids any race between
// rapid client-side navigations and the page actually rendering each one.
function nextWeekdayDateString(): string {
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const candidate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const day = candidate.getUTCDay(); // 0=Sun, 6=Sat
    if (day >= 1 && day <= 5) {
      return candidate.toISOString().slice(0, 10);
    }
  }
  throw new Error('No weekday found in the next 7 days -- should be impossible');
}

test('unauthenticated user is redirected to sign-in and back after booking a slot', async ({ page }) => {
  await page.goto('/doctors');
  await page.getByText('Dr. Ananya Mehta').click();
  await expect(page).toHaveURL(/\/doctors\/[a-f0-9-]+$/);

  const currentUrl = new URL(page.url());
  const doctorId = currentUrl.pathname.split('/').pop();
  const targetDate = nextWeekdayDateString();

  await page.goto(`/doctors/${doctorId}?date=${targetDate}`);

  const firstSlot = page.getByRole('list', { name: 'Available time slots' }).getByRole('link').first();
  await expect(firstSlot).toBeVisible({ timeout: 10000 });
  await firstSlot.click();

  await page.waitForURL(/\/sign-in\?redirectTo=/, { timeout: 15000 });

  await page.getByLabel('Email').fill('patient.demo@docpro.test');
  await page.getByLabel('Password').fill('PatientPass123!');
  await page.getByRole('button', { name: /sign in/i }).click();

  await page.waitForURL(/\/booking\//, { timeout: 15000 });
});