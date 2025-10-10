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
  journey_path?: string;
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

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      setLoading(true);
      
      // Fetch assessments with their questions and options
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          assessment_questions (
            id,
            question_text,
            question_order,
            category,
            assessment_question_options (
              option_text,
              option_order,
              score_value
            )
          )
        `)
        .order('id');

      if (assessmentsError) throw assessmentsError;

      // Transform database structure to match AssessmentConfig interface
      const assessmentsMap: Record<string, AssessmentConfig> = {};
      
      assessmentsData?.forEach((assessment: any) => {
        const questions: AssessmentQuestion[] = assessment.assessment_questions
          .sort((a: any, b: any) => a.question_order - b.question_order)
          .map((q: any) => ({
            id: q.id,
            category: q.category || '',
            question: q.question_text,
            options: q.assessment_question_options
              .sort((a: any, b: any) => a.option_order - b.option_order)
              .map((opt: any) => ({
                text: opt.option_text,
                score: opt.score_value
              }))
          }));

        assessmentsMap[assessment.id] = {
          id: assessment.id,
          name: assessment.name,
          description: assessment.description,
          pillar: assessment.pillar,
          journey_path: assessment.journey_path,
          questions,
          scoringGuidance: assessment.scoring_guidance
        };
      });

      setAssessments(assessmentsMap);
      setError(null);
    } catch (err) {
      console.error('Error loading assessments:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assessments');
      
      // Fallback to static assessments if database fails
      import('@/data/assessmentQuestions').then(module => {
        setAssessments(module.assessmentConfigs);
      });
    } finally {
      setLoading(false);
    }
  };

  const getAssessment = (id: string): AssessmentConfig | null => {
    return assessments[id] || null;
  };

  return {
    assessments,
    loading,
    error,
    getAssessment,
    refetch: loadAssessments
  };
};
