import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  options: Array<{
    text: string;
    score: number;
  }>;
}

export interface AssessmentConfig {
  id: string;
  name: string;
  description: string;
  pillar: string;
  journey_path?: string | null;
  questions: AssessmentQuestion[];
  scoringGuidance: {
    excellent: { min: number; max: number; description: string };
    good: { min: number; max: number; description: string };
    fair: { min: number; max: number; description: string };
    poor: { min: number; max: number; description: string };
  };
}

export const useAssessments = () => {
  const [assessments, setAssessments] = useState<Record<string, AssessmentConfig>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all assessments
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select('*')
        .order('id');

      if (assessmentsError) throw assessmentsError;

      // Fetch all questions with their options
      const { data: questionsData, error: questionsError } = await supabase
        .from('assessment_questions')
        .select(`
          *,
          assessment_question_options (
            option_text,
            option_order,
            score_value
          )
        `)
        .order('question_order');

      if (questionsError) throw questionsError;

      // Build assessment configs
      const configs: Record<string, AssessmentConfig> = {};

      assessmentsData?.forEach((assessment) => {
        const assessmentQuestions = questionsData
          ?.filter((q: any) => q.assessment_id === assessment.id)
          .map((q: any) => ({
            id: q.id,
            category: q.category || '',
            question: q.question_text,
            options: (q.assessment_question_options || [])
              .sort((a: any, b: any) => a.option_order - b.option_order)
              .map((opt: any) => ({
                text: opt.option_text,
                score: opt.score_value
              }))
          })) || [];

        configs[assessment.id] = {
          id: assessment.id,
          name: assessment.name,
          description: assessment.description,
          pillar: assessment.pillar,
          journey_path: assessment.journey_path,
          questions: assessmentQuestions,
          scoringGuidance: assessment.scoring_guidance as any
        };
      });

      setAssessments(configs);
    } catch (err: any) {
      console.error('Error fetching assessments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  return {
    assessments,
    loading,
    error,
    refetch: fetchAssessments
  };
};
