'use client';

import { useState } from 'react';
import { applyAsDoctor } from './actions';

interface Specialty {
    id: string;
    name: string;
}

export function ApplyDoctorForm({ specialties }: { specialties: Specialty[] }) {
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(formData: FormData) {
        setSubmitting(true);
        setError(null);
        const result = await applyAsDoctor(formData);
        // On success this redirects server-side and never returns here.
        setSubmitting(false);
        if (result?.error) setError(result.error);
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
                {/* Full Name */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="name"
                        className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                        Full Name
                    </label>
                    <input
                        id="name"
                        name="name"
                        required
                        minLength={2}
                        placeholder="Dr. Jane Doe"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                </div>

                {/* Email */}
                <div>
                    <label
                        htmlFor="email"
                        className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        required
                        placeholder="doctor@example.com"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-mono text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                </div>

                {/* Password with Eye Toggle */}
                <div>
                    <label
                        htmlFor="password"
                        className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            required
                            minLength={8}
                            placeholder="••••••••"
                            className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-4 pr-11 py-3 text-sm font-mono text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((prev) => !prev)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 focus:outline-none"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? (
                                /* Eye Slash Icon */
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.75}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                                    />
                                </svg>
                            ) : (
                                /* Eye Icon */
                                <svg
                                    className="h-5 w-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.75}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.036 123c1.274 4.057 5.065 7 9.542 7 4.477 0 8.268-2.943 9.542-7-1.274-4.057-5.065-7-9.542-7-4.477 0-8.268 2.943-9.542 7z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Fee */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="feeRupees"
                        className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                        Consultation Fee (₹)
                    </label>
                    <input
                        id="feeRupees"
                        type="number"
                        name="feeRupees"
                        required
                        min={100}
                        max={50000}
                        placeholder="500"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-mono text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                </div>

                {/* Bio */}
                <div className="sm:col-span-2">
                    <label
                        htmlFor="bio"
                        className="mb-2 block font-mono text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                        Professional Bio
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        required
                        minLength={20}
                        maxLength={1000}
                        rows={4}
                        placeholder="Share a brief overview of your background, experience, and clinical focus..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium leading-relaxed text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                </div>
            </div>

            {/* Specialties Section */}
            <fieldset className="rounded-2xl border border-slate-200/80 bg-slate-50/30 p-5">
                <legend className="px-2 font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Specialties
                </legend>
                <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                    {specialties.map((s) => (
                        <label
                            key={s.id}
                            className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 shadow-sm transition hover:border-teal-300 hover:bg-teal-50/30"
                        >
                            <input
                                type="checkbox"
                                name="specialtyIds"
                                value={s.id}
                                className="h-4 w-4 rounded border-slate-300 text-teal-800 focus:ring-teal-500/20"
                            />
                            <span>{s.name}</span>
                        </label>
                    ))}
                </div>
            </fieldset>

            {/* Error Message */}
            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 font-mono text-xs text-rose-800 shadow-sm"
                >
                    {error}
                </div>
            )}

            {/* Submit Button */}
            <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-2xl bg-teal-800 py-3.5 font-mono text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
            >
                {submitting ? 'Submitting Application…' : 'Submit Application'}
            </button>
        </form>
    );
}