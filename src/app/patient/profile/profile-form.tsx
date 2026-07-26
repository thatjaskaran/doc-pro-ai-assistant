'use client';

import { useState } from 'react';
import { updateProfile, uploadAvatar } from './actions';

export function ProfileForm({
    initialName,
    initialPhone,
    initialImage,
}: {
    initialName: string;
    initialPhone: string;
    initialImage: string | null;
}) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(initialImage);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    async function handleSubmit(formData: FormData) {
        setSubmitting(true);
        setError(null);
        setSuccess(false);
        const result = await updateProfile(formData);
        setSubmitting(false);
        if (result?.error) setError(result.error);
        else setSuccess(true);
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingAvatar(true);
        setError(null);
        const formData = new FormData();
        formData.set('avatar', file);
        const result = await uploadAvatar(formData);
        setUploadingAvatar(false);
        if (result?.error) {
            setError(result.error);
            return;
        }
        if (result?.url) setAvatarPreview(result.url);
    }

    return (
        <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-10">
            {/* Avatar Section */}
            <div className="flex flex-col items-center border-b border-slate-100 pb-8">
                <div className="relative">
                    {avatarPreview ? (
                        <img
                            src={avatarPreview}
                            alt="Profile photo"
                            className="h-28 w-28 rounded-full border-4 border-teal-50 object-cover ring-2 ring-teal-100/80 shadow-sm"
                        />
                    ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-teal-50 font-serif text-3xl font-bold text-teal-800 ring-2 ring-teal-100/80 shadow-sm">
                            {initialName.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>

                <label className="mt-5 cursor-pointer rounded-2xl bg-teal-800 px-5 py-2.5 text-xs font-semibold font-mono text-white shadow-sm transition hover:bg-teal-900 active:scale-95">
                    {uploadingAvatar ? 'Uploading...' : 'Change Profile Photo'}

                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleAvatarChange}
                        disabled={uploadingAvatar}
                        className="hidden"
                    />
                </label>

                <p className="mt-2 text-[11px] font-mono text-slate-500">
                    JPG, PNG or WEBP • Max 5MB
                </p>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="mt-8 space-y-6">
                <div>
                    <label
                        htmlFor="name"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 font-mono"
                    >
                        Full Name
                    </label>

                    <input
                        id="name"
                        name="name"
                        defaultValue={initialName}
                        required
                        minLength={2}
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                </div>

                <div>
                    <label
                        htmlFor="phone"
                        className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-600 font-mono"
                    >
                        Phone Number
                    </label>

                    <input
                        id="phone"
                        name="phone"
                        defaultValue={initialPhone}
                        placeholder="+91 9876543210"
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm font-mono text-slate-900 outline-none transition focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                    />
                </div>

                {error && (
                    <div
                        role="alert"
                        className="rounded-2xl border border-rose-200/80 bg-rose-50/50 p-4 text-xs font-mono text-rose-800 shadow-sm"
                    >
                        {error}
                    </div>
                )}

                {success && (
                    <div
                        role="status"
                        className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-4 text-xs font-mono text-emerald-800 shadow-sm"
                    >
                        ✓ Profile updated successfully.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-teal-800 py-3 text-xs font-semibold font-mono text-white shadow-sm transition hover:bg-teal-900 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                    {submitting ? 'Saving Changes...' : 'Save Changes'}
                </button>
            </form>
        </div>
    );
}