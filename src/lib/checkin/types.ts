export type NormalizedDailyCheckin = {
  date: string;
  mood_score: number | null;
  sleep_quality_score: number | null;
  sleep_hours: number | null;
  stress_level: number | null;
  energy_level: number | null;
  context_tags: string[];
  user_note: string | null;
};

export type PlanModifiers = {
  intensity_modifier: number;
  focus: string | null;
  time_budget_modifier_minutes: number | null;
  exercise_constraint: string | null;
  add_micro_actions: string[];
  reasoning_short: string;
};
export type NormalizedDailyCheckin = {
  date: string;
  mood_score: number;
  sleep_quality_score: number;
  sleep_hours: number | null;
  stress_level: number;
  energy_level: number;
  context_tags: string[];
  user_note: string | null;
};

export type PlanModifiers = {
  intensity_modifier: number;
  focus: string | null;
  time_budget_modifier_minutes: number | null;
  exercise_constraint: string | null;
  add_micro_actions: string[];
  reasoning_short: string;
};
