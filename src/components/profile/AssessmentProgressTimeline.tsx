import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths, subYears } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Sparkles, ExternalLink, Calendar, GitCompare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [dateRange, setDateRange] = useState<"3m" | "6m" | "1y" | "all">("6m");
  
  // Feature 2: Comparison Mode State
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonAssessment, setComparisonAssessment] = useState<AssessmentDetails | null>(null);
  const [availableComparisons, setAvailableComparisons] = useState<AssessmentDetails[]>([]);

  const getAssessmentCountForRange = (range: "3m" | "6m" | "1y" | "all") => {
    if (range === "all") return assessments.length;

    const now = new Date();
    let cutoffDate: Date;

    switch (range) {
      case "3m":
        cutoffDate = subMonths(now, 3);
        break;
      case "6m":
        cutoffDate = subMonths(now, 6);
        break;
      case "1y":
        cutoffDate = subYears(now, 1);
        break;
      default:
        return assessments.length;
    }

    return assessments.filter(assessment => assessment.completedAt >= cutoffDate).length;
  };

  const filteredAssessments = useMemo(() => {
    if (dateRange === "all") return assessments;

    const now = new Date();
    let cutoffDate: Date;

    switch (dateRange) {
      case "3m":
        cutoffDate = subMonths(now, 3);
        break;
      case "6m":
        cutoffDate = subMonths(now, 6);
        break;
      case "1y":
        cutoffDate = subYears(now, 1);
        break;
      default:
        return assessments;
    }

    return assessments.filter(assessment => assessment.completedAt >= cutoffDate);
  }, [assessments, dateRange]);

  const chartData = useMemo(() => {
    // Group assessments by date and type
    const dataMap = new Map<string, any>();

    filteredAssessments.forEach((assessment) => {
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
  }, [filteredAssessments]);

  const handleDataPointClick = async (data: any, dataKey: string) => {
    const assessmentId = dataKey === "lis" ? data.lisId : data.hormoneCompassId;
    if (!assessmentId) return;

    setLoadingDetails(true);
    setSelectedAssessment(null);
    setComparisonMode(false);
    setComparisonAssessment(null);

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
        
        // Load available comparisons for LIS
        const otherLIS = assessments.filter(a => a.type === "lis" && a.id !== assessmentId);
        setAvailableComparisons(otherLIS.map(a => ({
          id: a.id,
          type: a.type,
          title: a.title,
          score: a.score || 0,
          completedAt: a.completedAt,
          resultsPath: a.resultsPath,
        })));
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
        
        // Load available comparisons for Hormone Compass
        const otherHC = assessments.filter(a => a.type === "hormone_compass" && a.id !== assessmentId);
        setAvailableComparisons(otherHC.map(a => ({
          id: a.id,
          type: a.type,
          title: a.title,
          score: a.score || 0,
          completedAt: a.completedAt,
          resultsPath: a.resultsPath,
        })));
      }
    } catch (error) {
      console.error("Error fetching assessment details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Feature 1: Empty State Message
  if (chartData.length === 0) {
    const rangeText = dateRange === "3m" ? "the last 3 months" : 
                     dateRange === "6m" ? "the last 6 months" :
                     dateRange === "1y" ? "the last year" : "your history";
    
    return (
      <Card className="p-6 bg-gradient-to-br from-primary/5 via-secondary/5 to-background border-primary/20">
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assessments found</h3>
          <p className="text-muted-foreground mb-6">
            You haven't completed any assessments in {rangeText}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Button onClick={() => navigate("/guest-lis-assessment")}>
              Take LIS Assessment
            </Button>
            <Button variant="outline" onClick={() => navigate("/hormone-compass/assessment")}>
              Take Hormone Compass
            </Button>
          </div>
        </div>
      </Card>
    );
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
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Assessment Progress Timeline</h3>
            <p className="text-sm text-muted-foreground mt-1">Click on any data point to view full assessment details</p>
          </div>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">
                <div className="flex items-center justify-between w-full gap-3">
                  <span>Last 3 months</span>
                  <Badge variant="secondary" className="ml-auto">
                    {getAssessmentCountForRange("3m")}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="6m">
                <div className="flex items-center justify-between w-full gap-3">
                  <span>Last 6 months</span>
                  <Badge variant="secondary" className="ml-auto">
                    {getAssessmentCountForRange("6m")}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="1y">
                <div className="flex items-center justify-between w-full gap-3">
                  <span>Last year</span>
                  <Badge variant="secondary" className="ml-auto">
                    {getAssessmentCountForRange("1y")}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="all">
                <div className="flex items-center justify-between w-full gap-3">
                  <span>All time</span>
                  <Badge variant="secondary" className="ml-auto">
                    {getAssessmentCountForRange("all")}
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
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

      {/* Feature 2: Assessment Details Dialog with Comparison Mode */}
      <Dialog open={selectedAssessment !== null || loadingDetails} onOpenChange={(open) => {
        if (!open) {
          setSelectedAssessment(null);
          setComparisonMode(false);
          setComparisonAssessment(null);
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          {loadingDetails ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedAssessment ? (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedAssessment.type === "lis" ? (
                      <Activity className="h-6 w-6 text-primary" />
                    ) : (
                      <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    )}
                    <div>
                      <DialogTitle>
                        {comparisonMode ? "Assessment Comparison" : selectedAssessment.title}
                      </DialogTitle>
                      {!comparisonMode && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {format(selectedAssessment.completedAt, "MMMM d, yyyy")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Comparison Toggle Button */}
                  {!comparisonMode && availableComparisons.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setComparisonMode(true)}
                      className="gap-2"
                    >
                      <GitCompare className="h-4 w-4" />
                      Compare
                    </Button>
                  )}
                  
                  {comparisonMode && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setComparisonMode(false);
                        setComparisonAssessment(null);
                      }}
                    >
                      Exit Comparison
                    </Button>
                  )}
                </div>
              </DialogHeader>

              {comparisonMode && !comparisonAssessment ? (
                /* Select Second Assessment for Comparison */
                <div className="space-y-4 mt-4">
                  <p className="text-sm text-muted-foreground">
                    Select another {selectedAssessment.type === "lis" ? "LIS" : "Hormone Compass"} assessment to compare with:
                  </p>
                  <div className="space-y-2">
                    {availableComparisons.map((comparison) => (
                      <Button
                        key={comparison.id}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={async () => {
                          setLoadingDetails(true);
                          try {
                            // Fetch full details for comparison assessment
                            if (selectedAssessment.type === "lis") {
                              const { data, error } = await supabase
                                .from("daily_scores")
                                .select("*")
                                .eq("id", comparison.id)
                                .single();
                              
                              if (!error && data) {
                                setComparisonAssessment({
                                  ...comparison,
                                  pillarScores: {
                                    sleep: data.sleep_score || 0,
                                    stress: data.stress_score || 0,
                                    activity: data.physical_activity_score || 0,
                                    nutrition: data.nutrition_score || 0,
                                    social: data.social_connections_score || 0,
                                    cognitive: data.cognitive_engagement_score || 0,
                                  },
                                });
                              }
                            } else {
                              const { data, error } = await supabase
                                .from("hormone_compass_stages")
                                .select("*")
                                .eq("id", comparison.id)
                                .single();
                              
                              if (!error && data) {
                                const hormoneIndicators = data.hormone_indicators as any;
                                setComparisonAssessment({
                                  ...comparison,
                                  domains: hormoneIndicators?.domains || [],
                                  recommendations: hormoneIndicators?.recommendations || [],
                                });
                              }
                            }
                          } catch (error) {
                            console.error("Error loading comparison:", error);
                          } finally {
                            setLoadingDetails(false);
                          }
                        }}
                      >
                        <span>{format(comparison.completedAt, "MMMM d, yyyy")}</span>
                        <Badge>{comparison.score}</Badge>
                      </Button>
                    ))}
                  </div>
                </div>
              ) : comparisonMode && comparisonAssessment ? (
                /* Side-by-Side Comparison View */
                <div className="space-y-6 mt-4">
                  {/* Dates Header */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Earlier Assessment</p>
                      <p className="text-xs text-muted-foreground">{format(comparisonAssessment.completedAt, "MMM d, yyyy")}</p>
                    </div>
                    <div className="text-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                      <p className="text-sm font-medium">Recent Assessment</p>
                      <p className="text-xs text-muted-foreground">{format(selectedAssessment.completedAt, "MMM d, yyyy")}</p>
                    </div>
                  </div>
                  
                  {/* Overall Score Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <p className="text-sm font-medium mb-2">Overall Score</p>
                      <Badge className="text-lg px-4 py-1">{comparisonAssessment.score}</Badge>
                    </div>
                    <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 text-center">
                      <p className="text-sm font-medium mb-2">Overall Score</p>
                      <Badge className="text-lg px-4 py-1">{selectedAssessment.score}</Badge>
                      {comparisonAssessment.score && selectedAssessment.score && (
                        <Badge 
                          variant="outline" 
                          className={`ml-2 ${selectedAssessment.score > comparisonAssessment.score ? 'text-green-600 border-green-600' : selectedAssessment.score < comparisonAssessment.score ? 'text-red-600 border-red-600' : 'text-gray-600'}`}
                        >
                          {selectedAssessment.score > comparisonAssessment.score ? '+' : ''}{selectedAssessment.score - comparisonAssessment.score}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Pillar/Domain Scores Comparison */}
                  {selectedAssessment.pillarScores && comparisonAssessment.pillarScores && (
                    <div>
                      <h4 className="font-semibold mb-3 text-center">Pillar Scores Comparison</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedAssessment.pillarScores).map(([pillar, recentScore]) => {
                          const earlierScore = (comparisonAssessment.pillarScores as any)?.[pillar] || 0;
                          const delta = Math.round(recentScore) - Math.round(earlierScore);
                          
                          return (
                            <div key={pillar} className="grid grid-cols-3 gap-2 items-center p-3 bg-muted rounded-lg">
                              <div className="text-sm font-medium capitalize text-center">{pillar}</div>
                              <div className="text-center text-sm">{Math.round(earlierScore)}</div>
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold">{Math.round(recentScore)}</span>
                                {delta !== 0 && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${delta > 0 ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
                                  >
                                    {delta > 0 ? '+' : ''}{delta}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Domain Scores Comparison (Hormone Compass) */}
                  {selectedAssessment.domains && comparisonAssessment.domains && (
                    <div>
                      <h4 className="font-semibold mb-3 text-center">Domain Scores Comparison</h4>
                      <div className="space-y-2">
                        {selectedAssessment.domains.map((recentDomain) => {
                          const earlierDomain = comparisonAssessment.domains?.find((d: any) => d.name === recentDomain.name);
                          const earlierScore = earlierDomain?.score || 0;
                          const delta = Math.round(recentDomain.score) - Math.round(earlierScore);
                          
                          return (
                            <div key={recentDomain.name} className="grid grid-cols-3 gap-2 items-center p-3 bg-muted rounded-lg">
                              <div className="text-sm font-medium capitalize text-center">{recentDomain.name}</div>
                              <div className="text-center text-sm">{Math.round(earlierScore)}</div>
                              <div className="flex items-center justify-center gap-2">
                                <span className="font-semibold">{Math.round(recentDomain.score)}</span>
                                {delta !== 0 && (
                                  <Badge 
                                    variant="outline" 
                                    className={`text-xs ${delta > 0 ? 'text-green-600 border-green-600' : 'text-red-600 border-red-600'}`}
                                  >
                                    {delta > 0 ? '+' : ''}{delta}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Recent Recommendations Only */}
                  {selectedAssessment.recommendations && selectedAssessment.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3">Latest Recommendations</h4>
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
                  
                  {/* Action Buttons */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigate(comparisonAssessment.resultsPath);
                        setSelectedAssessment(null);
                        setComparisonMode(false);
                      }}
                      className="gap-2"
                    >
                      View Earlier Results
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => {
                        navigate(selectedAssessment.resultsPath);
                        setSelectedAssessment(null);
                        setComparisonMode(false);
                      }}
                      className="gap-2"
                    >
                      View Recent Results
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                /* Single Assessment View */
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
              )}
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
