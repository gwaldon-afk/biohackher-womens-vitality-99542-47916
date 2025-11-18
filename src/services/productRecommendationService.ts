import { supabase } from "@/integrations/supabase/client";
import type { Product } from "./productService";

interface PillarScore {
  pillar: string;
  score: number;
}

interface AssessmentData {
  lis_score?: number;
  pillar_scores?: Record<string, number>;
  hormone_level?: string;
  nutrition_score?: number;
}

/**
 * Get recommended products based on user's assessment data
 */
export const getRecommendedProducts = async (userId: string): Promise<Product[]> => {
  try {
    // Fetch latest assessment data
    const assessmentData = await getUserAssessmentData(userId);
    
    if (!assessmentData) {
      return [];
    }

    // Get lowest-scoring pillars
    const weakPillars = identifyWeakPillars(assessmentData);
    
    // Fetch products matching weak pillars
    const products = await matchProductsToPillars(weakPillars);
    
    return products;
  } catch (error) {
    console.error('Error getting recommended products:', error);
    return [];
  }
};

/**
 * Fetch user's latest assessment data from all sources
 */
const getUserAssessmentData = async (userId: string): Promise<AssessmentData | null> => {
  try {
    // Get latest LIS assessment
    const { data: lisData } = await supabase
      .from('daily_scores')
      .select('longevity_impact_score, questionnaire_data')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    // Get latest Hormone Compass assessment
    const { data: hormoneData } = await supabase
      .from('hormone_compass_stages')
      .select('stage')
      .eq('user_id', userId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .single();

    // Get latest Longevity Nutrition assessment
    const { data: nutritionData } = await supabase
      .from('nutrition_preferences')
      .select('longevity_nutrition_score')
      .eq('user_id', userId)
      .single();

    const pillarScores: Record<string, number> = {};
    
    if (lisData?.questionnaire_data) {
      const data = lisData.questionnaire_data as any;
      if (data.pillar_scores) {
        Object.assign(pillarScores, data.pillar_scores);
      }
    }

    return {
      lis_score: lisData?.longevity_impact_score || undefined,
      pillar_scores: Object.keys(pillarScores).length > 0 ? pillarScores : undefined,
      hormone_level: hormoneData?.stage || undefined,
      nutrition_score: nutritionData?.longevity_nutrition_score || undefined,
    };
  } catch (error) {
    console.error('Error fetching assessment data:', error);
    return null;
  }
};

/**
 * Identify weak pillars from assessment data
 */
const identifyWeakPillars = (data: AssessmentData): string[] => {
  const weakPillars: string[] = [];
  
  // Analyze LIS pillar scores
  if (data.pillar_scores) {
    const sortedPillars = Object.entries(data.pillar_scores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 2); // Get 2 lowest scoring pillars
    
    sortedPillars.forEach(([pillar, score]) => {
      if (score < 70) {
        weakPillars.push(pillar.toLowerCase());
      }
    });
  }

  // Add hormone-related products if user is struggling
  if (data.hormone_level && ['really-struggling', 'need-support'].includes(data.hormone_level)) {
    weakPillars.push('balance');
  }

  // Add nutrition-related products if score is low
  if (data.nutrition_score && data.nutrition_score < 70) {
    weakPillars.push('body', 'beauty');
  }

  // Remove duplicates
  return [...new Set(weakPillars)];
};

/**
 * Fetch products that match specific pillars
 */
const matchProductsToPillars = async (pillars: string[]): Promise<Product[]> => {
  if (pillars.length === 0) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .overlaps('target_pillars', pillars)
      .order('evidence_level', { ascending: true }) // Gold first
      .limit(6);

    if (error) {
      console.error('Error fetching products by pillars:', error);
      return [];
    }

    return data as unknown as Product[];
  } catch (error) {
    console.error('Error in matchProductsToPillars:', error);
    return [];
  }
};

/**
 * Get products filtered by specific pillar
 */
export const getProductsByPillar = async (pillar: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .contains('target_pillars', [pillar])
      .order('display_order');

    if (error) {
      console.error('Error fetching products by pillar:', error);
      return [];
    }

    return data as unknown as Product[];
  } catch (error) {
    console.error('Error in getProductsByPillar:', error);
    return [];
  }
};

/**
 * Get products filtered by use case
 */
export const getProductsByUseCase = async (useCase: string): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .contains('use_cases', [useCase])
      .order('display_order');

    if (error) {
      console.error('Error fetching products by use case:', error);
      return [];
    }

    return data as unknown as Product[];
  } catch (error) {
    console.error('Error in getProductsByUseCase:', error);
    return [];
  }
};
