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
