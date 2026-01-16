import { NormalizedDailyCheckin, PlanModifiers } from "@/lib/checkin/types";

export const derivePlanModifiers = (checkin: NormalizedDailyCheckin): PlanModifiers => {
  const modifiers: PlanModifiers = {
    intensity_modifier: 0,
    focus: null,
    time_budget_modifier_minutes: null,
    exercise_constraint: null,
    add_micro_actions: [],
    reasoning_short: "Keeping today supportive and realistic.",
  };

  const poorSleep = checkin.sleep_quality_score === 1;
  const highStress = (checkin.stress_level ?? 0) >= 4;
  const lowEnergy = (checkin.energy_level ?? 5) <= 2;

  if (poorSleep || highStress || lowEnergy) {
    modifiers.intensity_modifier = -1;
  }

  if (highStress) {
    modifiers.focus = "stress_support";
    modifiers.add_micro_actions = ["breathwork_5min"];
    modifiers.reasoning_short = "Pacing today with extra calm and support.";
  }

  if (poorSleep) {
    modifiers.focus = "recovery";
    modifiers.reasoning_short = "Leaning into recovery and smaller wins today.";
  }

  if (lowEnergy) {
    modifiers.time_budget_modifier_minutes = -10;
    if (!poorSleep && !highStress) {
      modifiers.reasoning_short = "Keeping today lighter to match your energy.";
    }
  }

  if (checkin.context_tags?.includes("injury")) {
    modifiers.exercise_constraint = "avoid_impact";
  }

  return modifiers;
};
