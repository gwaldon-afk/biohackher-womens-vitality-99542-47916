import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useAssessmentProgress } from "@/hooks/useAssessmentProgress";
import {
  CheckinSettings,
  DailyCheckinRecord,
  getCheckinForDate,
  getCheckinSettings,
  getLocalDateString,
  upsertCheckin,
  upsertCheckinSettings,
} from "@/lib/checkin/checkinStorage";
import { DailyCheckInFlow, DailyCheckInFlowState } from "@/components/checkin/DailyCheckInFlow";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export const DailyCheckInEntry = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { progress, isLoading: progressLoading } = useAssessmentProgress();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [flowState, setFlowState] = useState<DailyCheckInFlowState>("welcome");
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<CheckinSettings | null>(null);
  const [checkin, setCheckin] = useState<DailyCheckinRecord | null>(null);
  const [hasSettingsRow, setHasSettingsRow] = useState<boolean | null>(null);

  const today = useMemo(() => getLocalDateString(), []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const [fetchedSettings, todayCheckin, settingsRow] = await Promise.all([
          getCheckinSettings(user.id),
          getCheckinForDate(user.id, today),
          supabase
            .from("user_checkin_settings")
            .select("id")
            .eq("user_id", user.id)
            .maybeSingle(),
        ]);

        if (!active) return;
        setSettings(fetchedSettings);
        setCheckin(todayCheckin);
        if (settingsRow.error) {
          throw settingsRow.error;
        }
        setHasSettingsRow(!!settingsRow.data);
        setLoading(false);

        if (fetchedSettings?.enabled !== false && !todayCheckin) {
          setFlowState("welcome");
          setOpen(true);
        }
      } catch (error) {
        if (!active) return;
        setLoading(false);
        setFlowState("fallback");
        setOpen(true);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [user, today]);

  const handleSkip = async () => {
    if (!user) return;
    try {
      const record = await upsertCheckin({
        user_id: user.id,
        date: today,
        mood_score: null,
        sleep_quality_score: null,
        sleep_hours: null,
        stress_level: null,
        energy_level: null,
        context_tags: [],
        user_note: null,
        skipped: true,
      });
      setCheckin(record);
      setOpen(false);
      toast({ description: t("checkin.skip.toast") });
    } catch (error) {
      setFlowState("fallback");
      setOpen(true);
    }
  };

  const handleDisable = async () => {
    if (!user) return;
    try {
      const updated = await upsertCheckinSettings({
        user_id: user.id,
        enabled: false,
        questions_config: settings?.questions_config ?? null,
      });
      setSettings(updated);
      setOpen(false);
      toast({ description: t("checkin.disable.toast") });
    } catch (error) {
      setFlowState("fallback");
      setOpen(true);
    }
  };

  const handleSubmit = async (answers: {
    moodScore: number | null;
    sleepQualityScore: number | null;
    sleepHours: number | null;
    sleepHoursTouched: boolean;
    stressLevel: number | null;
    energyLevel: number | null;
    userNote: string;
    contextTags: string[];
  }) => {
    if (!user) return;
    try {
      const record = await upsertCheckin({
        user_id: user.id,
        date: today,
        mood_score: answers.moodScore,
        sleep_quality_score: answers.sleepQualityScore,
        sleep_hours: answers.sleepHoursTouched ? answers.sleepHours : null,
        stress_level: answers.stressLevel,
        energy_level: answers.energyLevel,
        context_tags: answers.contextTags,
        user_note: answers.userNote ? answers.userNote : null,
        skipped: false,
      });
      setCheckin(record);
      setFlowState("confirm");
    } catch (error) {
      setFlowState("fallback");
      setOpen(true);
    }
  };

  const handleConfirmClose = () => {
    setOpen(false);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setOpen(false);
      return;
    }
    setOpen(true);
  };

  const hasCompletedAssessment =
    !!progress?.lis_completed || !!progress?.nutrition_completed || !!progress?.hormone_completed;
  const isOnboardingState =
    !!user && !hasCompletedAssessment && hasSettingsRow === false;

  if (loading || progressLoading || hasSettingsRow === null) {
    return (
      <div className="mb-4 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
        <div className="font-medium">{t("checkin.welcome.title")}</div>
        <div>{t("checkin.welcome.time_hint")}</div>
      </div>
    );
  }

  if (isOnboardingState) {
    return (
      <div className="mb-4 rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
        <div className="font-medium text-foreground">You’re almost ready</div>
        <div className="mt-1">
          Start a quick assessment to personalise your daily plan and check-ins.
        </div>
        <Button
          className="mt-3"
          onClick={() => navigate("/")}
        >
          Start assessment
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mb-4 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
        {t("checkin.fallback.body")}
      </div>
    );
  }

  if (settings?.enabled === false || checkin) {
    return null;
  }

  return (
    <DailyCheckInFlow
      open={open}
      state={flowState}
      onOpenChange={handleOpenChange}
      onStartQuestions={() => setFlowState("questions")}
      onSkip={handleSkip}
      onDisable={handleDisable}
      onSubmit={handleSubmit}
      onConfirmClose={handleConfirmClose}
    />
  );
};
