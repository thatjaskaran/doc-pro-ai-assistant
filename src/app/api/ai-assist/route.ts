import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '@/lib/db/prisma';
import { requireRole } from '@/lib/auth/session';
import { gemini } from '@/lib/ai/gemini-client';
import { aiGuidanceSchema, containsBannedContent, matchesBannedPattern, SPECIALTY_OPTIONS } from '@/lib/ai/schema';
import { SYSTEM_PROMPT } from '@/lib/ai/system-prompt';
import { checkRedFlags, checkTextForRedFlags } from '@/lib/ai/red-flags';
import { searchDoctors } from '@/lib/doctors/repository';

const chatMessageSchema = z.object({ role: z.enum(['user', 'assistant']), content: z.string().max(1000) });

const requestSchema = z.discriminatedUnion('mode', [
  z.object({ mode: z.literal('screen'), redFlagIds: z.array(z.string()) }),
  z.object({ mode: z.literal('chat'), message: z.string().min(1).max(1000), history: z.array(chatMessageSchema).max(20) }),
  z.object({ mode: z.literal('summary'), history: z.array(chatMessageSchema).max(20) }),
]);

async function logAudit(patientProfileId: string, extra: Partial<{
  redFlagRuleId: string; redFlagTriggered: boolean; outputValidated: boolean;
  inputHash: string; promptTokens: number; completionTokens: number;
}>) {
  await prisma.aiInteractionAuditLog.create({ data: { patientProfileId, redFlagTriggered: false, ...extra } });
}

