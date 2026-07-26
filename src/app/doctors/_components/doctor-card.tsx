import Link from 'next/link';
import Image from 'next/image';

interface DoctorCardProps {
    doctor: {
        id: string;
        bio: string | null;
        feeCents: number;
        ratingAverage: unknown;
        ratingCount: number;
        user: {
            name: string;
            image: string | null;
        };
        specialties: {
            id: string;
            name: string;
        }[];
    };
}

export function DoctorCard({ doctor }: DoctorCardProps) {
    const feeDisplay = (doctor.feeCents / 100).toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    });

    const initials = doctor.user.name
        .split(' ')
        .map((word) => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    return (
        <Link href={`/doctors/${doctor.id}`} className="group block">
            <article className="flex h-full flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-teal-200 hover:shadow-md">
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        {doctor.user.image ? (
                            <Image
                                src={doctor.user.image}
                                alt={doctor.user.name}
                                width={64}
                                height={64}
                                className="h-16 w-16 rounded-2xl object-cover ring-2 ring-teal-50"
                            />
                        ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-lg font-bold text-teal-800 ring-2 ring-teal-100/60 font-serif">
                                {initials}
                            </div>
                        )}

                        <div className="min-w-0 flex-1">
                            <h2 className="truncate text-lg font-serif font-bold text-slate-900 transition-colors group-hover:text-teal-800">
                                {doctor.user.name}
                            </h2>

                            <p className="mt-0.5 text-xs font-semibold text-teal-800 font-mono tracking-wide uppercase">
                                {doctor.specialties.length > 0
                                    ? doctor.specialties.map((s) => s.name).join(', ')
                                    : 'General Practitioner'}
                            </p>
                        </div>
                    </div>

                    {doctor.bio && (
                        <p className="line-clamp-3 text-xs leading-relaxed text-slate-600">
                            {doctor.bio}
                        </p>
                    )}
                </div>

                <div className="mt-6 space-y-5">
                    <div className="flex items-center justify-between rounded-2xl bg-slate-50/80 px-4 py-3 border border-slate-100">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                Consultation Fee
                            </p>
                            <p className="mt-0.5 text-base font-bold text-slate-900 font-mono">
                                {feeDisplay}
                            </p>
                        </div>

                        <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
                                Rating
                            </p>

                            <p className="mt-0.5 text-sm font-bold text-amber-600 font-mono">
                                {doctor.ratingCount > 0
                                    ? `★ ${Number(doctor.ratingAverage).toFixed(1)}`
                                    : 'New'}
                            </p>

                            {doctor.ratingCount > 0 && (
                                <p className="text-[10px] text-slate-400">
                                    {doctor.ratingCount} review
                                    {doctor.ratingCount === 1 ? '' : 's'}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                        <span className="text-xs font-semibold text-slate-500 transition-colors group-hover:text-slate-900">
                            View Profile
                        </span>

                        <span className="rounded-xl bg-teal-800 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all group-hover:bg-slate-900 active:scale-95">
                            Book →
                        </span>
                    </div>
                </div>
            </article>
        </Link>
    );
}