'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { isSafeRedirect, getDefaultLandingPath } from '@/lib/auth/redirect';

export function SignInForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message ?? 'Sign in failed');
      return;
    }

    const destination = isSafeRedirect(redirectTo) ? redirectTo : getDefaultLandingPath(data.user.role);
    router.push(destination);
    router.refresh();
  }

  const signUpHref = isSafeRedirect(redirectTo)
    ? `/sign-up?redirectTo=${encodeURIComponent(redirectTo)}`
    : '/sign-up';

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/40 via-stone-50/50 to-white px-4 py-12 text-slate-900 selection:bg-teal-600 selection:text-white">
      <div className="relative w-full max-w-md">
        
        {/* Card Container - Warm Paper Look with Soft Shadow */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15),_0_30px_60px_-10px_rgba(13,148,136,0.1)]">
          
          {/* Header & Logo */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 mb-6 text-xs font-semibold text-teal-800">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Patient & Provider Portal
            </div>

            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-900 text-xl font-bold font-serif text-white shadow-sm">
              D+
            </div>

            <h1 className="text-3xl font-serif font-semibold text-slate-900">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              Sign in to manage appointments on{' '}
              <span className="font-semibold text-teal-800">Doc Pro</span>
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div
              role="alert"
              className="mb-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50/60 p-4 text-xs font-medium text-red-700"
            >
              <svg className="h-4 w-4 shrink-0 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500 font-mono"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                placeholder="patient@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500 font-mono"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-teal-900 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-8 border-t border-slate-100 pt-6 text-center">
            <p className="text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                href={signUpHref}
                className="font-semibold text-teal-800 transition hover:text-teal-900 underline underline-offset-2"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}