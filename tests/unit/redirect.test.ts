import { describe, it, expect } from 'vitest';
import { isSafeRedirect, getDefaultLandingPath } from '@/lib/auth/redirect';

describe('getDefaultLandingPath', () => {
  it('sends DOCTOR to the doctor dashboard', () => {
    expect(getDefaultLandingPath('DOCTOR')).toBe('/doctor/dashboard');
  });
  it('sends ADMIN to the admin dashboard', () => {
    expect(getDefaultLandingPath('ADMIN')).toBe('/admin/dashboard');
  });
  it('sends PATIENT to the homepage', () => {
    expect(getDefaultLandingPath('PATIENT')).toBe('/');
  });
});

describe('isSafeRedirect', () => {
  it('rejects protocol-relative URLs', () => {
    expect(isSafeRedirect('//evil.com')).toBe(false);
  });
  it('rejects absolute URLs', () => {
    expect(isSafeRedirect('https://evil.com')).toBe(false);
  });
  it('accepts internal paths', () => {
    expect(isSafeRedirect('/patient/dashboard')).toBe(true);
  });
});