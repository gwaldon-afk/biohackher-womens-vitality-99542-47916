import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowRight, BarChart3, Dumbbell, Sparkles, TrendingUp } from "lucide-react";

type ExerciseProtocolRow = {
  id: string;
  created_at: string;
  title: string;
  intensity_level: number | null;
  focus_area: string | null;
};

type DailyScoreRow = {
  date: string; // YYYY-MM-DD
  longevity_impact_score: number;
};

function startOfTodayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
}

function addDaysUtc(d: Date, days: number) {
  return new Date(d.getTime() + days * 24 * 60 * 60 * 1000);
}

function toDateKeyUtc(d: Date) {
  return d.toISOString().slice(0, 10);
}

function clamp01(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

function intensityToClass(intensity: number | null | undefined) {
  const v = clamp01(typeof intensity === "number" ? intensity : 0);
  if (v <= 0) return "bg-muted/40";
  if (v <= 0.25) return "bg-primary/15";
  if (v <= 0.5) return "bg-primary/30";
  if (v <= 0.75) return "bg-primary/50";
  return "bg-primary";
}

function computeVarietyScore(focusAreas: Array<string | null | undefined>) {
  // Normalized Shannon entropy across the known set of focus areas.
  // Score: 0..100 where 100 = perfectly balanced distribution.
  const cleaned = focusAreas.map((f) => (f || "").trim()).filter(Boolean);
  if (cleaned.length === 0) return { score: 0, unique: 0 };

  const counts = new Map<string, number>();
  for (const f of cleaned) counts.set(f, (counts.get(f) || 0) + 1);

  const total = cleaned.length;
  let entropy = 0;
  for (const c of counts.values()) {
    const p = c / total;
    entropy += -p * Math.log(p);
  }

  // Use a stable denominator so the score is comparable over time.
  // Your exercise_focus enum currently has 5 values.
  const maxEntropy = Math.log(5);
  const normalized = maxEntropy > 0 ? entropy / maxEntropy : 0;
  return { score: Math.round(normalized * 100), unique: counts.size };
}

type BiometricWin = {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

function computeBiometricWins(args: {
  days: string[];
  protocolByDay: Map<string, ExerciseProtocolRow>;
  lisByDay: Map<string, DailyScoreRow>;
  varietyScore: number;
}) {
  const { days, protocolByDay, lisByDay, varietyScore } = args;

  const completedDays = days.filter((d) => protocolByDay.has(d));
  const firstLis = lisByDay.get(days[0])?.longevity_impact_score ?? null;
  const lastLis = lisByDay.get(days[days.length - 1])?.longevity_impact_score ?? null;

  const overallDelta =
    firstLis != null && lastLis != null ? Math.round((lastLis - firstLis) * 10) / 10 : null;

  const nextDayDeltas: number[] = [];
  const nextDayDeltasAfterWorkouts: number[] = [];
  for (let i = 0; i < days.length - 1; i += 1) {
    const a = lisByDay.get(days[i])?.longevity_impact_score;
    const b = lisByDay.get(days[i + 1])?.longevity_impact_score;
    if (a == null || b == null) continue;
    const delta = b - a;
    nextDayDeltas.push(delta);
    if (protocolByDay.has(days[i])) nextDayDeltasAfterWorkouts.push(delta);
  }

  const avg = (xs: number[]) => (xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null);
  const avgAllNext = avg(nextDayDeltas);
  const avgWorkoutNext = avg(nextDayDeltasAfterWorkouts);

  const wins: BiometricWin[] = [];

  wins.push({
    title: "Your 28‑day graduation outcome",
    description:
      overallDelta == null
        ? `You completed ${completedDays.length} workouts. Log more LIS check‑ins to quantify your next leap.`
        : overallDelta >= 0
          ? `You completed ${completedDays.length} workouts and lifted your LIS by +${overallDelta} in 28 days.`
          : `You completed ${completedDays.length} workouts and held steady through a tough month (LIS ${overallDelta}).`,
    href: "/progress",
    icon: TrendingUp,
  });

  wins.push({
    title: "Workouts → next‑day momentum",
    description:
      avgAllNext == null
        ? "Add a few more daily check-ins so we can quantify your momentum after training days."
        : avgWorkoutNext == null
          ? `Your average next‑day LIS change is ${avgAllNext >= 0 ? "+" : ""}${avgAllNext.toFixed(2)}. Start your next cycle to build momentum.`
          : `After workout days, your next‑day LIS change averages ${avgWorkoutNext >= 0 ? "+" : ""}${avgWorkoutNext.toFixed(2)} (overall ${avgAllNext >= 0 ? "+" : ""}${avgAllNext.toFixed(2)}).`,
    href: "/daily-check-in",
    icon: BarChart3,
  });

  wins.push({
    title: "Variety is a strength signal",
    description:
      varietyScore >= 70
        ? `Strong diversity score (${varietyScore}/100). You’re training like a “whole‑body” athlete—keep rotating stimulus in the next Reinvention Cycle.`
        : `Your variety score is ${varietyScore}/100. Rotate focus areas a bit more next cycle to avoid plateaus.`,
    href: "/my-protocol",
    icon: Dumbbell,
  });

  return wins;
}

export function MonthlySummary() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [protocols, setProtocols] = useState<ExerciseProtocolRow[]>([]);
  const [lisScores, setLisScores] = useState<DailyScoreRow[]>([]);

  const range = useMemo(() => {
    const end = addDaysUtc(startOfTodayUtc(), 1); // exclusive end = tomorrow start
    const start = addDaysUtc(end, -28);
    const days: string[] = [];
    for (let i = 0; i < 28; i += 1) {
      days.push(toDateKeyUtc(addDaysUtc(start, i)));
    }
    return { start, end, days };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const startIso = range.start.toISOString();
        const endIso = range.end.toISOString();
        const startDate = toDateKeyUtc(range.start);
        const endDate = toDateKeyUtc(addDaysUtc(range.end, -1));

        const [protocolRes, lisRes] = await Promise.all([
          (supabase as any)
            .from("exercise_protocols")
            .select("id,created_at,title,intensity_level,focus_area")
            .eq("user_id", user.id)
            .gte("created_at", startIso)
            .lt("created_at", endIso)
            .order("created_at", { ascending: false }),
          supabase
            .from("daily_scores")
            .select("date,longevity_impact_score")
            .eq("user_id", user.id)
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: true }),
        ]);

        if (protocolRes.error) throw protocolRes.error;
        if (lisRes.error) throw lisRes.error;

        if (cancelled) return;
        setProtocols((protocolRes.data || []) as ExerciseProtocolRow[]);
        setLisScores((lisRes.data || []) as DailyScoreRow[]);
      } catch (e) {
        console.error("[MonthlySummary] load error:", e);
        if (!cancelled) {
          setProtocols([]);
          setLisScores([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [range.end, range.start, range.days, user]);

  const protocolByDay = useMemo(() => {
    // Pick the most recent protocol row per day (UTC).
    const map = new Map<string, ExerciseProtocolRow>();
    for (const p of protocols) {
      const day = toDateKeyUtc(new Date(p.created_at));
      if (!map.has(day)) map.set(day, p);
    }
    return map;
  }, [protocols]);

  const lisByDay = useMemo(() => {
    const map = new Map<string, DailyScoreRow>();
    for (const r of lisScores) map.set(r.date, r);
    return map;
  }, [lisScores]);

  const variety = useMemo(() => {
    const focusAreas = range.days.map((d) => protocolByDay.get(d)?.focus_area || null);
    return computeVarietyScore(focusAreas);
  }, [protocolByDay, range.days]);

  const wins = useMemo(() => {
    return computeBiometricWins({
      days: range.days,
      protocolByDay,
      lisByDay,
      varietyScore: variety.score,
    });
  }, [lisByDay, protocolByDay, range.days, variety.score]);

  const completedCount = useMemo(() => range.days.filter((d) => protocolByDay.has(d)).length, [protocolByDay, range.days]);

  if (!user) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            28‑Day Reinvention Cycle — Graduation Report
          </CardTitle>
          <CardDescription>Sign in to see your monthly Body Pillar summary.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/auth">Sign in</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              28‑Day Reinvention Cycle — Graduation Report
            </CardTitle>
            <CardDescription>
              {range.days[0]} → {range.days[range.days.length - 1]} · {completedCount} workouts completed
            </CardDescription>
          </div>
          <Button asChild>
            <Link to="/exercise/setup">
              Start your next Reinvention Cycle <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Variety score */}
        <div className="rounded-lg border bg-background/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Variety Score</Badge>
                <span className="text-sm text-muted-foreground">
                  based on focus area diversity
                </span>
              </div>
              <div className="mt-2 text-2xl font-bold">
                {loading ? "…" : `${variety.score}/100`}
              </div>
              <div className="text-sm text-muted-foreground">
                {loading ? "Calculating…" : `${variety.unique} focus areas explored`}
              </div>
            </div>
            <div className="w-40 text-right">
              <div className="text-xs text-muted-foreground">Your next level</div>
              <div className="text-sm font-medium">
                {variety.score >= 70 ? "Keep rotating stimulus" : "Add a new training flavor"}
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={variety.score} />
          </div>
        </div>

        {/* 28-day intensity grid */}
        <div className="rounded-lg border bg-background/70 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Your 28‑day training map</div>
              <div className="text-xs text-muted-foreground">Each square = a day · color = intensity</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              <div className="h-3 w-3 rounded-sm bg-primary/15" />
              <div className="h-3 w-3 rounded-sm bg-primary/30" />
              <div className="h-3 w-3 rounded-sm bg-primary/50" />
              <div className="h-3 w-3 rounded-sm bg-primary" />
              <span>High</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-7 gap-2">
            {range.days.map((day) => {
              const p = protocolByDay.get(day);
              const intensity = p?.intensity_level ?? 0;
              const title = p?.title || "No workout logged";
              const focus = p?.focus_area || "";
              return (
                <div
                  key={day}
                  title={`${day}\n${title}${focus ? `\n${focus}` : ""}${p?.intensity_level != null ? `\nIntensity: ${clamp01(p.intensity_level).toFixed(2)}` : ""}`}
                  className={cn(
                    "aspect-square rounded-md border border-border/60",
                    "transition-transform hover:scale-[1.03]",
                    intensityToClass(intensity),
                  )}
                />
              );
            })}
          </div>

          {loading && (
            <div className="mt-4">
              <Skeleton className="h-4 w-64" />
            </div>
          )}
        </div>

        {/* Biometric wins */}
        <div className="rounded-lg border bg-background/70 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Biometric Wins</div>
              <div className="text-xs text-muted-foreground">
                linking training consistency to your Longevity Impact Score
              </div>
            </div>
            <Badge className="bg-primary/10 text-primary hover:bg-primary/10">Graduation highlights</Badge>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {wins.map((w) => {
              const Icon = w.icon;
              return (
                <Link
                  key={w.title}
                  to={w.href}
                  className="group rounded-lg border bg-background p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2">
                    <div className="rounded-md bg-primary/10 p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-sm font-semibold">{w.title}</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">{w.description}</div>
                  <div className="mt-3 text-xs font-medium text-primary group-hover:underline">
                    View details →
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Reinvention CTA */}
        <div className="rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-secondary/5 to-background p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-base font-semibold">Ready for your next 28‑day Reinvention Cycle?</div>
              <div className="text-sm text-muted-foreground">
                You don’t need perfection. You need a plan that fits your life — and a fresh start you can feel.
              </div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/my-protocol">Review my protocol</Link>
              </Button>
              <Button asChild>
                <Link to="/exercise/setup">
                  Start Cycle <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

