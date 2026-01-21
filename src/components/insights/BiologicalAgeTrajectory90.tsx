import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, Area } from "recharts";
import { Info, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChartContainer } from "@/components/ui/chart";
import { useBiologicalAgeSelectors } from "@/lib/biologicalAge/selectors";
import { buildBiologicalAgeProjection } from "@/lib/biologicalAge/projection";
import { ClinicianSummaryDownloadButton } from "@/components/export/ClinicianSummaryDownloadButton";

export const BiologicalAgeTrajectory90 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { biologicalAge, chronologicalAge, loading } = useBiologicalAgeSelectors();

  const projection = useMemo(() => {
    if (biologicalAge === null || biologicalAge === undefined) return null;
    return buildBiologicalAgeProjection(biologicalAge, chronologicalAge);
  }, [biologicalAge, chronologicalAge]);

  const showProjectionCopy = !!projection && projection.expectedImprovement > 0;

  const chartData = useMemo(() => {
    if (!projection) return [];
    return projection.points.map((point) => ({
      ...point,
      band: point.upper - point.lower,
    }));
  }, [projection]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle>{t("biologicalAge.trajectory90.title")}</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{t("biologicalAge.trajectory90.tooltipBioAge")}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {showProjectionCopy && (
              <p className="text-sm text-muted-foreground">
                {t("biologicalAge.trajectory90.annotation")}
              </p>
            )}
          </div>
          <ClinicianSummaryDownloadButton />
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {loading && (
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        )}

        {!loading && !projection && (
          <div className="rounded-lg border border-dashed border-border p-6 text-center space-y-3">
            <div className="text-lg font-semibold text-foreground">
              {t("biologicalAge.trajectory90.emptyStateTitle")}
            </div>
            <p className="text-sm text-muted-foreground">
              {t("biologicalAge.trajectory90.emptyStateBody")}
            </p>
            <Button onClick={() => navigate("/guest-lis-assessment")}>
              {t("biologicalAge.trajectory90.emptyStateCta")}
            </Button>
          </div>
        )}

        {!loading && projection && (
          <>
            <div className="h-56 w-full">
              <ChartContainer
                config={{
                  expected: { color: "hsl(var(--primary))" },
                  chronological: { color: "hsl(var(--muted-foreground))" },
                }}
                className="h-full w-full"
              >
                <LineChart data={chartData}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Area
                    type="monotone"
                    dataKey="lower"
                    stackId="band"
                    stroke="none"
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="band"
                    stackId="band"
                    stroke="none"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.12}
                  />
                  <Line
                    type="monotone"
                    dataKey="expected"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                  {chronologicalAge !== null && chronologicalAge !== undefined && (
                    <Line
                      type="monotone"
                      dataKey="chronological"
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      strokeWidth={1.5}
                      dot={false}
                    />
                  )}
                </LineChart>
              </ChartContainer>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="h-2 w-6 rounded-full bg-primary" />
                <span>{t("lisResults.biologicalAge")}</span>
              </div>
              {chronologicalAge !== null && chronologicalAge !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="h-0.5 w-6 bg-muted-foreground" />
                  <span>{t("biologicalAge.trajectory90.legendChronologicalAge")}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="h-2 w-6 rounded-full bg-primary/20" />
                <span>{t("biologicalAge.trajectory90.confidenceBandTooltip")}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                {t("biologicalAge.trajectory90.whatThisMeansTitle")}
              </h4>
              {showProjectionCopy && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">
                  {t("biologicalAge.trajectory90.whatThisMeansBody", {
                    X: projection.currentAge,
                    Y: projection.projectedAge,
                    Z: projection.expectedImprovement,
                  })}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {t("biologicalAge.trajectory90.qualifier")}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-foreground">
                {t("biologicalAge.trajectory90.keepsMovingTitle")}
              </h4>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {t("biologicalAge.trajectory90.keepsMovingBullets")}
              </p>
            </div>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <span>{t("biologicalAge.trajectory90.whyChangedLabel")}</span>
                <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-3 space-y-3 text-sm text-muted-foreground">
                <p>{t("biologicalAge.trajectory90.whyChangedP1")}</p>
                <p>{t("biologicalAge.trajectory90.whyChangedP2")}</p>
                <p>{t("biologicalAge.trajectory90.whyChangedP3")}</p>
              </CollapsibleContent>
            </Collapsible>

            <p className="text-xs text-muted-foreground">
              {t("biologicalAge.trajectory90.updateHelper")}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
