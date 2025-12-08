import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { FileText, CheckCircle2 } from "lucide-react";

interface AssessmentResponsesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assessmentId: string;
  assessmentType: "lis" | "hormone_compass" | "symptom" | "nutrition" | "pillar";
  assessmentTitle: string;
}

interface ResponseData {
  question: string;
  answer: string | number;
  category?: string;
}

export const AssessmentResponsesDialog = ({
  open,
  onOpenChange,
  assessmentId,
  assessmentType,
  assessmentTitle,
}: AssessmentResponsesDialogProps) => {
  const [responses, setResponses] = useState<ResponseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState<any>(null);

  useEffect(() => {
    if (open && assessmentId) {
      fetchResponses();
    }
  }, [open, assessmentId, assessmentType]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      let data: any = null;

      switch (assessmentType) {
        case "lis":
          const { data: lisData } = await supabase
            .from("daily_scores")
            .select("questionnaire_data, longevity_impact_score, biological_age_impact, sleep_score, stress_score, nutrition_score, physical_activity_score, social_connections_score, cognitive_engagement_score")
            .eq("id", assessmentId)
            .single();
          data = lisData;
          break;

        case "hormone_compass":
          const { data: hcData } = await supabase
            .from("hormone_compass_stages")
            .select("hormone_indicators, stage, confidence_score")
            .eq("id", assessmentId)
            .single();
          data = hcData;
          break;

        case "nutrition":
          const { data: nutritionData } = await supabase
            .from("longevity_nutrition_assessments")
            .select("*")
            .eq("id", assessmentId)
            .single();
          data = nutritionData;
          break;

        case "symptom":
          const { data: symptomData } = await supabase
            .from("symptom_assessments")
            .select("*")
            .eq("id", assessmentId)
            .single();
          data = symptomData;
          break;

        case "pillar":
          const { data: pillarData } = await supabase
            .from("user_assessment_completions")
            .select("*")
            .eq("id", assessmentId)
            .single();
          data = pillarData;
          break;
      }

      setRawData(data);
      setResponses(parseResponses(assessmentType, data));
    } catch (error) {
      console.error("Error fetching responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const parseResponses = (type: string, data: any): ResponseData[] => {
    if (!data) return [];

    const responses: ResponseData[] = [];

    switch (type) {
      case "lis":
        // Add pillar scores
        if (data.sleep_score !== null) responses.push({ question: "Sleep Score", answer: `${data.sleep_score}/100`, category: "Sleep" });
        if (data.stress_score !== null) responses.push({ question: "Stress Score", answer: `${data.stress_score}/100`, category: "Stress" });
        if (data.nutrition_score !== null) responses.push({ question: "Nutrition Score", answer: `${data.nutrition_score}/100`, category: "Nutrition" });
        if (data.physical_activity_score !== null) responses.push({ question: "Activity Score", answer: `${data.physical_activity_score}/100`, category: "Activity" });
        if (data.social_connections_score !== null) responses.push({ question: "Social Score", answer: `${data.social_connections_score}/100`, category: "Social" });
        if (data.cognitive_engagement_score !== null) responses.push({ question: "Cognitive Score", answer: `${data.cognitive_engagement_score}/100`, category: "Cognitive" });
        
        // Add questionnaire data if available
        if (data.questionnaire_data) {
          Object.entries(data.questionnaire_data).forEach(([key, value]: [string, any]) => {
            if (typeof value === 'object' && value !== null) {
              responses.push({ question: key, answer: JSON.stringify(value), category: "Questionnaire" });
            } else {
              responses.push({ question: key, answer: String(value), category: "Questionnaire" });
            }
          });
        }
        break;

      case "hormone_compass":
        responses.push({ question: "Health Level", answer: data.stage || "N/A", category: "Result" });
        responses.push({ question: "Confidence Score", answer: `${data.confidence_score}%`, category: "Result" });
        
        if (data.hormone_indicators) {
          const indicators = data.hormone_indicators;
          if (indicators.domainScores) {
            Object.entries(indicators.domainScores).forEach(([key, value]) => {
              responses.push({ question: key, answer: String(value), category: "Domain Scores" });
            });
          }
          if (indicators.avgScore !== undefined) {
            responses.push({ question: "Average Score", answer: String(indicators.avgScore), category: "Summary" });
          }
        }
        break;

      case "nutrition":
        responses.push({ question: "Longevity Nutrition Score", answer: `${data.longevity_nutrition_score}/100`, category: "Overall" });
        if (data.protein_score !== null) responses.push({ question: "Protein Score", answer: `${data.protein_score}/5`, category: "Macros" });
        if (data.fiber_score !== null) responses.push({ question: "Fiber Score", answer: `${data.fiber_score}/5`, category: "Macros" });
        if (data.inflammation_score !== null) responses.push({ question: "Inflammation Score", answer: `${data.inflammation_score}/5`, category: "Health" });
        if (data.hydration_score !== null) responses.push({ question: "Hydration Score", answer: `${data.hydration_score}/5`, category: "Health" });
        if (data.goal_primary) responses.push({ question: "Primary Goal", answer: data.goal_primary, category: "Goals" });
        if (data.activity_level) responses.push({ question: "Activity Level", answer: data.activity_level, category: "Lifestyle" });
        if (data.menopause_stage) responses.push({ question: "Menopause Stage", answer: data.menopause_stage, category: "Hormonal" });
        if (data.nutrition_identity_type) responses.push({ question: "Eating Personality", answer: data.nutrition_identity_type, category: "Behavior" });
        break;

      case "symptom":
        responses.push({ question: "Symptom Type", answer: data.symptom_type || "N/A", category: "Type" });
        responses.push({ question: "Overall Score", answer: `${data.overall_score}/100`, category: "Result" });
        responses.push({ question: "Score Category", answer: data.score_category || "N/A", category: "Result" });
        
        if (data.answer_data) {
          Object.entries(data.answer_data).forEach(([key, value]) => {
            responses.push({ question: key, answer: String(value), category: "Answers" });
          });
        }
        break;

      case "pillar":
        responses.push({ question: "Pillar", answer: data.pillar || "N/A", category: "Type" });
        responses.push({ question: "Score", answer: `${data.score}/100`, category: "Result" });
        break;
    }

    return responses;
  };

  // Group responses by category
  const groupedResponses = responses.reduce((acc, response) => {
    const category = response.category || "Other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(response);
    return acc;
  }, {} as Record<string, ResponseData[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {assessmentTitle} - Full Responses
          </DialogTitle>
          <DialogDescription>
            View all questions and answers from this assessment
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ))}
            </div>
          ) : responses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No detailed responses available for this assessment</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedResponses).map(([category, categoryResponses]) => (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline">{category}</Badge>
                  </div>
                  <div className="space-y-3">
                    {categoryResponses.map((response, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-start justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <span className="text-sm font-medium text-muted-foreground">
                          {response.question}
                        </span>
                        <span className="text-sm font-semibold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          {response.answer}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
