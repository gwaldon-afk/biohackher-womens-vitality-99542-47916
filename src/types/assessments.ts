// TypeScript types for assessments
import { Json } from '@/integrations/supabase/types';

export interface Assessment {
  id: string;
  name: string;
  description: string;
  pillar: string;
  scoring_guidance: Json;
  journey_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface AssessmentCompletion {
  id: string;
  user_id: string;
  assessment_id: string;
  pillar: string | null;
  score: number | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface SymptomAssessment {
  id: string;
  user_id: string;
  symptom_type: string;
  overall_score: number;
  score_category: string;
  answers: Json;
  detail_scores: Json | null;
  recommendations: Json;
  primary_issues: string[] | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}
