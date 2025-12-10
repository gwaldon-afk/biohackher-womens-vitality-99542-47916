import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export interface UserHealthContext {
  // LIS scores
  lisScore?: number;
  lisPillarScores?: {
    sleep?: number;
    stress?: number;
    nutrition?: number;
    physical?: number;
    social?: number;
    cognitive?: number;
  };
  // Nutrition scores
  nutritionScore?: number;
  nutritionPillarScores?: {
    body?: number;
    brain?: number;
    balance?: number;
    beauty?: number;
  };
  // Hormone Compass
  hormoneHealthLevel?: string;
  hormoneDomainScores?: Record<string, number>;
  // Health goals
  activeGoals?: Array<{
    id: string;
    title: string;
    pillarCategory: string;
    currentProgress: number;
  }>;
  // Lowest scoring areas (for relevance matching)
  priorityAreas: string[];
  biologicalAge?: number;
  chronologicalAge?: number;
}

export function useUserHealthContext() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-health-context', user?.id],
    queryFn: async (): Promise<UserHealthContext | null> => {
      if (!user?.id) return null;

      // Fetch all data in parallel
      const [
        lisResult,
        nutritionResult,
        hormoneResult,
        goalsResult,
        profileResult
      ] = await Promise.all([
        // Latest LIS score
        supabase
          .from('daily_scores')
          .select('longevity_impact_score, questionnaire_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Latest nutrition assessment
        supabase
          .from('longevity_nutrition_assessments')
          .select('longevity_nutrition_score, protein_score, fiber_score, hydration_score, inflammation_score, gut_symptom_score')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Latest hormone compass
        supabase
          .from('hormone_compass_stages')
          .select('stage, hormone_indicators')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle(),
        // Active health goals
        supabase
          .from('user_health_goals')
          .select('id, title, pillar_category, current_progress')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .limit(5),
        // User profile for age
        supabase
          .from('user_health_profile')
          .select('date_of_birth')
          .eq('user_id', user.id)
          .maybeSingle()
      ]);

      // Calculate priority areas based on lowest scores
      const priorityAreas: string[] = [];
      
      // Parse LIS pillar scores from questionnaire_data
      let lisPillarScores: UserHealthContext['lisPillarScores'] = {};
      if (lisResult.data?.questionnaire_data) {
        const qd = lisResult.data.questionnaire_data as Record<string, any>;
        lisPillarScores = {
          sleep: qd.sleep_score || qd.sleepScore,
          stress: qd.stress_score || qd.stressScore,
          nutrition: qd.nutrition_score || qd.nutritionScore,
          physical: qd.physical_score || qd.physicalScore,
          social: qd.social_score || qd.socialScore,
          cognitive: qd.cognitive_score || qd.cognitiveScore,
        };
        
        // Find lowest LIS pillars
        const sortedPillars = Object.entries(lisPillarScores)
          .filter(([_, v]) => v !== undefined)
          .sort((a, b) => (a[1] as number) - (b[1] as number));
        
        if (sortedPillars.length > 0 && (sortedPillars[0][1] as number) < 70) {
          priorityAreas.push(sortedPillars[0][0]);
        }
        if (sortedPillars.length > 1 && (sortedPillars[1][1] as number) < 70) {
          priorityAreas.push(sortedPillars[1][0]);
        }
      }

      // Parse nutrition pillar scores
      let nutritionPillarScores: UserHealthContext['nutritionPillarScores'] = {};
      if (nutritionResult.data) {
        const nd = nutritionResult.data;
        // Map nutrition sub-scores to pillars
        nutritionPillarScores = {
          body: nd.protein_score ? nd.protein_score * 20 : undefined,
          brain: nd.inflammation_score ? (5 - nd.inflammation_score) * 20 : undefined,
          balance: nd.hydration_score ? nd.hydration_score * 20 : undefined,
          beauty: nd.gut_symptom_score ? (5 - nd.gut_symptom_score) * 20 : undefined,
        };
        
        // Add low nutrition areas to priorities
        if (nd.protein_score && nd.protein_score < 3) priorityAreas.push('protein');
        if (nd.inflammation_score && nd.inflammation_score > 2) priorityAreas.push('inflammation');
        if (nd.gut_symptom_score && nd.gut_symptom_score > 2) priorityAreas.push('gut health');
      }

      // Parse hormone indicators
      let hormoneDomainScores: Record<string, number> = {};
      if (hormoneResult.data?.hormone_indicators) {
        hormoneDomainScores = hormoneResult.data.hormone_indicators as Record<string, number>;
        
        // Add hormone concerns to priorities
        const lowHormoneDomains = Object.entries(hormoneDomainScores)
          .filter(([_, v]) => v < 3)
          .map(([k]) => k);
        priorityAreas.push(...lowHormoneDomains.slice(0, 2));
      }

      // Calculate age
      let chronologicalAge: number | undefined;
      if (profileResult.data?.date_of_birth) {
        const dob = new Date(profileResult.data.date_of_birth);
        chronologicalAge = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      }

      // Map active goals
      const activeGoals = goalsResult.data?.map(g => ({
        id: g.id,
        title: g.title,
        pillarCategory: g.pillar_category,
        currentProgress: Number(g.current_progress) || 0,
      })) || [];

      // Add goal pillars to priorities
      activeGoals.forEach(g => {
        if (!priorityAreas.includes(g.pillarCategory)) {
          priorityAreas.push(g.pillarCategory);
        }
      });

      return {
        lisScore: lisResult.data?.longevity_impact_score,
        lisPillarScores,
        nutritionScore: nutritionResult.data?.longevity_nutrition_score,
        nutritionPillarScores,
        hormoneHealthLevel: hormoneResult.data?.stage,
        hormoneDomainScores,
        activeGoals,
        priorityAreas: [...new Set(priorityAreas)].slice(0, 5), // Deduplicate and limit
        chronologicalAge,
      };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