export async function POST(request: NextRequest) {
  let patientProfileId: string;
  try {
    const session = await requireRole('PATIENT');
    const patientProfile = await prisma.patientProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
    const consent = await prisma.consentRecord.findFirst({
      where: { patientProfileId: patientProfile.id, consentType: 'AI_ASSISTANT', revokedAt: null },
    });
    if (!consent) return NextResponse.json({ error: 'AI assistant consent required.' }, { status: 403 });
    patientProfileId = patientProfile.id;
  } catch {
    return NextResponse.json({ error: 'Please sign in to use the AI assistant.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid request.' }, { status: 400 });
  }
  const data = parsed.data;

  if (data.mode === 'screen') {
    const match = checkRedFlags(data.redFlagIds);
    if (match) {
      await logAudit(patientProfileId, { redFlagRuleId: match.id, redFlagTriggered: true });
      return NextResponse.json({ redFlag: true, guidance: match.guidance });
    }
    return NextResponse.json({ redFlag: false });
  }

  if (!gemini) {
    return NextResponse.json({ error: 'AI assistant is not configured on this server.' }, { status: 503 });
  }

  if (data.mode === 'chat') {
    // Re-checked on EVERY message, not just once at the start -- new
    // symptoms can surface mid-conversation.
    const textMatch = checkTextForRedFlags(data.message);
    if (textMatch) {
      await logAudit(patientProfileId, { redFlagRuleId: textMatch.id, redFlagTriggered: true });
      return NextResponse.json({ redFlag: true, guidance: textMatch.guidance });
    }

    const inputHash = crypto.createHash('sha256').update(data.message).digest('hex');
    try {
      const conversationText = [...data.history, { role: 'user' as const, content: data.message }]
        .map((m) => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`)
        .join('\n');

      const response = await gemini.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: `${SYSTEM_PROMPT}\n\nConversation so far:\n${conversationText}\n\nRespond to the patient's latest message conversationally, in 2-3 sentences, staying strictly within the rules above.`,
      });

      const replyText = response.text ?? '';
      // Every free-text reply is filtered before ever reaching the patient
      // -- unlike the 'summary' mode's Structured Outputs guarantee, plain
      // conversational replies have no schema constraining them, so this
      // check is the only thing standing between the raw model output and
      // the UI here.
      if (!replyText || matchesBannedPattern(replyText)) {
        await logAudit(patientProfileId, { outputValidated: false, inputHash });
        return NextResponse.json({
          redFlag: false,
          reply: "I'm not able to comment on that specifically — it would be best to discuss this directly with a doctor.",
        });
      }

      await logAudit(patientProfileId, {
        outputValidated: true, inputHash,
        promptTokens: response.usageMetadata?.promptTokenCount,
        completionTokens: response.usageMetadata?.candidatesTokenCount,
      });
      return NextResponse.json({ redFlag: false, reply: replyText });
    } catch (err) {
      console.error('AI chat error:', err);
      await logAudit(patientProfileId, { outputValidated: false, inputHash });
      return NextResponse.json({ error: 'The AI assistant is temporarily unavailable.' }, { status: 502 });
    }
  }

  // mode === 'summary'
  const allUserText = data.history.filter((m) => m.role === 'user').map((m) => m.content).join(' ');
  const textMatch = checkTextForRedFlags(allUserText);
  if (textMatch) {
    await logAudit(patientProfileId, { redFlagRuleId: textMatch.id, redFlagTriggered: true });
    return NextResponse.json({ redFlag: true, guidance: textMatch.guidance });
  }
  if (allUserText.trim().length < 10) {
    return NextResponse.json({ error: 'Please share a bit more detail before requesting a summary.' }, { status: 400 });
  }

  const inputHash = crypto.createHash('sha256').update(allUserText).digest('hex');
  try {
    const response = await gemini.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `${SYSTEM_PROMPT}\n\nFull patient conversation:\n${allUserText}\n\nAvailable specialties: ${SPECIALTY_OPTIONS.join(', ')}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            suggestedSpecialty: { type: 'string', enum: [...SPECIALTY_OPTIONS] },
            urgencyNote: { type: 'string' },
            patientEducationSummary: { type: 'string' },
            structuredSummary: {
              type: 'object',
              properties: {
                chiefComplaint: { type: 'string' },
                durationDescription: { type: 'string' },
                additionalContext: { type: 'string' },
              },
              required: ['chiefComplaint', 'durationDescription', 'additionalContext'],
            },
          },
          required: ['suggestedSpecialty', 'urgencyNote', 'patientEducationSummary', 'structuredSummary'],
        },
      },
    });

    let rawParsed: unknown;
    try {
      rawParsed = JSON.parse(response.text ?? '');
    } catch {
      await logAudit(patientProfileId, { outputValidated: false, inputHash });
      return NextResponse.json({ error: 'Could not generate guidance. Please try again.' }, { status: 502 });
    }

    const zodResult = aiGuidanceSchema.safeParse(rawParsed);
    if (!zodResult.success) {
      await logAudit(patientProfileId, { outputValidated: false, inputHash });
      return NextResponse.json({ error: 'Could not generate guidance. Please try again.' }, { status: 502 });
    }
    const result = zodResult.data;

    if (containsBannedContent(result)) {
      await logAudit(patientProfileId, { outputValidated: false, inputHash });
      return NextResponse.json({ error: 'Could not generate appropriate guidance. Please consult a doctor directly.' }, { status: 502 });
    }

    const specialtyRow = await prisma.specialty.findUnique({ where: { name: result.suggestedSpecialty } });
    const suggestedDoctors = specialtyRow
      ? (await searchDoctors({ specialtyId: specialtyRow.id, sort: 'rating' })).doctors.slice(0, 3)
      : [];

    await logAudit(patientProfileId, {
      outputValidated: true, inputHash,
      promptTokens: response.usageMetadata?.promptTokenCount,
      completionTokens: response.usageMetadata?.candidatesTokenCount,
    });

    return NextResponse.json({ redFlag: false, result, suggestedDoctors });
  } catch (err) {
    console.error('AI summary error:', err);
    await logAudit(patientProfileId, { outputValidated: false, inputHash });
    return NextResponse.json({ error: 'The AI assistant is temporarily unavailable.' }, { status: 502 });
  }
}