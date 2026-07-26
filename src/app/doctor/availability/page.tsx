import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/session';
import { prisma } from '@/lib/db/prisma';
import { AvailabilityForm } from './availability-form';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function formatTemplateTime(date: Date) {
  return `${String(date.getUTCHours()).padStart(2, '0')}:${String(
    date.getUTCMinutes()
  ).padStart(2, '0')}`;
}

export default async function AvailabilityPage() {
  let session;

  try {
    session = await requireRole('DOCTOR');
  } catch {
    redirect('/sign-in?redirectTo=/doctor/availability');
  }

  const doctorProfile = await prisma.doctorProfile.findUniqueOrThrow({
    where: {
      userId: session.user.id,
    },
    include: {
      availability: true,
    },
  });

  const byDay = new Map(
    doctorProfile.availability.map((availability) => [
      availability.dayOfWeek,
      availability,
    ])
  );

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Weekly Availability
        </h1>

        <p className="mt-2 text-gray-600">
          Configure your working hours, break times, and consultation duration
          for each day of the week.
        </p>
      </div>

      <div className="space-y-6">
        {DAY_NAMES.map((name, dayOfWeek) => {
          const availability = byDay.get(dayOfWeek);

          return (
            <div
              key={dayOfWeek}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <AvailabilityForm
                dayOfWeek={dayOfWeek}
                dayName={name}
                existing={
                  availability
                    ? {
                        workStart: formatTemplateTime(
                          availability.workStart
                        ),
                        workEnd: formatTemplateTime(
                          availability.workEnd
                        ),
                        breakStart: availability.breakStart
                          ? formatTemplateTime(availability.breakStart)
                          : '',
                        breakEnd: availability.breakEnd
                          ? formatTemplateTime(availability.breakEnd)
                          : '',
                        sessionDurationMinutes:
                          availability.sessionDurationMinutes,
                      }
                    : null
                }
              />
            </div>
          );
        })}
      </div>
    </main>
  );
}