'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
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

  async function handleLogout() {
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
            className="group flex items-center gap-3 transition-transform duration-150 active:scale-95"
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

          {/* Elevated Floating Navigation Capsule */}
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-slate-50/80 p-1.5 shadow-inner md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-5 py-1.5 text-xs font-semibold text-slate-700 transition-all duration-150 hover:bg-white hover:text-teal-800 hover:shadow-sm"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Action Area */}
          {user ? (
            <div className="flex items-center gap-3">
              {/* User Details */}
              <div className="hidden text-right md:block">
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
            </div>
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

        {/* Eye-catching Accent Line at bottom of Navbar */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-teal-600/40 to-transparent" />
      </nav>
    </header>
  );
}