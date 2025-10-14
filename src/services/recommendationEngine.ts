import { supabase } from "@/integrations/supabase/client";
import { ToolkitItem } from "./toolkitService";
import { Product } from "./productService";

export interface UserRecommendation {
  id: string;
  user_id: string;
  toolkit_item_id: string;
  suitability_score: number;
  applicability_score: number;
  priority_rank: number;
  matched_symptoms: string[] | null;
  matched_assessments: string[] | null;
  contraindication_flags: Array<{ condition: string; severity: string }> | null;
  viewed_at: string | null;
  started_at: string | null;
  completed_count: number;
  last_used_at: string | null;
}

/**
 * Calculate suitability score based on symptom matching
 * Higher score = better match for user's symptoms
 */
export const calculateSuitabilityScore = (
  itemSymptoms: string[] | null,
  userSymptoms: string[]
): number => {
  if (!itemSymptoms || itemSymptoms.length === 0) return 0;
  if (!userSymptoms || userSymptoms.length === 0) return 0;

  const matchedSymptoms = itemSymptoms.filter(symptom => 
    userSymptoms.includes(symptom)
  );

  const matchRatio = matchedSymptoms.length / itemSymptoms.length;
  return Math.round(matchRatio * 100);
};

/**
 * Calculate applicability score based on contraindications
 * Lower score = more contraindications present
 */
export const calculateApplicabilityScore = (
  contraindications: Array<{ condition: string; severity: string }> | null,
  userHealthProfile: any
): number => {
  if (!contraindications || contraindications.length === 0) return 100;

  let score = 100;
  const flaggedContraindications: Array<{ condition: string; severity: string }> = [];

  contraindications.forEach(contra => {
    // Check if user has this condition
    // This is simplified - you'd need to expand based on your health profile structure
    const hasCondition = checkUserCondition(contra.condition, userHealthProfile);
    
    if (hasCondition) {
      flaggedContraindications.push(contra);
      
      // Deduct score based on severity
      if (contra.severity === 'high') {
        score = 0; // Hard contraindication - not recommended
      } else if (contra.severity === 'medium') {
        score -= 50;
      } else {
        score -= 25;
      }
    }
  });

  return Math.max(0, score);
};

/**
 * Check if user has a specific health condition
 */
const checkUserCondition = (condition: string, userHealthProfile: any): boolean => {
  if (!userHealthProfile) return false;

  const conditionLower = condition.toLowerCase();
  
  // Check pregnancy
  if (conditionLower.includes('pregnancy')) {
    return userHealthProfile.is_pregnant || false;
  }
  
  // Check heart conditions
  if (conditionLower.includes('heart') || conditionLower.includes('cardiovascular')) {
    return userHealthProfile.has_heart_condition || false;
  }
  
  // Check autoimmune
  if (conditionLower.includes('autoimmune')) {
    return userHealthProfile.has_autoimmune_condition || false;
  }

  // Add more condition checks as needed
  return false;
};

/**
 * Generate recommendations for a user
 */
export const generateUserRecommendations = async (
  userId: string,
  toolkitItems: ToolkitItem[],
  userSymptoms: string[],
  userHealthProfile: any
) => {
  const recommendations: Partial<UserRecommendation>[] = [];

  toolkitItems.forEach((item, index) => {
    const suitabilityScore = calculateSuitabilityScore(
      item.target_symptoms,
      userSymptoms
    );
    
    const applicabilityScore = calculateApplicabilityScore(
      item.contraindications,
      userHealthProfile
    );

    // Only recommend if scores are above threshold
    if (suitabilityScore > 20 && applicabilityScore > 0) {
      const matchedSymptoms = item.target_symptoms?.filter(symptom => 
        userSymptoms.includes(symptom)
      ) || [];

      const contraindictionFlags = item.contraindications?.filter(contra =>
        checkUserCondition(contra.condition, userHealthProfile)
      ) || [];

      recommendations.push({
        user_id: userId,
        toolkit_item_id: item.id,
        suitability_score: suitabilityScore,
        applicability_score: applicabilityScore,
        priority_rank: index + 1, // Will be recalculated after sorting
        matched_symptoms: matchedSymptoms,
        matched_assessments: null,
        contraindication_flags: contraindictionFlags.length > 0 ? contraindictionFlags : null,
        completed_count: 0,
      });
    }
  });

  // Sort by combined score (suitability * applicability)
  recommendations.sort((a, b) => {
    const scoreA = (a.suitability_score || 0) * (a.applicability_score || 0) / 100;
    const scoreB = (b.suitability_score || 0) * (b.applicability_score || 0) / 100;
    return scoreB - scoreA;
  });

  // Update priority ranks
  recommendations.forEach((rec, index) => {
    rec.priority_rank = index + 1;
  });

  return recommendations;
};

/**
 * Save recommendations to database
 */
export const saveUserRecommendations = async (
  recommendations: Partial<UserRecommendation>[]
) => {
  const { error } = await supabase
    .from('user_toolkit_recommendations')
    .upsert(recommendations as any, {
      onConflict: 'user_id,toolkit_item_id'
    });

  if (error) {
    console.error('Error saving recommendations:', error);
    throw error;
  }
};

/**
 * Fetch user's recommendations
 */
export const getUserRecommendations = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_toolkit_recommendations')
    .select(`
      *,
      toolkit_item:toolkit_items(
        *,
        category:toolkit_categories(*)
      )
    `)
    .eq('user_id', userId)
    .order('priority_rank');

  if (error) {
    console.error('Error fetching user recommendations:', error);
    throw error;
  }

  return data;
};

/**
 * Mark recommendation as viewed
 */
