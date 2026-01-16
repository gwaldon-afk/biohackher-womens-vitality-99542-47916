import { describe, expect, it } from "vitest";
import { normalizeCheckin } from "@/lib/checkin/normalizeCheckin";
import { derivePlanModifiers } from "@/lib/checkin/derivePlanModifiers";

describe("normalizeCheckin", () => {
  it("normalizes inputs into schema shape", () => {
    const normalized = normalizeCheckin(
      {
        moodScore: 4,
        sleepQualityScore: 2,
        sleepHours: 7,
        sleepHoursTouched: true,
        stressLevel: 3,
        energyLevel: 4,
        contextTags: ["travel", "late_night"],
        userNote: "  Big day  ",
      },
      "2026-01-16",
    );

    expect(normalized).toEqual({
      date: "2026-01-16",
      mood_score: 4,
      sleep_quality_score: 2,
      sleep_hours: 7,
      stress_level: 3,
      energy_level: 4,
      context_tags: ["travel", "late_night"],
      user_note: "Big day",
    });
  });
});

describe("derivePlanModifiers", () => {
  it("A) poor sleep, high stress, low energy, injury tag", () => {
    const modifiers = derivePlanModifiers({
      date: "2026-01-16",
      mood_score: 2,
      sleep_quality_score: 1,
      sleep_hours: 4.5,
      stress_level: 5,
      energy_level: 2,
      context_tags: ["injury"],
      user_note: null,
    });

    expect(modifiers).toEqual({
      intensity_modifier: -1,
      focus: "recovery",
      time_budget_modifier_minutes: -10,
      exercise_constraint: "avoid_impact",
      add_micro_actions: ["breathwork_5min"],
      reasoning_short: "Leaning into recovery and smaller wins today.",
    });
  });

  it("B) sleep great, stress low, energy high", () => {
    const modifiers = derivePlanModifiers({
      date: "2026-01-16",
      mood_score: 5,
      sleep_quality_score: 3,
      sleep_hours: 8,
      stress_level: 1,
      energy_level: 5,
      context_tags: [],
      user_note: null,
    });

    expect(modifiers).toEqual({
      intensity_modifier: 0,
      focus: null,
      time_budget_modifier_minutes: null,
      exercise_constraint: null,
      add_micro_actions: [],
      reasoning_short: "Keeping today supportive and realistic.",
    });
  });

  it("C) sleep ok, stress high, energy ok", () => {
    const modifiers = derivePlanModifiers({
      date: "2026-01-16",
      mood_score: 3,
      sleep_quality_score: 2,
      sleep_hours: 6,
      stress_level: 4,
      energy_level: 3,
      context_tags: [],
      user_note: null,
    });

    expect(modifiers).toEqual({
      intensity_modifier: -1,
      focus: "stress_support",
      time_budget_modifier_minutes: null,
      exercise_constraint: null,
      add_micro_actions: ["breathwork_5min"],
      reasoning_short: "Pacing today with extra calm and support.",
    });
  });

  it("D) sleep poor only", () => {
    const modifiers = derivePlanModifiers({
      date: "2026-01-16",
      mood_score: 3,
      sleep_quality_score: 1,
      sleep_hours: 5.5,
      stress_level: 2,
      energy_level: 3,
      context_tags: [],
      user_note: null,
    });

    expect(modifiers).toEqual({
      intensity_modifier: -1,
      focus: "recovery",
      time_budget_modifier_minutes: null,
      exercise_constraint: null,
      add_micro_actions: [],
      reasoning_short: "Leaning into recovery and smaller wins today.",
    });
  });
});
