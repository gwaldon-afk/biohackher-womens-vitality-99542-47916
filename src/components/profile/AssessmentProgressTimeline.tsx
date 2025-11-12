import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Sparkles, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface AssessmentData {
  id: string;
  type: string;
  completedAt: Date;
  score: number | null;
  title: string;
  resultsPath: string;
}

interface AssessmentDetails {
  id: string;
  type: string;
  title: string;
  score: number;
  completedAt: Date;
  pillarScores?: {
    sleep: number;
    stress: number;
    activity: number;
    nutrition: number;
    social: number;
    cognitive: number;
  };
  domains?: Array<{
    name: string;
    score: number;
  }>;
  recommendations?: string[];
  resultsPath: string;
}

interface AssessmentProgressTimelineProps {
  assessments: AssessmentData[];
}

export function AssessmentProgressTimeline({ assessments }: AssessmentProgressTimelineProps) {
  const navigate = useNavigate();
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const chartData = useMemo(() => {
    // Group assessments by date and type
    const dataMap = new Map<string, any>();

    assessments.forEach((assessment) => {
      const date = format(assessment.completedAt, "MMM dd, yyyy");
      
      if (!dataMap.has(date)) {
        dataMap.set(date, {
          date,
          timestamp: assessment.completedAt.getTime(),
          lis: null,
          lisId: null,
          hormoneCompass: null,
          hormoneCompassId: null,
        });
      }

      const entry = dataMap.get(date);
      
      if (assessment.type === "lis" && assessment.score !== null) {
        entry.lis = Math.round(assessment.score);
        entry.lisId = assessment.id;
      } else if (assessment.type === "hormone_compass" && assessment.score !== null) {
        entry.hormoneCompass = Math.round(assessment.score);
        entry.hormoneCompassId = assessment.id;
      }
    });

    // Convert to array and sort by timestamp
    return Array.from(dataMap.values())
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(({ timestamp, ...rest }) => rest);
  }, [assessments]);

  const handleDataPointClick = async (data: any, dataKey: string) => {
    const assessmentId = dataKey === "lis" ? data.lisId : data.hormoneCompassId;
    if (!assessmentId) return;

    setLoadingDetails(true);
    setSelectedAssessment(null);

    try {
      if (dataKey === "lis") {
        // Fetch LIS assessment details
        const { data: lisData, error } = await supabase
          .from("daily_scores")
          .select("*")
          .eq("id", assessmentId)
          .single();

        if (error) throw error;

        const assessment = assessments.find(a => a.id === assessmentId);

        setSelectedAssessment({
          id: lisData.id,
          type: "lis",
          title: "Longevity Impact Score Assessment",
          score: lisData.longevity_impact_score,
          completedAt: new Date(lisData.created_at),
          pillarScores: {
            sleep: lisData.sleep_score || 0,
            stress: lisData.stress_score || 0,
            activity: lisData.physical_activity_score || 0,
            nutrition: lisData.nutrition_score || 0,
            social: lisData.social_connections_score || 0,
            cognitive: lisData.cognitive_engagement_score || 0,
          },
          resultsPath: assessment?.resultsPath || `/lis-results?assessmentId=${assessmentId}`,
        });
      } else if (dataKey === "hormoneCompass") {
        // Fetch Hormone Compass assessment details
        const { data: hcData, error } = await supabase
          .from("hormone_compass_stages")
          .select("*")
          .eq("id", assessmentId)
          .single();

        if (error) throw error;

        const assessment = assessments.find(a => a.id === assessmentId);

        // Parse hormone indicators from JSON field
        const hormoneIndicators = hcData.hormone_indicators as any;

        setSelectedAssessment({
          id: hcData.id,
          type: "hormone_compass",
          title: "Hormone Compass Assessment",
          score: Math.round(hcData.confidence_score || 0),
          completedAt: new Date(hcData.calculated_at),
          domains: hormoneIndicators?.domains || [],
          recommendations: hormoneIndicators?.recommendations || [],
          resultsPath: assessment?.resultsPath || `/hormone-compass/results?stageId=${assessmentId}`,
        });
      }
    } catch (error) {
      console.error("Error fetching assessment details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  if (chartData.length === 0) {
    return null;
  }

  const CustomDot = (props: any) => {
    const { cx, cy, payload, dataKey, fill } = props;
    
    return (
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill={fill}
        stroke="white"
        strokeWidth={2}
        style={{ cursor: "pointer" }}
        onClick={() => handleDataPointClick(payload, dataKey)}
        className="hover:r-8 transition-all"
      />
    );
  };

  return (
    <>
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
        <h3 className="text-lg font-semibold mb-4">Assessment Progress Timeline</h3>
        <p className="text-sm text-muted-foreground mb-4">Click on any data point to view full assessment details</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis 
              domain={[0, 100]}
              className="text-xs"
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: "20px",
              }}
            />
            <Line
              type="monotone"
              dataKey="lis"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              name="LIS Score"
              dot={<CustomDot fill="hsl(var(--primary))" dataKey="lis" />}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="hormoneCompass"
              stroke="hsl(var(--secondary))"
              strokeWidth={2}
              name="Hormone Compass Score"
              dot={<CustomDot fill="hsl(var(--secondary))" dataKey="hormoneCompass" />}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Assessment Details Dialog */}
      <Dialog open={selectedAssessment !== null || loadingDetails} onOpenChange={(open) => !open && setSelectedAssessment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {loadingDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedAssessment ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  {selectedAssessment.type === "lis" ? (
                    <Activity className="h-6 w-6 text-primary" />
                  ) : (
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  )}
                  <div>
                    <DialogTitle>{selectedAssessment.title}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {format(selectedAssessment.completedAt, "MMMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Overall Score */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-lg border border-primary/20">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge className="text-lg px-4 py-1">
                    {selectedAssessment.score}
                  </Badge>
                </div>

                {/* Pillar Scores (LIS) */}
                {selectedAssessment.pillarScores && (
                  <div>
                    <h4 className="font-semibold mb-3">Pillar Scores</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {Object.entries(selectedAssessment.pillarScores).map(([pillar, score]) => (
                        <div key={pillar} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm capitalize">{pillar}</span>
                          <span className="font-semibold">{Math.round(score)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Domain Scores (Hormone Compass) */}
                {selectedAssessment.domains && selectedAssessment.domains.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Domain Scores</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedAssessment.domains.map((domain) => (
                        <div key={domain.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <span className="text-sm capitalize">{domain.name}</span>
                          <span className="font-semibold">{Math.round(domain.score)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {selectedAssessment.recommendations && selectedAssessment.recommendations.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3">Recommendations</h4>
                    <ul className="space-y-2">
                      {selectedAssessment.recommendations.slice(0, 5).map((rec, idx) => (
                        <li key={idx} className="text-sm p-2 bg-muted rounded flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* View Full Results Button */}
                <Button
                  onClick={() => {
                    navigate(selectedAssessment.resultsPath);
                    setSelectedAssessment(null);
                  }}
                  className="w-full gap-2"
                >
                  View Full Results
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
