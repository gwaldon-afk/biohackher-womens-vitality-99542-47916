import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Activity, Sparkles, Calendar, ExternalLink, RotateCcw, GitCompare, Search, SlidersHorizontal, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { AssessmentComparisonDialog } from "./AssessmentComparisonDialog";
import { AssessmentReminders } from "./AssessmentReminders";
import { AssessmentProgressTimeline } from "./AssessmentProgressTimeline";
import { exportAssessmentHistoryCSV } from "@/utils/assessmentExport";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { SmartAssessmentTriage } from "./SmartAssessmentTriage";

export interface AssessmentRecord {
  id: string;
  type: "lis" | "hormone_compass" | "symptom";
  title: string;
  score: number | null;
  completedAt: Date;
  resultsPath: string;
  retakePath: string;
}

export const AssessmentHistoryTab = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // All hooks must be called unconditionally before any early returns
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [comparisonDialog, setComparisonDialog] = useState<{
    open: boolean;
    type: "lis" | "hormone_compass" | "symptom";
    title: string;
  }>({ open: false, type: "lis", title: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [typeFilters, setTypeFilters] = useState<{
    lis: boolean;
    hormone_compass: boolean;
    symptom: boolean;
  }>({
    lis: true,
    hormone_compass: true,
    symptom: true,
  });

  useEffect(() => {
    const fetchAssessments = async () => {
      if (!user) return;

      try {
        const { data: lisData } = await supabase
          .from("daily_scores")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_baseline", true)
          .order("created_at", { ascending: false })
          .limit(10);

        const { data: hcData } = await supabase
          .from("hormone_compass_stages")
          .select("*")
          .eq("user_id", user.id)
          .order("calculated_at", { ascending: false })
          .limit(10);

        const { data: symptomData } = await supabase
          .from("symptom_assessments")
          .select("*")
          .eq("user_id", user.id)
          .order("completed_at", { ascending: false })
          .limit(10);

        const allAssessments: AssessmentRecord[] = [];

        lisData?.forEach((item) => {
          allAssessments.push({
            id: item.id,
            type: "lis",
            title: "Longevity Impact Score",
            score: item.longevity_impact_score,
            completedAt: new Date(item.created_at),
            resultsPath: `/lis-results?id=${item.id}`,
            retakePath: "/guest-lis-assessment",
          });
        });

        hcData?.forEach((item) => {
          allAssessments.push({
            id: item.id,
            type: "hormone_compass",
            title: "Hormone Compass",
            score: item.confidence_score,
            completedAt: new Date(item.calculated_at),
            resultsPath: `/hormone-compass/results?id=${item.id}`,
            retakePath: "/hormone-compass/assessment",
          });
        });

        symptomData?.forEach((item) => {
          allAssessments.push({
            id: item.id,
            type: "symptom",
            title: "Symptom Assessment",
            score: item.overall_score,
            completedAt: new Date(item.completed_at),
            resultsPath: `/symptom-assessment/${item.symptom_type}`,
            retakePath: `/symptom-assessment/${item.symptom_type}`,
          });
        });

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

  const filteredAndSortedAssessments = useMemo(() => {
    let filtered = assessments.filter((assessment) => typeFilters[assessment.type]);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((assessment) =>
        assessment.title.toLowerCase().includes(query)
      );
    }

    return [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        const dateCompare = a.completedAt.getTime() - b.completedAt.getTime();
        return sortOrder === "asc" ? dateCompare : -dateCompare;
      } else {
        const scoreA = a.score ?? -1;
        const scoreB = b.score ?? -1;
        const scoreCompare = scoreA - scoreB;
        return sortOrder === "asc" ? scoreCompare : -scoreCompare;
      }
    });
  }, [assessments, typeFilters, searchQuery, sortBy, sortOrder]);

  const handleExportHistory = () => {
    try {
      exportAssessmentHistoryCSV(filteredAndSortedAssessments);
      toast({
        title: "Export successful",
        description: `Exported ${filteredAndSortedAssessments.length} assessments to CSV`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Could not export assessment history",
        variant: "destructive",
      });
    }
  };

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
    if (score >= 80) return <Badge className="bg-green-500">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">Good</Badge>;
    return <Badge className="bg-orange-500">Needs Attention</Badge>;
  };

  const lisCount = assessments.filter((a) => a.type === "lis").length;
  const hcCount = assessments.filter((a) => a.type === "hormone_compass").length;
  const activeFilterCount = Object.values(typeFilters).filter((v) => !v).length;

  return (
    <>
      <div className="space-y-8">
        <SmartAssessmentTriage />

        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-2">Your Completed Assessments</h3>
            <p className="text-sm text-muted-foreground">
              {assessments.length > 0 
                ? "View your assessment history and track your progress over time"
                : "Complete your first assessment to start tracking your health journey"}
            </p>
          </div>

          <AssessmentReminders />

          {assessments.length > 0 && <AssessmentProgressTimeline assessments={assessments} />}

          {loading ? (
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
          ) : assessments.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No assessment history yet</h3>
                <p className="text-muted-foreground mb-4">
                  Take your first assessment to see your health baseline
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  <Button onClick={() => navigate("/guest-lis-assessment")}>Take LIS Assessment</Button>
                  <Button variant="outline" onClick={() => navigate("/longevity-nutrition")}>Nutrition Assessment</Button>
                  <Button variant="outline" onClick={() => navigate("/hormone-compass/assessment")}>Hormone Compass</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">History</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportHistory}
                      disabled={filteredAndSortedAssessments.length === 0}
                      className="gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <p className="text-sm text-muted-foreground">
                      {filteredAndSortedAssessments.length} of {assessments.length} assessments
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search assessments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Filter
                        {activeFilterCount > 0 && (
                          <Badge variant="secondary" className="ml-1 px-1">{activeFilterCount}</Badge>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Assessment Type</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={typeFilters.lis}
                        onCheckedChange={(checked) => setTypeFilters((prev) => ({ ...prev, lis: checked }))}
                      >
                        LIS
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={typeFilters.hormone_compass}
                        onCheckedChange={(checked) => setTypeFilters((prev) => ({ ...prev, hormone_compass: checked }))}
                      >
                        Hormone Compass
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem
                        checked={typeFilters.symptom}
                        onCheckedChange={(checked) => setTypeFilters((prev) => ({ ...prev, symptom: checked }))}
                      >
                        Symptom
                      </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Select value={sortBy} onValueChange={(value: "date" | "score") => setSortBy(value)}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Sort by Date</SelectItem>
                      <SelectItem value="score">Sort by Score</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                    className="gap-2"
                  >
                    {sortOrder === "desc" ? "↓ Newest" : "↑ Oldest"}
                  </Button>
                </div>

                {(lisCount >= 2 || hcCount >= 2) && (
                  <div className="flex gap-2">
                    {lisCount >= 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setComparisonDialog({ open: true, type: "lis", title: "LIS Assessment" })}
                        className="gap-2"
                      >
                        <GitCompare className="h-4 w-4" />
                        Compare LIS Progress
                      </Button>
                    )}
                    {hcCount >= 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setComparisonDialog({ open: true, type: "hormone_compass", title: "Hormone Compass" })}
                        className="gap-2"
                      >
                        <GitCompare className="h-4 w-4" />
                        Compare Hormone Progress
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {filteredAndSortedAssessments.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">No matching assessments found</p>
                  </CardContent>
                </Card>
              ) : (
                filteredAndSortedAssessments.map((assessment) => (
                  <Card key={assessment.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          {getAssessmentIcon(assessment.type)}
                          <div className="space-y-1">
                            <h4 className="font-semibold">{assessment.title}</h4>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDistanceToNow(assessment.completedAt, { addSuffix: true })}</span>
                              {assessment.score !== null && (
                                <>
                                  <span>•</span>
                                  <span>Score: {assessment.score}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {getScoreBadge(assessment.score)}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(assessment.retakePath)}
                            className="gap-2"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Retake
                          </Button>
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
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </>
          )}
        </div>
      </div>

      <AssessmentComparisonDialog
        open={comparisonDialog.open}
        onOpenChange={(open) => setComparisonDialog({ ...comparisonDialog, open })}
        assessmentType={comparisonDialog.type}
        assessmentTitle={comparisonDialog.title}
      />
    </>
  );
};
