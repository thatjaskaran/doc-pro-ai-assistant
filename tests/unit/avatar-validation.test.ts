import { describe, it, expect } from 'vitest';
import { validateAvatarFile } from '@/lib/validation/avatar';

describe('validateAvatarFile', () => {
  it('rejects a disallowed file type', () => {
    expect(validateAvatarFile({ type: 'application/pdf', size: 1000 })).toMatch(/JPEG, PNG, or WebP/);
  });
  it('rejects a file over 2MB', () => {
    expect(validateAvatarFile({ type: 'image/png', size: 3 * 1024 * 1024 })).toMatch(/2MB/);
  });
  it('accepts a valid small image', () => {
    expect(validateAvatarFile({ type: 'image/jpeg', size: 500 * 1024 })).toBeNull();
  });
});