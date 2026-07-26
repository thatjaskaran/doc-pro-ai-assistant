'use client';

import { useState } from 'react';
import { updateDoctorProfile, uploadDoctorAvatar } from './actions';

interface Specialty {
  id: string;
  name: string;
}

interface ProfileFormProps {
  initialName: string;
  initialImage: string | null;
  initialBio: string;
  initialFeeRupees: number;
  allSpecialties: Specialty[];
  selectedSpecialtyIds: string[];
}

export function ProfileForm({
  initialName,
  initialImage,
  initialBio,
  initialFeeRupees,
  allSpecialties,
  selectedSpecialtyIds,
}: ProfileFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(initialImage);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    const result = await updateDoctorProfile(formData);
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
    const result = await uploadDoctorAvatar(formData);
    setUploadingAvatar(false);
    if (result?.error) {
      setError(result.error);
      return;
    }
    if (result?.url) setAvatarPreview(result.url);
  }

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-slate-100">
        <div className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-slate-200/80 bg-slate-100 shadow-sm shrink-0">
          {avatarPreview ? (
            <img
              src={avatarPreview}
              alt="Profile photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-teal-50 text-2xl font-serif text-teal-800 font-bold">
              {initialName.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 disabled:pointer-events-none disabled:opacity-50">
            <span>{uploadingAvatar ? 'Uploading image…' : 'Change photo'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarChange}
              disabled={uploadingAvatar}
              className="sr-only"
            />
          </label>
          <p className="text-[11px] text-slate-400">
            JPG, PNG, or WebP. 2MB maximum file size.
          </p>
        </div>
      </div>

      {/* Profile Form */}
      <form action={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Full Name Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              defaultValue={initialName}
              required
              minLength={2}
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Consultation Fee Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Consultation Fee (₹)
            </label>
            <input
              type="number"
              name="feeRupees"
              defaultValue={initialFeeRupees}
              required
              min={100}
              max={50000}
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700"
            />
          </div>

          {/* Professional Bio Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Professional Biography
            </label>
            <textarea
              name="bio"
              defaultValue={initialBio}
              maxLength={1000}
              rows={4}
              placeholder="Provide context regarding your clinical experience, specialties, and care philosophy…"
              className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-xs sm:text-sm text-slate-900 outline-none transition focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700 placeholder:text-slate-400 leading-relaxed"
            />
          </div>

          {/* Specialties Checkbox Group */}
          <fieldset className="space-y-3 pt-2">
            <legend className="block text-xs font-medium text-slate-700 mb-2">
              Clinical Specialties
            </legend>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {allSpecialties.map((s) => {
                const isSelected = selectedSpecialtyIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={`flex items-center gap-3 rounded-2xl border p-3.5 transition cursor-pointer select-none ${
                      isSelected
                        ? 'border-teal-300 bg-teal-50/50 text-teal-950'
                        : 'border-slate-200/80 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-slate-100/50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="specialtyIds"
                      value={s.id}
                      defaultChecked={isSelected}
                      className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-600 focus:ring-offset-0"
                    />
                    <span className="text-xs sm:text-sm font-medium">
                      {s.name}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* Feedback Messages */}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800"
          >
            Profile updated successfully.
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-teal-800 px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-teal-900 active:scale-95 disabled:pointer-events-none disabled:opacity-50"
          >
            {submitting ? 'Saving changes…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}