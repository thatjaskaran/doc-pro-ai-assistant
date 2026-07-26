'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { isSafeRedirect } from '@/lib/auth/redirect';

export function SignUpForm({ redirectTo }: { redirectTo?: string }) {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error: signUpError } = await authClient.signUp.email({ name, email, password });
        setLoading(false);
        if (signUpError) {
            setError(signUpError.message ?? 'Sign up failed');
            return;
        }
        router.push(isSafeRedirect(redirectTo) ? redirectTo : '/');
        router.refresh();
    }

    const signInHref = isSafeRedirect(redirectTo)
        ? `/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
        : '/sign-in';

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-50/40 via-stone-50/50 to-white px-4 py-12 text-slate-900 selection:bg-teal-600 selection:text-white">
            <div className="relative w-full max-w-md">
                {/* Card Container - Warm Paper Look with Soft Shadow */}
                <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(15,23,42,0.15),_0_30px_60px_-10px_rgba(13,148,136,0.1)] sm:p-10">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-200/80 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                            Patient Registration
                        </div>

                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-900 font-serif text-xl font-bold text-white shadow-sm">
                            D+
                        </div>

                        <h1 className="font-serif text-3xl font-semibold text-slate-900">
                            Create Account
                        </h1>

                        <p className="mt-2 text-sm text-slate-600">
                            Join <span className="font-semibold text-teal-800">Doc Pro</span> to consult with top-tier specialists.
                        </p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div
                            role="alert"
                            className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-4 text-xs font-medium text-rose-700"
                        >
                            <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-slate-500"
                            >
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                                placeholder="Your name.."
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-slate-500"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block font-mono text-xs font-medium uppercase tracking-wider text-slate-500"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-mono text-slate-900 placeholder-slate-400 outline-none transition duration-150 focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-600/10"
                                placeholder="Minimum 8 characters"
                            />
                            <p className="mt-1.5 text-xs text-slate-500">
                                Password must contain at least 8 characters.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center rounded-2xl bg-teal-900 py-3.5 text-xs font-semibold font-mono text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </form>

                    {/* Footer Navigation */}
                    <div className="mt-8 space-y-2.5 border-t border-slate-100 pt-6 text-center text-sm text-slate-600">
                        <p>
                            Already have an account?{' '}
                            <Link
                                href={signInHref}
                                className="font-semibold text-teal-800 underline underline-offset-2 transition hover:text-teal-900"
                            >
                                Sign In
                            </Link>
                        </p>

                        <p className="text-xs text-slate-500">
                            Are you a doctor?{' '}
                            <Link
                                href="/apply/doctor"
                                className="font-semibold text-teal-800 underline underline-offset-2 transition hover:text-teal-900"
                            >
                                Apply here
                            </Link>{' '}
                            instead.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}