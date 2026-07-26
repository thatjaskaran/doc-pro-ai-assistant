export function isSafeRedirect(path: string | undefined): path is string {
  return !!path && path.startsWith('/') && !path.startsWith('//');
}

export function getDefaultLandingPath(role: string): string {
  switch (role) {
    case 'DOCTOR': return '/doctor/dashboard';
    case 'ADMIN': return '/admin/dashboard';
    default: return '/';
  }
}