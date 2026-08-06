'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';

interface NavbarUser {
  name: string;
  role: string;
  image: string | null;
}

const ROLE_LINKS: Record<string, { href: string; label: string }[]> = {
  PATIENT: [
    { href: '/doctors', label: 'Find a Doctor' },
    { href: '/patient/dashboard', label: 'My Appointments' },
    { href: '/patient/profile', label: 'My Profile' },
    { href: '/ai-assist', label: 'AI Assistant' },
  ],
  DOCTOR: [
    { href: '/doctor/dashboard', label: 'Dashboard' },
    { href: '/doctor/availability', label: 'Availability' },
    { href: '/doctor/profile', label: 'My Profile' },
  ],
  ADMIN: [
    { href: '/admin/dashboard', label: 'Overview' },
    { href: '/admin/doctors', label: 'Doctor Applications' },
    { href: '/admin/doctors/performance', label: 'Doctor Performance' },
    { href: '/admin/specialties', label: 'Specialties' },
  ],
};

export function Navbar({ user }: { user: NavbarUser | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Automatically close mobile menu when navigating to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent background body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  async function handleLogout() {
    setIsMobileMenuOpen(false);
    await authClient.signOut();
    router.push('/');
    router.refresh();
  }

  const links = user ? ROLE_LINKS[user.role] ?? [] : [{ href: '/doctors', label: 'Find a Doctor' }];

  return (
    <header className="sticky top-0 z-50">
      {/* Main Navbar */}
      <nav className="relative border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-3">

          {/* Eye-Catching Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 transition-transform duration-150 active:scale-95 z-10"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-900 font-serif text-xl font-bold text-white shadow-md shadow-teal-900/20 ring-2 ring-teal-700/30 group-hover:bg-teal-800 transition-colors">
              D+
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-serif font-bold tracking-tight text-slate-900 group-hover:text-teal-800 transition-colors">
                Doc Pro
              </span>
              <span className="text-[10px] font-bold tracking-wider uppercase text-teal-700 flex items-center gap-1.5 font-mono">
                <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                Medical Care
              </span>
            </div>
          </Link>

          {/* Desktop Elevated Floating Navigation Capsule */}
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1.5 shadow-inner md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-5 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  pathname === link.href
                    ? 'bg-white text-teal-800 shadow-sm font-bold'
                    : 'text-slate-700 hover:bg-white hover:text-teal-800 hover:shadow-sm'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Action Area (Desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                {/* User Details */}
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">
                    {user.name}
                  </p>
                  <span className="inline-block rounded-md bg-teal-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-900 border border-teal-200">
                    {user.role}
                  </span>
                </div>

                {/* Avatar */}
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border-2 border-teal-700/20 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-red-50 hover:border-red-200 hover:text-red-700 active:scale-95"
                >
                  Log Out
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/sign-in"
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Sign In
                </Link>

                <Link
                  href="/sign-up"
                  className="rounded-xl bg-teal-800 px-5 py-2 text-xs font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-slate-900 active:scale-95"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile 3-Line Hamburger Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-700 md:hidden"
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle Navigation Menu"
          >
            <div className="relative flex h-5 w-5 flex-col justify-between">
              <span
                className={`h-0.5 w-full rounded-full bg-slate-800 transition-all duration-300 transform origin-center ${
                  isMobileMenuOpen ? 'translate-y-[9px] rotate-45' : ''
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-slate-800 transition-opacity duration-300 ${
                  isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`h-0.5 w-full rounded-full bg-slate-800 transition-all duration-300 transform origin-center ${
                  isMobileMenuOpen ? '-translate-y-[9px] -rotate-45' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {isMobileMenuOpen && (
          <div className="border-b border-slate-200 bg-white px-4 pt-3 pb-6 shadow-xl md:hidden animate-in slide-in-from-top-2 duration-200">
            {/* User Info Bar (Mobile) */}
            {user && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 p-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name}
                    className="h-10 w-10 rounded-full border border-teal-700/20 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-md">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{user.name}</span>
                  <span className="w-fit rounded-md bg-teal-100/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-900 border border-teal-200">
                    {user.role}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Links List */}
            <div className="space-y-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? 'bg-teal-50 text-teal-900 font-bold border-l-4 border-teal-700'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-teal-800'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Action Buttons */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center justify-center rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 active:scale-[0.98]"
                >
                  Log Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/sign-in"
                    className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/sign-up"
                    className="flex items-center justify-center rounded-xl bg-teal-800 py-2.5 text-xs font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-slate-900"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Eye-catching Accent Line at bottom of Navbar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-teal-600/40 to-transparent" />
      </nav>
    </header>
  );
}