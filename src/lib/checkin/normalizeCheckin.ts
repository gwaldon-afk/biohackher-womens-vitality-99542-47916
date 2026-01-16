import { format } from "date-fns";
import { NormalizedDailyCheckin } from "@/lib/checkin/types";

export type RawDailyCheckinInput = {
  moodScore: number | null;
  sleepQualityScore: number | null;
  sleepHours: number | null;
  sleepHoursTouched: boolean;
  stressLevel: number | null;
  energyLevel: number | null;
  contextTags: string[];
  userNote: string;
};

export const normalizeCheckin = (
  input: RawDailyCheckinInput,
  date: Date | string,
): NormalizedDailyCheckin => {
  const dateString = typeof date === "string" ? date : format(date, "yyyy-MM-dd");
  const safeTags = Array.isArray(input.contextTags) ? input.contextTags.slice(0, 3) : [];

  return {
    date: dateString,
    mood_score: input.moodScore ?? null,
    sleep_quality_score: input.sleepQualityScore ?? null,
    sleep_hours: input.sleepHoursTouched ? input.sleepHours ?? null : null,
    stress_level: input.stressLevel ?? null,
    energy_level: input.energyLevel ?? null,
    context_tags: safeTags,
    user_note: input.userNote?.trim() ? input.userNote.trim() : null,
  };
};
import type { NormalizedDailyCheckin } from "@/lib/checkin/types";

export type RawDailyCheckinAnswers = {
  moodScore: number | null;
  sleepQualityScore: number | null;
  sleepHours: number | null;
  sleepHoursTouched?: boolean;
  stressLevel: number | null;
  energyLevel: number | null;
  contextTags: string[];
  userNote: string;
};

export const normalizeCheckin = (
  answers: RawDailyCheckinAnswers,
  date: string,
): NormalizedDailyCheckin => {
  return {
    date,
    mood_score: answers.moodScore ?? 0,
    sleep_quality_score: answers.sleepQualityScore ?? 0,
    sleep_hours: answers.sleepHoursTouched ? answers.sleepHours ?? null : null,
    stress_level: answers.stressLevel ?? 0,
    energy_level: answers.energyLevel ?? 0,
    context_tags: answers.contextTags ?? [],
    user_note: answers.userNote ? answers.userNote : null,
  };
};
