import { z } from 'zod';

// Must exactly match your seeded Specialty names (Milestone 1's seed data)
// -- the model selects from this closed list, it never invents a specialty.
export const SPECIALTY_OPTIONS = [
  'Cardiology', 'Dermatology', 'General Medicine', 'Pediatrics', 'Orthopedics',
] as const;

export const aiGuidanceSchema = z.object({
  suggestedSpecialty: z.enum(SPECIALTY_OPTIONS),
  urgencyNote: z.string().max(300),
  patientEducationSummary: z.string().max(600),
  structuredSummary: z.object({
    chiefComplaint: z.string().max(200),
    durationDescription: z.string().max(200),
    additionalContext: z.string().max(400),
  }),
});

export type AiGuidanceResult = z.infer<typeof aiGuidanceSchema>;

// A lightweight, deterministic content check run AFTER Structured Outputs
// already guarantees the JSON shape. This does not replace the prompt-level
// constraints below -- it's a second, independent net that catches the
// model naming a drug/dosage or asserting a diagnosis despite instructions,
// since prompt instructions alone are not a hard guarantee.
export const BANNED_PATTERNS = [
  /\b\d+\s?mg\b/i,
  /\btwice (a|per) day\b/i,
  /\bprescri(be|ption)/i,
  /\byou (have|are diagnosed with)\b/i,
  /\bruled out\b/i,
  /\bdefinitely (is|have)\b/i,
];

export function matchesBannedPattern(text: string): boolean {
  return BANNED_PATTERNS.some((pattern) => pattern.test(text));
}

export function containsBannedContent(result: AiGuidanceResult): boolean {
  const combinedText = [
    result.urgencyNote,
    result.patientEducationSummary,
    result.structuredSummary.chiefComplaint,
    result.structuredSummary.durationDescription,
    result.structuredSummary.additionalContext,
  ].join(' ');
  return matchesBannedPattern(combinedText);
}