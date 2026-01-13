export type ExerciseFocus =
  | "Metabolic"
  | "Hormonal Balance"
  | "Bone Density"
  | "Sarcopenia Prevention"
  | "Nervous System Reset";

export type CoachPersona = "Dr. Aris" | "Sloane" | "Jax";

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
  focus_area: ExerciseFocus;
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

/**
 * Generate a single daily exercise protocol row that can be inserted into `exercise_protocols`.
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
): ExerciseProtocolRowInput {
  const derived_from_lis_score = getDerivedLisScore(currentLIS);
  const derived_from_cycle_phase = cyclePhase || null;

  // 1) Stress override
  if (currentLIS.stress > 80) {
    const intensity_level = clamp01(cyclePhase === "Luteal" ? Math.min(0.35, 0.6) : 0.35);
    return {
      title: "Nervous System Reset",
      intensity_level,
      duration_minutes: 20,
      focus_area: "Nervous System Reset",
      coach: "Sloane",
      avatar_state_url: null,
      instructions: [
        { step: 1, action: "2 minutes: slow nasal breathing (4s inhale, 6s exhale).", duration_minutes: 2 },
        { step: 2, action: "8 minutes: gentle yoga flow (cat-cow, child's pose, seated forward fold).", duration_minutes: 8 },
        { step: 3, action: "5 minutes: box breathing (4-4-4-4) or 4-7-8 breathing.", duration_minutes: 5 },
        { step: 4, action: "5 minutes: legs-up-the-wall + body scan to downshift.", duration_minutes: 5 },
      ],
      clinical_evidence: [
        {
          source: "Clinical guidance",
          snippet:
            "Breathwork + low-intensity movement can reduce sympathetic arousal and support stress recovery; suitable when stress is elevated.",
        },
      ],
      derived_from_lis_score,
      derived_from_cycle_phase,
    };
  }

  // 2) GLP-1 -> sarcopenia prevention (resistance focus)
  const glp1 = isGLP1User(userMetadata);
  if (glp1) {
    const baseIntensity = 0.75;
    const intensity_level = clamp01(cyclePhase === "Luteal" ? Math.min(baseIntensity, 0.6) : baseIntensity);
    return {
      title: "Sarcopenia Prevention: Strength Circuit",
      intensity_level,
      duration_minutes: 35,
      focus_area: "Sarcopenia Prevention",
      coach: "Jax",
      avatar_state_url: null,
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
      derived_from_lis_score,
      derived_from_cycle_phase,
    };
  }

  // 3) Default phase-based protocol
  const isLuteal = cyclePhase === "Luteal";
  const isMenstrual = cyclePhase.toLowerCase() === "menstrual";
  const defaultFocus: ExerciseFocus = isMenstrual || isLuteal ? "Hormonal Balance" : "Metabolic";

  const baseIntensity = defaultFocus === "Metabolic" ? 0.75 : 0.55;
  const intensity_level = clamp01(isLuteal ? Math.min(baseIntensity, 0.6) : baseIntensity);

  return {
    title: defaultFocus === "Metabolic" ? "Metabolic Builder: Zone 2 + Intervals" : "Hormonal Balance: Strength + Mobility",
    intensity_level,
    duration_minutes: defaultFocus === "Metabolic" ? 30 : 30,
    focus_area: defaultFocus,
    coach: defaultFocus === "Metabolic" ? "Dr. Aris" : "Sloane",
    avatar_state_url: null,
    instructions:
      defaultFocus === "Metabolic"
        ? [
            { step: 1, action: "5 minutes: easy warm-up walk/cycle.", duration_minutes: 5 },
            { step: 2, action: "15 minutes: Zone 2 steady state (conversational pace).", duration_minutes: 15 },
            { step: 3, action: "6 minutes: 6×(20s brisk / 40s easy).", duration_minutes: 6 },
            { step: 4, action: "4 minutes: cooldown + nasal breathing.", duration_minutes: 4 },
          ]
        : [
            { step: 1, action: "5 minutes: mobility warm-up (hips, thoracic spine).", duration_minutes: 5 },
            { step: 2, action: "15 minutes: moderate full-body strength (2 rounds: squat, row, hinge).", duration_minutes: 15 },
            { step: 3, action: "10 minutes: low-intensity mobility + breath-led cooldown.", duration_minutes: 10 },
          ],
    clinical_evidence: null,
    derived_from_lis_score,
    derived_from_cycle_phase,
  };
}

