import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';

// Every sign-up through Better Auth's signUpEmail is forced to role PATIENT
// (input: false on that additionalField blocks any client override), and
// the databaseHooks.user.create.after hook auto-creates a PatientProfile
// for it. Promoting to DOCTOR/ADMIN afterward means that stray
// PatientProfile has to be removed -- same reasoning as prisma/seed.ts's
// promoteAndStripPatientProfile, kept in one place so both stay in sync.
export async function createNonPatientUser(email: string, password: string, name: string, role: 'DOCTOR' | 'ADMIN') {
  const result = await auth.api.signUpEmail({ body: { email, password, name } });
  const user = (result as any).user ?? result;

  await prisma.user.update({ where: { id: user.id }, data: { role, emailVerified: true } });
  await prisma.patientProfile.deleteMany({ where: { userId: user.id } });

  return user;
}