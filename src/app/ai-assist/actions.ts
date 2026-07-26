'use server';

import { z } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';

const CURRENT_AI_CONSENT_VERSION = 1;

export async function getAiConsentStatus() {
  const session = await requireRole('PATIENT');
  const patientProfile = await prisma.patientProfile.findUniqueOrThrow({ where: { userId: session.user.id } });

  const consent = await prisma.consentRecord.findFirst({
    where: {
      patientProfileId: patientProfile.id,
      consentType: 'AI_ASSISTANT',
      policyVersion: CURRENT_AI_CONSENT_VERSION,
      revokedAt: null,
    },
  });

  return { hasConsented: !!consent };
}

export async function grantAiConsent() {
  const session = await requireRole('PATIENT');
  const patientProfile = await prisma.patientProfile.findUniqueOrThrow({ where: { userId: session.user.id } });

  await prisma.consentRecord.create({
    data: {
      patientProfileId: patientProfile.id,
      consentType: 'AI_ASSISTANT',
      policyVersion: CURRENT_AI_CONSENT_VERSION,
    },
  });

  return { success: true };
}