// src/lib/ai/red-flags.ts
//
// Deterministic, server-side, and checked BEFORE any model call. Each rule
// corresponds to one checkbox on the intake form -- there is no free-text
// parsing here by design (see architecture note above).
export interface RedFlagRule {
  id: string;
  label: string;
  guidance: string;
}

export const RED_FLAG_RULES: RedFlagRule[] = [
  {
    id: 'chest_pain',
    label: 'Chest pain or pressure',
    guidance: 'Chest pain or pressure can indicate a medical emergency. Please seek immediate in-person or emergency care rather than waiting for an appointment.',
  },
  {
    id: 'breathing_difficulty',
    label: 'Difficulty breathing or shortness of breath',
    guidance: 'Difficulty breathing can indicate a medical emergency. Please seek immediate in-person or emergency care.',
  },
  {
    id: 'severe_bleeding',
    label: 'Severe or uncontrolled bleeding',
    guidance: 'Severe bleeding requires immediate emergency care. Please go to the nearest emergency department.',
  },
  {
    id: 'loss_of_consciousness',
    label: 'Fainting, loss of consciousness, or severe confusion',
    guidance: 'These symptoms can indicate a serious medical emergency. Please seek immediate emergency care.',
  },
  {
    id: 'stroke_signs',
    label: 'Sudden numbness, weakness, or difficulty speaking (on one side of the body)',
    guidance: 'These can be signs of a stroke, a medical emergency where every minute matters. Please seek immediate emergency care.',
  },
  {
    id: 'suicidal_ideation',
    label: 'Thoughts of harming yourself or others',
    guidance: 'If you are having thoughts of harming yourself or others, please reach out for immediate support. In India, you can contact the AASRA helpline (91-22-27546669) or go to your nearest emergency department. If you are in immediate danger, please call emergency services.',
  },
];

export function checkRedFlags(selectedIds: string[]): RedFlagRule | null {
  // Returns the FIRST matched rule -- if multiple are checked, the patient
  // still only needs one clear, unambiguous stop message, not a stacked list.
  return RED_FLAG_RULES.find((rule) => selectedIds.includes(rule.id)) ?? null;
}

const RED_FLAG_KEYWORDS: Record<string, string[]> = {
  chest_pain: ['chest pain', 'chest pressure', 'chest tightness'],
  breathing_difficulty: ["can't breathe", 'cant breathe', 'difficulty breathing', 'shortness of breath', 'trouble breathing'],
  severe_bleeding: ['severe bleeding', 'uncontrolled bleeding', "won't stop bleeding", "wont stop bleeding"],
  loss_of_consciousness: ['fainted', 'passed out', 'lost consciousness', 'severe confusion'],
  stroke_signs: ["can't speak", 'cant speak', 'face drooping', 'sudden numbness', 'one side weak'],
  suicidal_ideation: ['kill myself', 'suicide', 'end my life', 'harm myself', 'hurt someone'],
};

// Defense-in-depth, not a replacement for the checkbox screen above. Exact
// substring matching is naive on purpose -- it will occasionally false-
// positive on an unrelated sentence, and that's an acceptable cost, since
// the failure mode is "shown a seek-care message unnecessarily," not harm.
export function checkTextForRedFlags(text: string): RedFlagRule | null {
  const lower = text.toLowerCase();
  for (const rule of RED_FLAG_RULES) {
    const keywords = RED_FLAG_KEYWORDS[rule.id] ?? [];
    if (keywords.some((kw) => lower.includes(kw))) return rule;
  }
  return null;
}