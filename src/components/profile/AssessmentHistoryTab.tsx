import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Activity, Sparkles, Calendar, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

interface AssessmentRecord {
  id: string;
  type: "lis" | "hormone_compass" | "symptom";
  title: string;
  score: number | null;
  completedAt: Date;
  resultsPath: string;
}

export const AssessmentHistoryTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;

      try {
        // Fetch LIS assessments (daily_scores with is_baseline=true)
        const { data: lisData } = await supabase
          .from("daily_scores")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_baseline", true)
          .order("created_at", { ascending: false })
          .limit(10);

        // Fetch Hormone Compass assessments
        const { data: hcData } = await supabase
          .from("hormone_compass_stages")
          .select("*")
          .eq("user_id", user.id)
          .order("calculated_at", { ascending: false })
          .limit(10);

        // Fetch Symptom assessments
        const { data: symptomData } = await supabase
          .from("symptom_assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(10);

        const allAssessments: AssessmentRecord[] = [];

        // Process LIS assessments
        lisData?.forEach((item) => {
          allAssessments.push({
            id: item.id,
            type: "lis",
            title: "Longevity Impact Score Assessment",
            score: item.longevity_impact_score,
            completedAt: new Date(item.created_at),
            resultsPath: `/lis-results?assessmentId=${item.id}`,
          });
        });

        // Process Hormone Compass assessments
        hcData?.forEach((item) => {
          allAssessments.push({
            id: item.id,
            type: "hormone_compass",
            title: "Hormone Compass Assessment",
            score: item.confidence_score ? Math.round(item.confidence_score) : null,
            completedAt: new Date(item.calculated_at),
            resultsPath: `/hormone-compass/results?stageId=${item.id}`,
          });
        });

        // Process Symptom assessments
        symptomData?.forEach((item) => {
          allAssessments.push({
            id: item.id,
            type: "symptom",
            title: `${item.symptom_type} Symptom Assessment`,
            score: item.overall_score,
            completedAt: new Date(item.completed_at),
            resultsPath: `/assessment/${item.symptom_type}/results`,
          });
        });

        // Sort by completion date (newest first)
        allAssessments.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

        setAssessments(allAssessments);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssessments();
  }, [user]);

  const getAssessmentIcon = (type: string) => {
    switch (type) {
      case "lis":
        return <Activity className="h-5 w-5 text-primary" />;
      case "hormone_compass":
        return <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      default:
        return <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getScoreBadge = (score: number | null) => {
    if (score === null) return null;
    
    if (score >= 80) {
      return <Badge className="bg-green-500">Excellent</Badge>;
    } else if (score >= 60) {
      return <Badge className="bg-yellow-500">Good</Badge>;
    } else {
      return <Badge className="bg-orange-500">Needs Attention</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-64" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No assessments yet</h3>
          <p className="text-muted-foreground mb-4">
            Complete your first assessment to see your health baseline
          </p>
          <div className="flex gap-2 justify-center flex-wrap">
            <Button onClick={() => navigate("/guest-lis-assessment")}>
              Take LIS Assessment
            </Button>
            <Button variant="outline" onClick={() => navigate("/hormone-compass/assessment")}>
              Take Hormone Compass
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Assessment History</h3>
        <p className="text-sm text-muted-foreground">{assessments.length} total assessments</p>
      </div>

      {assessments.map((assessment) => (
        <Card key={assessment.id} className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="mt-1">{getAssessmentIcon(assessment.type)}</div>
                <div className="flex-1">
                  <h4 className="font-semibold mb-1">{assessment.title}</h4>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(assessment.completedAt, { addSuffix: true })}
                    </span>
                    {assessment.score !== null && (
                      <span className="font-medium">Score: {assessment.score}/100</span>
                    )}
                    {getScoreBadge(assessment.score)}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(assessment.resultsPath)}
                className="gap-2"
              >
                View Results
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
