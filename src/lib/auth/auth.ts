import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { nextCookies } from 'better-auth/next-js';
import { prisma } from '@/lib/db/prisma';
import { env } from '@/lib/env';

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: 'postgresql' }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'PATIENT', input: false },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          // Only PATIENT-role users get an auto-created profile. Doctor and
          // admin accounts are never created through public sign-up (doctors
          // apply and get promoted by an admin; admins are seeded/manual),
          // so this only fires for the public self-serve path.
          if (user.role === 'PATIENT') {
            await prisma.patientProfile.create({ data: { userId: user.id } });
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});