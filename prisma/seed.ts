import 'dotenv/config';
import { prisma } from '../src/lib/db/prisma';
import { auth } from '../src/lib/auth/auth';
import { createNonPatientUser } from '../src/lib/auth/provision';

async function createUser(email: string, password: string, name: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`  ${email} already exists, skipping creation`);
    return existing;
  }

  // signUpEmail's databaseHooks.user.create.after fires here and creates a
  // PatientProfile immediately, since role is always PATIENT at creation
  // time -- before any later promotion to DOCTOR/ADMIN below. Do not also
  // create a PatientProfile manually after this call; it already exists.
  const result = await auth.api.signUpEmail({ body: { email, password, name } });
  const user = (result as any).user ?? result;

  await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
  return user;
}

// Promotes a seeded fixture account to a non-patient role and removes the
// PatientProfile the sign-up hook created for it -- a doctor/admin account
// has no legitimate use for one, and leaving it around is incorrect data,
// not just harmless clutter.
async function promoteAndStripPatientProfile(userId: string, role: 'DOCTOR' | 'ADMIN') {
  await prisma.user.update({ where: { id: userId }, data: { role } });
  await prisma.patientProfile.deleteMany({ where: { userId } });
}

async function main() {
  console.log('Seeding specialties...');
  const specialtyDefs = [
    { name: 'Cardiology', description: 'Heart and cardiovascular system' },
    { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
    { name: 'General Medicine', description: 'Primary and general care' },
    { name: 'Pediatrics', description: 'Care for infants, children, and adolescents' },
    { name: 'Orthopedics', description: 'Bones, joints, and musculoskeletal system' },
  ];
  const [cardiology, dermatology, generalMedicine, pediatrics, orthopedics] = await Promise.all(
    specialtyDefs.map((s) =>
      prisma.specialty.upsert({ where: { name: s.name }, update: {}, create: s }),
    ),
  );

  console.log('Seeding admin...');
  const adminUser = await createUser('admin@docpro.test', 'AdminPass123!', 'Priya Sharma');
  await promoteAndStripPatientProfile(adminUser.id, 'ADMIN');

  console.log('Seeding doctors...');
  const doctorSeedData = [
    {
      email: 'dr.mehta@docpro.test', password: 'DoctorPass123!', name: 'Dr. Ananya Mehta',
      bio: 'Cardiologist with a focus on preventive heart health.',
      feeCents: 150000, specialties: [cardiology], applicationStatus: 'APPROVED' as const,
    },
    {
      email: 'dr.rao@docpro.test', password: 'DoctorPass123!', name: 'Dr. Karthik Rao',
      bio: 'General physician, 12 years of practice.',
      feeCents: 80000, specialties: [generalMedicine], applicationStatus: 'APPROVED' as const,
    },
    {
      email: 'dr.iyer@docpro.test', password: 'DoctorPass123!', name: 'Dr. Lakshmi Iyer',
      bio: 'Pediatrician specializing in early childhood care.',
      feeCents: 100000, specialties: [pediatrics], applicationStatus: 'APPROVED' as const,
    },
    {
      email: 'dr.khan@docpro.test', password: 'DoctorPass123!', name: 'Dr. Farhan Khan',
      bio: 'Orthopedic surgeon, sports injury focus.',
      feeCents: 200000, specialties: [orthopedics],
      applicationStatus: 'PENDING' as const,
    },
    {
      email: 'dr.kapoor@docpro.test', password: 'DoctorPass123!', name: 'Dr. Neha Kapoor',
      bio: 'Dermatologist, recently applied.',
      feeCents: 120000, specialties: [dermatology],
      applicationStatus: 'PENDING' as const,
    },
  ];

  const doctorProfiles = [];
  for (const d of doctorSeedData) {
    const user = await createUser(d.email, d.password, d.name);
    await promoteAndStripPatientProfile(user.id, 'DOCTOR');
    const profile = await prisma.doctorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: d.bio,
        feeCents: d.feeCents,
        applicationStatus: d.applicationStatus,
        reviewedByUserId: d.applicationStatus === 'APPROVED' ? adminUser.id : null,
        reviewedAt: d.applicationStatus === 'APPROVED' ? new Date() : null,
        specialties: { connect: d.specialties.map((s) => ({ id: s.id })) },
      },
    });
    doctorProfiles.push(profile);
  }

  console.log('Seeding availability (Mon-Fri, 9am-5pm hospital-local, 30 min sessions, 1-2pm lunch)...');
  for (const doctor of doctorProfiles.filter((d) => d.applicationStatus === 'APPROVED')) {
    for (let day = 1; day <= 5; day++) {
      await prisma.doctorAvailability.upsert({
        where: { doctorProfileId_dayOfWeek: { doctorProfileId: doctor.id, dayOfWeek: day } },
        update: {},
        create: {
          doctorProfileId: doctor.id,
          dayOfWeek: day,
          workStart: new Date('1970-01-01T09:00:00Z'),
          workEnd: new Date('1970-01-01T17:00:00Z'),
          breakStart: new Date('1970-01-01T13:00:00Z'),
          breakEnd: new Date('1970-01-01T14:00:00Z'),
          sessionDurationMinutes: 30,
        },
      });
    }
  }

  console.log('Seeding patients...');
  const patient1 = await createUser('patient.demo@docpro.test', 'PatientPass123!', 'Rohan Verma');
  // The sign-up hook already created this row -- fetch and update it, don't create a second one.
  const patient1Profile = await prisma.patientProfile.update({
    where: { userId: patient1.id },
    data: { phone: '+91-9000000001' },
  });

  const patient2 = await createUser('patient.family@docpro.test', 'PatientPass123!', 'Sneha Gupta');
  const patient2Profile = await prisma.patientProfile.update({
    where: { userId: patient2.id },
    data: { phone: '+91-9000000002' },
  });

  let familyMember = await prisma.familyMember.findFirst({
    where: { patientProfileId: patient2Profile.id, fullName: 'Aarav Gupta' },
  });
  if (!familyMember) {
    familyMember = await prisma.familyMember.create({
      data: {
        patientProfileId: patient2Profile.id,
        fullName: 'Aarav Gupta',
        dateOfBirth: new Date('2016-04-12'),
        relationship: 'Son',
      },
    });
  }

  console.log('Seeding sample appointments...');
  const [cardioDoctor, generalDoctor] = doctorProfiles;

  let pastAppointment = await prisma.appointment.findFirst({
    where: { patientProfileId: patient1Profile.id, doctorProfileId: generalDoctor.id, status: 'COMPLETED' },
  });
  if (!pastAppointment) {
    pastAppointment = await prisma.appointment.create({
      data: {
        patientProfileId: patient1Profile.id,
        doctorProfileId: generalDoctor.id,
        bookingSubjectType: 'SELF',
        startUtc: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        durationMinutes: 30,
        status: 'COMPLETED',
        reason: { create: { originalText: 'Recurring headaches over the past two weeks.' } },
        statusHistory: {
          create: [
            { toStatus: 'PENDING', changedByUserId: patient1.id },
            { toStatus: 'CONFIRMED', changedByUserId: generalDoctor.userId },
            { toStatus: 'COMPLETED', changedByUserId: generalDoctor.userId },
          ],
        },
      },
    });

    const existingRating = await prisma.appointmentRating.findUnique({ where: { appointmentId: pastAppointment.id } });
    if (!existingRating) {
      await prisma.appointmentRating.create({
        data: {
          appointmentId: pastAppointment.id,
          patientProfileId: patient1Profile.id,
          doctorProfileId: generalDoctor.id,
          score: 5,
          comment: 'Thorough and patient. Explained everything clearly.',
        },
      });
      await prisma.doctorProfile.update({
        where: { id: generalDoctor.id },
        data: { ratingAverage: 5.0, ratingCount: 1 },
      });
    }
  }

  const existingUpcoming = await prisma.appointment.findFirst({
    where: { patientProfileId: patient2Profile.id, doctorProfileId: cardioDoctor.id, status: 'CONFIRMED' },
  });
  if (!existingUpcoming) {
    await prisma.appointment.create({
      data: {
        patientProfileId: patient2Profile.id,
        doctorProfileId: cardioDoctor.id,
        familyMemberId: familyMember.id,
        bookingSubjectType: 'FAMILY_MEMBER',
        startUtc: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        durationMinutes: 30,
        status: 'CONFIRMED',
        reason: { create: { originalText: 'Follow-up check after a reported irregular heartbeat.' } },
        statusHistory: {
          create: [
            { toStatus: 'PENDING', changedByUserId: patient2.id },
            { toStatus: 'CONFIRMED', changedByUserId: cardioDoctor.userId },
          ],
        },
      },
    });
  }

  const patient1Upcoming = await prisma.appointment.findFirst({
    where: { patientProfileId: patient1Profile.id, doctorProfileId: cardioDoctor.id, status: 'CONFIRMED' },
  });
  if (!patient1Upcoming) {
    await prisma.appointment.create({
      data: {
        patientProfileId: patient1Profile.id,
        doctorProfileId: cardioDoctor.id,
        bookingSubjectType: 'SELF',
        startUtc: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // different time than patient2's, same doctor -- no conflict
        durationMinutes: 30,
        status: 'CONFIRMED',
        reason: { create: { originalText: 'Annual heart checkup, no specific symptoms.' } },
        statusHistory: {
          create: [
            { toStatus: 'PENDING', changedByUserId: patient1.id },
            { toStatus: 'CONFIRMED', changedByUserId: cardioDoctor.userId },
          ],
        },
      },
    });
  }

  console.log('Seeding AI consent for patient1...');
  const existingConsent = await prisma.consentRecord.findFirst({
    where: { patientProfileId: patient1Profile.id, consentType: 'AI_ASSISTANT' },
  });
  if (!existingConsent) {
    await prisma.consentRecord.create({
      data: { patientProfileId: patient1Profile.id, consentType: 'AI_ASSISTANT', policyVersion: 1 },
    });
  }

  console.log('Seed complete.');
  console.log({
    admin: adminUser.email,
    doctors: doctorSeedData.map((d) => d.email),
    patients: [patient1.email, patient2.email],
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });