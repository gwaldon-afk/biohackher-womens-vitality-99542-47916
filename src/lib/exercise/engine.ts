export type ExerciseFocus =
  | "Metabolic"
  | "Hormonal Balance"
  | "Bone Density"
  | "Sarcopenia Prevention"
  | "Nervous System Reset";

export type CoachPersona = "Dr. Aris" | "Sloane" | "Jax";

export type ExerciseCategory = "Strength" | "Mobility" | "Cardio";

// Mirrors the JSONB shape we store in `exercise_protocols.instructions`
export type ExerciseInstructionStep = {
  step: number;
  action: string;
  duration_minutes?: number;
  notes?: string;
};

// Mirrors the JSONB shape we store in `exercise_protocols.clinical_evidence`
export type ClinicalEvidenceItem = {
  source: string;
  url?: string;
  snippet?: string;
};

/**
 * Matches `exercise_protocols` insertable columns (excluding id/created_at which are DB defaults).
 *
 * Table columns:
 * - title (NOT NULL)
 * - intensity_level (0..1)
 * - duration_minutes (NOT NULL)
 * - focus_area (ENUM)
 * - coach (ENUM)
 * - avatar_state_url (nullable)
 * - instructions (JSONB NOT NULL)
 * - clinical_evidence (JSONB nullable)
 * - derived_from_lis_score (integer nullable)
 * - derived_from_cycle_phase (text nullable)
 * - user_id (nullable FK)
 */
export type ExerciseProtocolRowInput = {
  user_id?: string;
  title: string;
  intensity_level: number;
  duration_minutes: number;
  focus_area: ExerciseFocus; // maps to enum `exercise_focus`
  coach: CoachPersona;
  avatar_state_url?: string | null;
  instructions: ExerciseInstructionStep[];
  clinical_evidence?: ClinicalEvidenceItem[] | null;
  derived_from_lis_score?: number | null;
  derived_from_cycle_phase?: string | null;
};

export type CurrentLIS = {
  // Required by your rule set
  stress: number; // expected 0..100
  // Optional, used for `derived_from_lis_score`
  lis?: number;
  overall?: number;
};

export type UserMetadata = {
  // You called out a specific tag check and an `isGLP1` boolean.
  isGLP1?: boolean;
  tags?: string[];
};

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export type ExerciseProtocolHistoryEntry = {
  created_at: string;
  title: string;
  focus_area: ExerciseFocus;
  instructions: ExerciseInstructionStep[];
};

type GenerateDailyProtocolOptions = {
  /**
   * Recent history (ideally last 28 days; at minimum last 5 entries).
   * Used for variety filtering and 28-day distribution targeting.
   */
  history?: ExerciseProtocolHistoryEntry[];
  /**
   * For deterministic tests. Defaults to `new Date()`.
   */
  now?: Date;
};

function isGLP1User(userMetadata: UserMetadata | undefined) {
  if (!userMetadata) return false;
  if (userMetadata.isGLP1) return true;
  const tags = userMetadata.tags || [];
  return tags.some((t) => t.trim().toLowerCase() === "glp-1");
}

function getDerivedLisScore(currentLIS: CurrentLIS): number | null {
  const candidate = currentLIS.overall ?? currentLIS.lis;
  if (candidate == null) return null;
  const n = Number(candidate);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function normalizeText(s: string) {
  return s
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function primaryInstructionSignature(steps: ExerciseInstructionStep[]) {
  // "Primary instructions" heuristic: the first 2 actions (sorted by step).
  const primary = [...steps]
    .sort((a, b) => (a.step ?? 0) - (b.step ?? 0))
    .slice(0, 2)
    .map((s) => normalizeText(s.action))
    .join(" | ");
  return primary;
}

function categorizeProtocol(input: { focus_area: ExerciseFocus; title: string; instructions: ExerciseInstructionStep[] }): ExerciseCategory {
  switch (input.focus_area) {
    case "Sarcopenia Prevention":
    case "Bone Density":
      return "Strength";
    case "Nervous System Reset":
    case "Hormonal Balance":
      return "Mobility";
    case "Metabolic":
      return "Cardio";
    default: {
      const t = normalizeText(input.title);
      if (t.includes("strength") || t.includes("resistance")) return "Strength";
      if (t.includes("mobility") || t.includes("yoga") || t.includes("breath")) return "Mobility";
      return "Cardio";
    }
  }
}

type Template = {
  title: string;
  focus_area: ExerciseFocus;
  coach: CoachPersona;
  duration_minutes: number;
  base_intensity_level: number; // 0..1
  instructions: ExerciseInstructionStep[];
  clinical_evidence?: ClinicalEvidenceItem[] | null;
};

const TEMPLATES: Record<ExerciseCategory, Template[]> = {
  Strength: [
    {
      title: "Sarcopenia Prevention: Strength Circuit",
      focus_area: "Sarcopenia Prevention",
      coach: "Jax",
      duration_minutes: 35,
      base_intensity_level: 0.75,
      instructions: [
        { step: 1, action: "5 minutes: dynamic warm-up (hips, shoulders, bodyweight squats).", duration_minutes: 5 },
        { step: 2, action: "3 sets: squat pattern (goblet squat) 8–10 reps @ RPE 7.", notes: "Rest 60–90s." },
        { step: 3, action: "3 sets: hinge pattern (RDL) 8–10 reps @ RPE 7.", notes: "Rest 60–90s." },
        { step: 4, action: "3 sets: push (incline push-up or DB press) 8–12 reps.", notes: "Rest 60–90s." },
        { step: 5, action: "3 sets: pull (row) 8–12 reps.", notes: "Rest 60–90s." },
        { step: 6, action: "2 sets: carry/core (farmer carry 30–45s + dead bug 8/side).", notes: "Controlled tempo." },
        { step: 7, action: "Cooldown: 3–5 minutes easy walk + mobility.", duration_minutes: 5 },
      ],
      clinical_evidence: [
        {
          source: "Clinical guidance",
          snippet:
            "Resistance training supports lean mass preservation; especially important when appetite/energy intake may be reduced (e.g., GLP‑1 use).",
        },
      ],
    },
    {
      title: "Strength Builder: Lower + Core",
      focus_area: "Sarcopenia Prevention",
      coach: "Jax",
      duration_minutes: 30,
      base_intensity_level: 0.7,
      instructions: [
        { step: 1, action: "5 minutes: warm-up (glute bridges, hip hinges, bodyweight lunges).", duration_minutes: 5 },
        { step: 2, action: "3 sets: split squat 8/side @ RPE 7.", notes: "Rest 60–90s." },
        { step: 3, action: "3 sets: Romanian deadlift 8–10 reps @ RPE 7.", notes: "Rest 60–90s." },
        { step: 4, action: "3 sets: calf raises 12–15 reps.", notes: "Controlled tempo." },
        { step: 5, action: "Core finisher: plank 3×30–45s + side plank 2×20–30s/side." },
        { step: 6, action: "Cooldown: 5 minutes mobility (hips/hamstrings).", duration_minutes: 5 },
      ],
      clinical_evidence: null,
    },
    {
      title: "Strength Builder: Upper + Posture",
      focus_area: "Bone Density",
      coach: "Dr. Aris",
      duration_minutes: 30,
      base_intensity_level: 0.7,
      instructions: [
        { step: 1, action: "5 minutes: warm-up (band pull-aparts, scapular push-ups).", duration_minutes: 5 },
        { step: 2, action: "3 sets: row 10–12 reps.", notes: "Rest 60–90s." },
        { step: 3, action: "3 sets: overhead press 8–10 reps.", notes: "Rest 60–90s." },
        { step: 4, action: "2–3 sets: push (incline push-up or DB press) 8–12 reps." },
        { step: 5, action: "Posture finisher: face pulls 2×15 + dead hang 2×20–30s (optional)." },
        { step: 6, action: "Cooldown: 5 minutes thoracic + chest mobility.", duration_minutes: 5 },
      ],
      clinical_evidence: null,
    },
  ],
  Mobility: [
    {
      title: "Nervous System Reset",
      focus_area: "Nervous System Reset",
      coach: "Sloane",
      duration_minutes: 20,
      base_intensity_level: 0.35,
      instructions: [
        { step: 1, action: "2 minutes: slow nasal breathing (4s inhale, 6s exhale).", duration_minutes: 2 },
        { step: 2, action: "8 minutes: gentle yoga flow (cat-cow, child's pose, seated forward fold).", duration_minutes: 8 },
        { step: 3, action: "5 minutes: box breathing (4-4-4-4) or 4-7-8 breathing.", duration_minutes: 5 },
        { step: 4, action: "5 minutes: legs-up-the-wall + body scan to downshift.", duration_minutes: 5 },
      ],
      clinical_evidence: [
        {
          source: "Clinical guidance",
          snippet: "Breath-led low-intensity movement is appropriate when stress is elevated.",
        },
      ],
    },
    {
      title: "Hormonal Balance: Strength + Mobility",
      focus_area: "Hormonal Balance",
      coach: "Sloane",
      duration_minutes: 30,
      base_intensity_level: 0.55,
      instructions: [
        { step: 1, action: "5 minutes: mobility warm-up (hips, thoracic spine).", duration_minutes: 5 },
        { step: 2, action: "15 minutes: moderate full-body strength (2 rounds: squat, row, hinge).", duration_minutes: 15 },
        { step: 3, action: "10 minutes: low-intensity mobility + breath-led cooldown.", duration_minutes: 10 },
      ],
      clinical_evidence: null,
    },
    {
      title: "Mobility Flow: Hips + Spine",
      focus_area: "Hormonal Balance",
      coach: "Sloane",
      duration_minutes: 25,
      base_intensity_level: 0.45,
      instructions: [
        { step: 1, action: "5 minutes: diaphragmatic breathing + gentle spinal waves.", duration_minutes: 5 },
        { step: 2, action: "10 minutes: hip mobility sequence (90/90, couch stretch, adductor rocks).", duration_minutes: 10 },
        { step: 3, action: "8 minutes: thoracic mobility + gentle twists (open books, thread-the-needle).", duration_minutes: 8 },
        { step: 4, action: "2 minutes: downshift breathing (inhale 4, exhale 8).", duration_minutes: 2 },
      ],
      clinical_evidence: null,
    },
  ],
  Cardio: [
    {
      title: "Metabolic Builder: Zone 2 + Intervals",
      focus_area: "Metabolic",
      coach: "Dr. Aris",
      duration_minutes: 30,
      base_intensity_level: 0.75,
      instructions: [
        { step: 1, action: "5 minutes: easy warm-up walk/cycle.", duration_minutes: 5 },
        { step: 2, action: "15 minutes: Zone 2 steady state (conversational pace).", duration_minutes: 15 },
        { step: 3, action: "6 minutes: 6×(20s brisk / 40s easy).", duration_minutes: 6 },
        { step: 4, action: "4 minutes: cooldown + nasal breathing.", duration_minutes: 4 },
      ],
      clinical_evidence: null,
    },
    {
      title: "Cardio Builder: Zone 2 Steady",
      focus_area: "Metabolic",
      coach: "Dr. Aris",
      duration_minutes: 30,
      base_intensity_level: 0.7,
      instructions: [
        { step: 1, action: "5 minutes: easy warm-up.", duration_minutes: 5 },
        { step: 2, action: "20 minutes: Zone 2 steady state (nose-breathable, talk in sentences).", duration_minutes: 20 },
        { step: 3, action: "5 minutes: cooldown + gentle stretch.", duration_minutes: 5 },
      ],
      clinical_evidence: null,
    },
    {
      title: "Metabolic Tune-up: Low-Impact Intervals",
      focus_area: "Metabolic",
      coach: "Dr. Aris",
      duration_minutes: 25,
      base_intensity_level: 0.72,
      instructions: [
        { step: 1, action: "5 minutes: easy warm-up walk/cycle.", duration_minutes: 5 },
        { step: 2, action: "12 minutes: 8×(30s brisk / 60s easy).", duration_minutes: 12 },
        { step: 3, action: "8 minutes: Zone 2 recovery + cooldown.", duration_minutes: 8 },
      ],
      clinical_evidence: null,
    },
  ],
};

function selectTemplateAvoidingRepeats(
  candidates: Template[],
  recent: ExerciseProtocolHistoryEntry[],
): Template {
  const recentTitles = new Set(recent.map((r) => normalizeText(r.title)));
  const recentPrimary = new Set(recent.map((r) => primaryInstructionSignature(r.instructions)));

  for (const c of candidates) {
    const titleKey = normalizeText(c.title);
    const primaryKey = primaryInstructionSignature(c.instructions);
    if (!recentTitles.has(titleKey) && !recentPrimary.has(primaryKey)) return c;
  }

  // If everything collides, return the first candidate (best-effort).
  return candidates[0];
}

function compute28DayCategoryTarget(history28: ExerciseProtocolHistoryEntry[]): ExerciseCategory {
  // Target split over a 28-day period:
  // - Strength 40%
  // - Mobility 30%
  // - Cardio 30%
  const ratios: Record<ExerciseCategory, number> = { Strength: 0.4, Mobility: 0.3, Cardio: 0.3 };

  const counts: Record<ExerciseCategory, number> = { Strength: 0, Mobility: 0, Cardio: 0 };
  for (const h of history28) {
    const cat = categorizeProtocol(h);
    counts[cat] += 1;
  }

  // Choose the category with the largest deficit relative to the target ratio.
  const totalSoFar = history28.length;
  const projectedTotal = totalSoFar + 1;

  const deficits = (Object.keys(counts) as ExerciseCategory[]).map((cat) => {
    const target = ratios[cat] * projectedTotal;
    const deficit = target - counts[cat];
    return { cat, deficit };
  });

  deficits.sort((a, b) => b.deficit - a.deficit);
  return deficits[0].cat;
}

/**
 * Generate a single daily exercise protocol row that can be inserted into `exercise_protocols`.
 *
 * Variety filter:
 * - Avoid repeating the same title OR primary instructions within a 7-day window.
 * - We check up to the last 5 entries provided in `options.history` (newest-first recommended).
 *
 * 28-day split:
 * - Over a 28-day period, aim for a 40/30/30 split between Strength/Mobility/Cardio,
 *   unless cycle phase or GLP-1 / stress overrides mandate otherwise.
 *
 * Priority rules:
 * 1) If currentLIS.stress > 80: override all -> "Nervous System Reset" (Yoga/Breathwork)
 * 2) If user is GLP-1: prioritize "Sarcopenia Prevention" with resistance focus
 * 3) If cyclePhase is 'Luteal': cap intensity_level at 0.6
 */
export function generateDailyProtocol(
  currentLIS: CurrentLIS,
  cyclePhase: string,
  userMetadata: UserMetadata,
  options: GenerateDailyProtocolOptions = {},
): ExerciseProtocolRowInput {
  const now = options.now || new Date();
  const derived_from_lis_score = getDerivedLisScore(currentLIS);
  const derived_from_cycle_phase = cyclePhase || null;
  const history = options.history || [];

  // 1) Stress override
  if (currentLIS.stress > 80) {
    const template = TEMPLATES.Mobility[0]; // Nervous System Reset
    const base = template.base_intensity_level;
    const intensity_level = clamp01(cyclePhase === "Luteal" ? Math.min(base, 0.6) : base);
    return {
      title: template.title,
      intensity_level,
      duration_minutes: template.duration_minutes,
      focus_area: template.focus_area,
      coach: template.coach,
      avatar_state_url: null,
      instructions: template.instructions,
      clinical_evidence: template.clinical_evidence ?? null,
      derived_from_lis_score,
      derived_from_cycle_phase,
    };
  }

  // 2) GLP-1 -> sarcopenia prevention (resistance focus)
  const glp1 = isGLP1User(userMetadata);
  if (glp1) {
    // Mandates strength focus; variety filter still applies within Strength templates.
    const template = selectTemplateAvoidingRepeats(TEMPLATES.Strength, getRecentEntries(history, now));
    const intensity_level = clamp01(cyclePhase === "Luteal" ? Math.min(template.base_intensity_level, 0.6) : template.base_intensity_level);
    return {
      title: template.title,
      intensity_level,
      duration_minutes: template.duration_minutes,
      focus_area: template.focus_area,
      coach: template.coach,
      avatar_state_url: null,
      instructions: template.instructions,
      clinical_evidence: template.clinical_evidence ?? null,
      derived_from_lis_score,
      derived_from_cycle_phase,
    };
  }

  const isLuteal = cyclePhase === "Luteal";
  const isMenstrual = cyclePhase.toLowerCase() === "menstrual";

  // "Mandates otherwise" (phase bias): luteal/menstrual => mobility-biased selection.
  // Otherwise, target the 28-day split.
  const targetCategory: ExerciseCategory = isLuteal || isMenstrual ? "Mobility" : compute28DayCategoryTarget(get28DayEntries(history, now));

  const recent = getRecentEntries(history, now);
  const orderedCategories: ExerciseCategory[] =
    targetCategory === "Strength"
      ? ["Strength", "Mobility", "Cardio"]
      : targetCategory === "Mobility"
        ? ["Mobility", "Strength", "Cardio"]
        : ["Cardio", "Strength", "Mobility"];

  let selectedTemplate: Template | null = null;
  for (const cat of orderedCategories) {
    const t = selectTemplateAvoidingRepeats(TEMPLATES[cat], recent);
    // If this template collides but there exists another in this category that doesn't, selector will have picked it.
    // If everything collides, we'll still pick the "best effort" one and stop.
    selectedTemplate = t;
    // Stop once we have a template that doesn't collide (best effort).
    const collides =
      recent.some((r) => normalizeText(r.title) === normalizeText(t.title)) ||
      recent.some((r) => primaryInstructionSignature(r.instructions) === primaryInstructionSignature(t.instructions));
    if (!collides) break;
  }

  const template = selectedTemplate || TEMPLATES.Cardio[0];

  const intensity_level = clamp01(isLuteal ? Math.min(template.base_intensity_level, 0.6) : template.base_intensity_level);

  return {
    title: template.title,
    intensity_level,
    duration_minutes: template.duration_minutes,
    focus_area: template.focus_area,
    coach: template.coach,
    avatar_state_url: null,
    instructions: template.instructions,
    clinical_evidence: template.clinical_evidence ?? null,
    derived_from_lis_score,
    derived_from_cycle_phase,
  };
}

function getRecentEntries(history: ExerciseProtocolHistoryEntry[], now: Date) {
  // Check last 5 entries and also enforce a 7-day window.
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return [...history]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .filter((h) => new Date(h.created_at) >= sevenDaysAgo);
}

function get28DayEntries(history: ExerciseProtocolHistoryEntry[], now: Date) {
  const daysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
  return history.filter((h) => new Date(h.created_at) >= daysAgo);
}

