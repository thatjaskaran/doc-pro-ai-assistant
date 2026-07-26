export const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
export const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function validateAvatarFile(file: { type: string; size: number }): string | null {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) return 'Please upload a JPEG, PNG, or WebP image.';
  if (file.size > MAX_AVATAR_BYTES) return 'Image must be smaller than 2MB.';
  return null;
}