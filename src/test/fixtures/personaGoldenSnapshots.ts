import type { TestPersona } from "@/config/mockTestPersonas";

/**
 * Golden snapshots are deterministic fixtures we assert on for a few personas.
 * They model the *shape* of Edge Function outputs used by the UI (not prose accuracy).
 */

export type CrossAssessmentInsightFixture = {
  recommendations: {
    completed_count: number;
    generated_at: string;
    top_priorities: Array<{ pillar: "BODY" | "BRAIN" | "BALANCE" | "BEAUTY"; why: string }>;
    next_steps: string[];
  };
};

export type AssessmentAnalysisFixture = {
  overall_analysis: string;
  key_findings: Array<{ category: string; severity: "low" | "medium" | "high"; finding: string }>;
  personalized_insights: Array<string>;
  expires_at: string;
  created_at: string;
  fromCache?: boolean;
};

export const GOLDEN_PERSONA_IDS = ["test1", "test5", "test9"] as const;
export type GoldenPersonaId = (typeof GOLDEN_PERSONA_IDS)[number];

export function buildCrossAssessmentFixture(persona: TestPersona): CrossAssessmentInsightFixture {
  // Keep this deterministic and lightweight: tie it to persona scores so it feels “real”.
  const bodyWeight =
    persona.lisData.activityScore <= 40 || persona.lisData.nutritionScore <= 40 ? "BODY" : "BALANCE";
  const brainWeight = persona.lisData.stressScore <= 45 ? "BRAIN" : "BEAUTY";

  return {
    recommendations: {
      completed_count: 3,
      generated_at: "2026-01-13T00:00:00.000Z",
      top_priorities: [
        { pillar: bodyWeight as any, why: "Strengthen your foundation with consistent movement + recovery." },
        { pillar: brainWeight as any, why: "Reduce cognitive load and stabilize stress inputs." },
        { pillar: "BALANCE", why: "Support sleep and downshift so the plan stays sustainable." },
      ],
      next_steps: [
        "Start a 28-day Reinvention Cycle.",
        "Pick 1 non-negotiable habit for Week 1.",
        "Retake a daily check-in 3x/week to quantify change.",
      ],
    },
  };
}

export function buildAssessmentAnalysisFixture(persona: TestPersona): AssessmentAnalysisFixture {
  const now = "2026-01-13T00:00:00.000Z";
  const expires = "2026-02-12T00:00:00.000Z";

  const severity: "low" | "medium" | "high" =
    persona.lisData.overallScore < 45 ? "high" : persona.lisData.overallScore < 65 ? "medium" : "low";

  return {
    overall_analysis: `Analysis for ${persona.name}: focus on consistency for the next 28 days.`,
    key_findings: [
      { category: "Sleep", severity, finding: "Sleep quality is a primary lever for recovery." },
      { category: "Movement", severity, finding: "Progress comes from repeatable workouts, not heroic bursts." },
    ],
    personalized_insights: [
      `Your current LIS is ${persona.lisData.overallScore}.`,
      "Small wins compound faster over a 4-week cycle.",
    ],
    created_at: now,
    expires_at: expires,
    fromCache: false,
  };
}

