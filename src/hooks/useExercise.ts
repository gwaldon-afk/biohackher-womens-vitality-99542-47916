import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { CurrentLIS, ExerciseProtocolRowInput, UserMetadata } from "@/lib/exercise/engine";
import { generateDailyProtocol } from "@/lib/exercise/engine";

export type ExerciseProtocolRow = ExerciseProtocolRowInput & {
  id: string;
  created_at: string;
  user_id: string;
};

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function startOfTodayUtcISOString() {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  return start.toISOString();
}

function startOfTomorrowUtcISOString() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0));
  return tomorrow.toISOString();
}

type UseExerciseArgs = {
  currentLIS: CurrentLIS;
  cyclePhase: string;
  userMetadata: UserMetadata;
};

/**
 * Fetches or creates today's `exercise_protocols` row for the authenticated user.
 * Also supports a "confirmation" step where the user adjusts an energy slider before starting.
 */
export function useExercise({ currentLIS, cyclePhase, userMetadata }: UseExerciseArgs) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [protocol, setProtocol] = useState<ExerciseProtocolRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const todayKey = useMemo(() => {
    const date = new Date().toISOString().slice(0, 10);
    return user?.id ? `${user.id}_${date}` : date;
  }, [user?.id]);

  const confirmedStorageKey = useMemo(() => `exercise_protocol_confirmed_${todayKey}`, [todayKey]);
  const energyStorageKey = useMemo(() => `exercise_protocol_energy_${todayKey}`, [todayKey]);

  const [energyLevel, setEnergyLevel] = useState<number>(() => {
    const stored = localStorage.getItem(energyStorageKey);
    const parsed = stored ? Number(stored) : 1;
    return clamp01(Number.isFinite(parsed) ? parsed : 1);
  });

  const [isConfirmed, setIsConfirmed] = useState<boolean>(() => {
    return localStorage.getItem(confirmedStorageKey) === "true";
  });

  // Keep localStorage keys stable when user/date changes
  useEffect(() => {
    const storedEnergy = localStorage.getItem(energyStorageKey);
    const parsedEnergy = storedEnergy ? Number(storedEnergy) : 1;
    setEnergyLevel(clamp01(Number.isFinite(parsedEnergy) ? parsedEnergy : 1));

    setIsConfirmed(localStorage.getItem(confirmedStorageKey) === "true");
  }, [confirmedStorageKey, energyStorageKey]);

  const fetchTodaysProtocol = useCallback(async () => {
    if (!user) {
      setProtocol(null);
      return null;
    }

    setLoading(true);
    try {
      const start = startOfTodayUtcISOString();
      const end = startOfTomorrowUtcISOString();

      // Note: the table may not exist in generated TS types yet, so we cast.
      const { data, error } = await (supabase as any)
        .from("exercise_protocols")
        .select("*")
        .eq("user_id", user.id)
        .gte("created_at", start)
        .lt("created_at", end)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setProtocol((data as ExerciseProtocolRow) || null);
      return (data as ExerciseProtocolRow) || null;
    } catch (e: any) {
      console.error("[useExercise] fetch error:", e);
      toast({
        variant: "destructive",
        title: "Could not load today's workout",
        description: e?.message || "Please try again.",
      });
      setProtocol(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  const createTodaysProtocol = useCallback(async () => {
    if (!user) return null;

    setCreating(true);
    try {
      const row: ExerciseProtocolRowInput = generateDailyProtocol(currentLIS, cyclePhase, userMetadata);

      const insertPayload = {
        ...row,
        user_id: user.id,
      };

      const { data, error } = await (supabase as any)
        .from("exercise_protocols")
        .insert(insertPayload)
        .select("*")
        .single();

      if (error) throw error;
      setProtocol(data as ExerciseProtocolRow);
      return data as ExerciseProtocolRow;
    } catch (e: any) {
      console.error("[useExercise] create error:", e);
      toast({
        variant: "destructive",
        title: "Could not create today's workout",
        description: e?.message || "Please try again.",
      });
      return null;
    } finally {
      setCreating(false);
    }
  }, [currentLIS, cyclePhase, toast, user, userMetadata]);

  const ensureTodaysProtocol = useCallback(async () => {
    if (!user) return null;
    const existing = await fetchTodaysProtocol();
    if (existing) return existing;
    return await createTodaysProtocol();
  }, [createTodaysProtocol, fetchTodaysProtocol, user]);

  const setEnergy = useCallback(
    (value: number) => {
      const clamped = clamp01(value);
      setEnergyLevel(clamped);
      localStorage.setItem(energyStorageKey, String(clamped));
    },
    [energyStorageKey],
  );

  /**
   * Confirm "start workout" after the user adjusts energy level.
   * We persist this in localStorage and (optionally) adjust intensity_level on the row for today.
   */
  const confirmStart = useCallback(async () => {
    if (!user) return null;

    setConfirming(true);
    try {
      const ensured = protocol || (await ensureTodaysProtocol());
      if (!ensured) return null;

      // Map energy [0..1] to a multiplier [0.6..1.0]
      const multiplier = 0.6 + energyLevel * 0.4;
      const adjustedIntensity = clamp01(ensured.intensity_level * multiplier);

      const { data, error } = await (supabase as any)
        .from("exercise_protocols")
        .update({ intensity_level: adjustedIntensity })
        .eq("id", ensured.id)
        .select("*")
        .single();

      if (error) throw error;

      localStorage.setItem(confirmedStorageKey, "true");
      setIsConfirmed(true);

      setProtocol(data as ExerciseProtocolRow);
      return data as ExerciseProtocolRow;
    } catch (e: any) {
      console.error("[useExercise] confirm error:", e);
      toast({
        variant: "destructive",
        title: "Could not start workout",
        description: e?.message || "Please try again.",
      });
      return null;
    } finally {
      setConfirming(false);
    }
  }, [confirmedStorageKey, energyLevel, ensureTodaysProtocol, protocol, toast, user]);

  const resetConfirmation = useCallback(() => {
    localStorage.removeItem(confirmedStorageKey);
    setIsConfirmed(false);
  }, [confirmedStorageKey]);

  // Load or create today's protocol on mount / when inputs change
  useEffect(() => {
    if (!user) {
      setProtocol(null);
      return;
    }
    // Don't block render; best-effort ensure.
    void ensureTodaysProtocol();
  }, [ensureTodaysProtocol, user]);

  return {
    protocol,
    loading,
    creating,
    confirming,
    ensureTodaysProtocol,
    refetch: fetchTodaysProtocol,

    // Confirmation / energy adjustment
    energyLevel,
    setEnergyLevel: setEnergy,
    isConfirmed,
    confirmStart,
    resetConfirmation,
  };
}

