import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export type DailyCheckinRecord = {
  id?: string;
  user_id: string;
  date: string;
  mood_score: number | null;
  sleep_quality_score: number | null;
  sleep_hours: number | null;
  stress_level: number | null;
  energy_level: number | null;
  context_tags: string[];
  user_note: string | null;
  skipped: boolean;
  created_at?: string | null;
  updated_at?: string | null;
};

export type CheckinSettings = {
  user_id: string;
  enabled: boolean;
  questions_config: Record<string, unknown> | null;
  updated_at?: string | null;
};

export const getLocalDateString = (date: Date = new Date()) =>
  format(date, "yyyy-MM-dd");

const isNotFoundError = (error: { code?: string } | null) => error?.code === "PGRST116";

export const getCheckinForDate = async (userId: string | null, date: string) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error && !isNotFoundError(error)) throw error;
  return data as DailyCheckinRecord | null;
};

export const upsertCheckin = async (payload: Omit<DailyCheckinRecord, "id" | "created_at" | "updated_at">) => {
  if (!payload.user_id) return null;
  const { data, error } = await supabase
    .from("daily_checkins")
    .upsert(
      {
        ...payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,date" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as DailyCheckinRecord;
};

export const getCheckinSettings = async (userId: string | null) => {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("user_checkin_settings")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error && !isNotFoundError(error)) throw error;
  return data as CheckinSettings | null;
};

export const upsertCheckinSettings = async (payload: CheckinSettings) => {
  if (!payload.user_id) return null;
  const { data, error } = await supabase
    .from("user_checkin_settings")
    .upsert(
      {
        ...payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) throw error;
  return data as CheckinSettings;
};
