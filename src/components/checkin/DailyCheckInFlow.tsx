import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { dailyCheckinSchema } from "@/lib/checkin/dailyCheckinSchema";

export type DailyCheckInFlowState = "welcome" | "questions" | "confirm" | "fallback";

type DailyCheckInAnswers = {
  moodScore: number | null;
  sleepQualityScore: number | null;
  sleepHours: number | null;
  sleepHoursTouched: boolean;
  stressLevel: number | null;
  energyLevel: number | null;
  userNote: string;
  contextTags: string[];
};

type DailyCheckInFlowProps = {
  open: boolean;
  state: DailyCheckInFlowState;
  onOpenChange: (open: boolean) => void;
  onStartQuestions: () => void;
  onSkip: () => void;
  onDisable: () => void;
  onSubmit: (answers: DailyCheckInAnswers) => Promise<void>;
  onConfirmClose: () => void;
};

const MAX_CONTEXT_TAGS = 3;

export const DailyCheckInFlow = ({
  open,
  state,
  onOpenChange,
  onStartQuestions,
  onSkip,
  onDisable,
  onSubmit,
  onConfirmClose,
}: DailyCheckInFlowProps) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);
  const [answers, setAnswers] = useState<DailyCheckInAnswers>({
    moodScore: null,
    sleepQualityScore: null,
    sleepHours: null,
    sleepHoursTouched: false,
    stressLevel: 3,
    energyLevel: 3,
    userNote: "",
    contextTags: [],
  });

  const questions = useMemo(
    () =>
      [...dailyCheckinSchema.questions]
        .filter((q) => q.enabled)
        .sort((a, b) => a.order - b.order),
    [],
  );

  const isSubmitEnabled =
    !!answers.moodScore &&
    !!answers.sleepQualityScore &&
    !!answers.stressLevel &&
    !!answers.energyLevel &&
    !saving;

  const handleSubmit = async () => {
    if (!isSubmitEnabled) return;
    setSaving(true);
    try {
      await onSubmit(answers);
    } finally {
      setSaving(false);
    }
  };

  const handleContextTagsChange = (values: string[]) => {
    if (values.length > MAX_CONTEXT_TAGS) return;
    setAnswers((prev) => ({ ...prev, contextTags: values }));
  };

  const renderProgressDots = () => {
    const steps = ["welcome", "questions", "confirm"];
    const index = steps.indexOf(state);
    return (
      <div className="flex items-center justify-center gap-2">
        {steps.map((step, idx) => (
          <span
            key={step}
            className={`h-2 w-2 rounded-full ${idx <= index ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        {state === "welcome" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("checkin.welcome.title")}</DialogTitle>
              <DialogDescription>{t("checkin.welcome.body")}</DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div className="text-sm text-muted-foreground">{t("checkin.welcome.time_hint")}</div>
              <div className="flex flex-col gap-3">
                <Button onClick={onStartQuestions}>{t("checkin.welcome.primary")}</Button>
                <Button variant="outline" onClick={onSkip}>
                  {t("checkin.welcome.secondary")}
                </Button>
                <button
                  type="button"
                  className="text-xs text-muted-foreground underline underline-offset-2"
                  onClick={onDisable}
                >
                  {t("checkin.welcome.disable")}
                </button>
              </div>
            </div>
          </>
        )}

        {state === "questions" && (
          <>
            <div className="space-y-6">
              {renderProgressDots()}
              {questions.map((question) => {
                if (question.id === "mood" && Array.isArray(question.response.options)) {
                  return (
                    <div key={question.id} className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{t(question.prompt_key)}</div>
                        <div className="text-xs text-muted-foreground">{t("checkin.q1.helper")}</div>
                      </div>
                      <ToggleGroup
                        type="single"
                        value={answers.moodScore ? String(answers.moodScore) : ""}
                        onValueChange={(value) => {
                          const selected = question.response.options?.find(
                            (option) => "score" in option && String(option.score) === value,
                          );
                          setAnswers((prev) => ({
                            ...prev,
                            moodScore: selected && "score" in selected ? selected.score ?? null : null,
                          }));
                        }}
                        className="flex flex-wrap justify-start gap-2"
                      >
                        {(question.response.options as { id: string; score?: number }[]).map((option) => (
                          <ToggleGroupItem
                            key={option.id}
                            value={String(option.score ?? "")}
                            className="px-3 py-2 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            {t(`checkin.q1.options.${option.id}`)}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  );
                }

                if (question.id === "sleep_quality" && Array.isArray(question.response.options)) {
                  return (
                    <div key={question.id} className="space-y-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{t(question.prompt_key)}</div>
                      </div>
                      <ToggleGroup
                        type="single"
                        value={answers.sleepQualityScore ? String(answers.sleepQualityScore) : ""}
                        onValueChange={(value) => {
                          const selected = question.response.options?.find(
                            (option) => "score" in option && String(option.score) === value,
                          );
                          setAnswers((prev) => ({
                            ...prev,
                            sleepQualityScore: selected && "score" in selected ? selected.score ?? null : null,
                          }));
                        }}
                        className="flex flex-wrap justify-start gap-2"
                      >
                        {(question.response.options as { id: string; score?: number }[]).map((option) => (
                          <ToggleGroupItem
                            key={option.id}
                            value={String(option.score ?? "")}
                            className="px-3 py-2 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            {t(`checkin.q2.options.${option.id}`)}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">{t("checkin.q2.subprompt")}</div>
                        <div className="text-xs text-muted-foreground">{t("checkin.q2.subhelper")}</div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>{answers.sleepHoursTouched ? String(answers.sleepHours) : ""}</span>
                          <span>10</span>
                        </div>
                        <Slider
                          value={[answers.sleepHours ?? 7]}
                          onValueChange={(value) =>
                            setAnswers((prev) => ({
                              ...prev,
                              sleepHours: value[0],
                              sleepHoursTouched: true,
                            }))
                          }
                          min={question.subquestion?.response.min ?? 0}
                          max={question.subquestion?.response.max ?? 10}
                          step={question.subquestion?.response.step ?? 0.5}
                        />
                      </div>
                    </div>
                  );
                }

                if (question.id === "stress") {
                  return (
                    <div key={question.id} className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{t(question.prompt_key)}</div>
                        <div className="text-xs text-muted-foreground">{t("checkin.q3.helper")}</div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>1</span>
                        <span>{answers.stressLevel}</span>
                        <span>5</span>
                      </div>
                      <Slider
                        value={[answers.stressLevel ?? 3]}
                        onValueChange={(value) =>
                          setAnswers((prev) => ({ ...prev, stressLevel: value[0] }))
                        }
                        min={question.response.min ?? 1}
                        max={question.response.max ?? 5}
                        step={question.response.step ?? 1}
                      />
                    </div>
                  );
                }

                if (question.id === "energy") {
                  return (
                    <div key={question.id} className="space-y-3">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{t(question.prompt_key)}</div>
                        <div className="text-xs text-muted-foreground">{t("checkin.q4.helper")}</div>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>1</span>
                        <span>{answers.energyLevel}</span>
                        <span>5</span>
                      </div>
                      <Slider
                        value={[answers.energyLevel ?? 3]}
                        onValueChange={(value) =>
                          setAnswers((prev) => ({ ...prev, energyLevel: value[0] }))
                        }
                        min={question.response.min ?? 1}
                        max={question.response.max ?? 5}
                        step={question.response.step ?? 1}
                      />
                    </div>
                  );
                }

                if (question.id === "notes") {
                  return (
                    <div key={question.id} className="space-y-2">
                      <div className="space-y-1">
                        <div className="text-sm font-medium">{t(question.prompt_key)}</div>
                        <div className="text-xs text-muted-foreground">{t("checkin.q5.helper")}</div>
                      </div>
                      <Textarea
                        value={answers.userNote}
                        onChange={(event) =>
                          setAnswers((prev) => ({ ...prev, userNote: event.target.value }))
                        }
                        placeholder={t("checkin.q5.placeholder")}
                        maxLength={dailyCheckinSchema.ui.max_free_text_chars}
                        rows={3}
                      />
                    </div>
                  );
                }

                if (question.id === "context_tags" && Array.isArray(question.response.options)) {
                  return (
                    <div key={question.id} className="space-y-3">
                      <div className="text-sm font-medium">{t(question.prompt_key)}</div>
                      <ToggleGroup
                        type="multiple"
                        value={answers.contextTags}
                        onValueChange={handleContextTagsChange}
                        className="flex flex-wrap justify-start gap-2"
                      >
                        {(question.response.options as string[]).map((option) => (
                          <ToggleGroupItem
                            key={option}
                            value={option}
                            className="px-3 py-2 text-xs data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                          >
                            {t(`checkin.q6.options.${option}`)}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </div>
                  );
                }

                return null;
              })}
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSubmit} disabled={!isSubmitEnabled || saving}>
                {t("checkin.welcome.primary")}
              </Button>
            </div>
          </>
        )}

        {state === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("checkin.confirm.title")}</DialogTitle>
              <DialogDescription>{t("checkin.confirm.body")}</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Button onClick={onConfirmClose}>{t("checkin.confirm.primary")}</Button>
            </div>
          </>
        )}

        {state === "fallback" && (
          <>
            <DialogHeader>
              <DialogTitle>{t("checkin.fallback.title")}</DialogTitle>
              <DialogDescription>{t("checkin.fallback.body")}</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <Button onClick={onConfirmClose}>{t("checkin.fallback.primary")}</Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