export const markRecommendationViewed = async (
  userId: string,
  toolkitItemId: string
) => {
  const { error } = await supabase
    .from('user_toolkit_recommendations')
    .update({ viewed_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('toolkit_item_id', toolkitItemId);

  if (error) {
    console.error('Error marking recommendation as viewed:', error);
    throw error;
  }
};

/**
 * Mark recommendation as started
 */
export const markRecommendationStarted = async (
  userId: string,
  toolkitItemId: string
) => {
  const { error } = await supabase
    .from('user_toolkit_recommendations')
    .update({ 
      started_at: new Date().toISOString(),
      last_used_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('toolkit_item_id', toolkitItemId);

  if (error) {
    console.error('Error marking recommendation as started:', error);
    throw error;
  }
};

/**
 * Increment completed count
 */
export const incrementRecommendationCompleted = async (
  userId: string,
  toolkitItemId: string
) => {
  const { data: current } = await supabase
    .from('user_toolkit_recommendations')
    .select('completed_count')
    .eq('user_id', userId)
    .eq('toolkit_item_id', toolkitItemId)
    .single();

  if (current) {
    const { error } = await supabase
      .from('user_toolkit_recommendations')
      .update({ 
        completed_count: (current.completed_count || 0) + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('toolkit_item_id', toolkitItemId);

    if (error) {
      console.error('Error incrementing completed count:', error);
      throw error;
    }
  }
};

// ============= AI Assistant Recommendation Functions =============

/**
 * Extract health topics from AI response text for contextual recommendations
 */
export function extractHealthTopicsFromText(text: string): string[] {
  const topics: string[] = [];
  const lowerText = text.toLowerCase();
  
  // Health topics to detect
  const topicKeywords = {
    sleep: ['sleep', 'insomnia', 'rest', 'melatonin', 'circadian'],
    energy: ['energy', 'fatigue', 'tired', 'exhaustion', 'vitality'],
    cognitive: ['brain', 'memory', 'focus', 'concentration', 'mental', 'cognitive'],
    stress: ['stress', 'anxiety', 'cortisol', 'relaxation', 'calm'],
    gut: ['gut', 'digestion', 'microbiome', 'bloating', 'ibs'],
    joint: ['joint', 'pain', 'inflammation', 'arthritis', 'mobility'],
    hormonal: ['hormone', 'hormonal', 'menopause', 'perimenopause', 'testosterone', 'estrogen'],
    immune: ['immune', 'immunity', 'infection', 'defense'],
    cardiovascular: ['heart', 'cardiovascular', 'blood pressure', 'cholesterol'],
    skin: ['skin', 'aging', 'wrinkles', 'collagen']
  };

  // Check for each topic
  Object.entries(topicKeywords).forEach(([topic, keywords]) => {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      topics.push(topic);
    }
  });

  return Array.from(new Set(topics)); // Remove duplicates
}

/**
 * Get relevant products based on detected health topics
 */
export async function getRelevantProducts(topics: string[], limit: number = 5) {
  if (topics.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Score products based on topic relevance
    const scoredProducts = data.map(product => {
      let relevanceScore = 0;
      
      // Check target_symptoms
      if (product.target_symptoms) {
        const symptoms = Array.isArray(product.target_symptoms) 
          ? product.target_symptoms 
          : [];
        
        topics.forEach(topic => {
          if (symptoms.some((s: any) => 
            typeof s === 'string' 
              ? s.toLowerCase().includes(topic)
              : s?.symptom?.toLowerCase().includes(topic)
          )) {
            relevanceScore += 3;
          }
        });
      }

      // Check category
      if (product.category) {
        topics.forEach(topic => {
          if (product.category.toLowerCase().includes(topic)) {
            relevanceScore += 2;
          }
        });
      }

      // Check name and description
      const searchText = `${product.name} ${product.description}`.toLowerCase();
      topics.forEach(topic => {
        if (searchText.includes(topic)) {
          relevanceScore += 1;
        }
      });

      return { ...product, relevanceScore };
    });

    // Sort by relevance and return top results
    return scoredProducts
      .filter(p => p.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching relevant products:', error);
    return [];
  }
}

/**
 * Get relevant toolkit items based on health topics
 */
export async function getRelevantToolkitItems(topics: string[], limit: number = 5) {
  if (topics.length === 0) return [];

  try {
    const { data, error } = await supabase
      .from('toolkit_items')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) throw error;

    // Score toolkit items based on topic relevance
    const scoredItems = data.map(item => {
      let relevanceScore = 0;

      // Check target_symptoms
      if (item.target_symptoms) {
        topics.forEach(topic => {
          const symptomsStr = JSON.stringify(item.target_symptoms).toLowerCase();
          if (symptomsStr.includes(topic)) {
            relevanceScore += 3;
          }
        });
      }

      // Check target_assessment_types
      if (item.target_assessment_types) {
        topics.forEach(topic => {
          const assessmentsStr = JSON.stringify(item.target_assessment_types).toLowerCase();
          if (assessmentsStr.includes(topic)) {
            relevanceScore += 2;
          }
        });
      }

      // Check name and description
      const searchText = `${item.name} ${item.description}`.toLowerCase();
      topics.forEach(topic => {
        if (searchText.includes(topic)) {
          relevanceScore += 1;
        }
      });

      return { ...item, relevanceScore };
    });

    return scoredItems
      .filter(i => i.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching relevant toolkit items:', error);
    return [];
  }
}

/**
 * Score recommendations based on user profile and history
 */
export function scoreRecommendations(items: any[], userProfile: any): any[] {
  // This can be expanded with more sophisticated scoring based on:
  // - User's past purchases
  // - Assessment scores
  // - Current protocols
  // - Subscription tier
  
  return items.map(item => ({
    ...item,
    personalizedScore: item.relevanceScore || 0
  })).sort((a, b) => b.personalizedScore - a.personalizedScore);
}
