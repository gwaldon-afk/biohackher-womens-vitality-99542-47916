/**
 * Hook for managing test personas with LocalStorage overrides
 * Uses current authenticated user's ID for database inserts (RLS compliance)
 */
import { useState, useEffect, useCallback } from 'react';
import { TEST_PERSONAS, TestPersona, getTestPersona } from '@/config/mockTestPersonas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STORAGE_KEY = 'dev_test_persona_overrides';

interface PersonaOverrides {
  [personaId: string]: Partial<TestPersona>;
}

// === Database Value Mapping Functions ===
// These map test persona values to valid database constraint values

const mapGoalToDb = (goal: string): string => {
  const mapping: Record<string, string> = {
    'weight_loss': 'fat-loss',
    'energy': 'energy',
    'hormone_balance': 'menopause-support',
    'cognitive': 'cognitive-performance',
    'sleep': 'longevity',
    'longevity': 'longevity',
  };
  return mapping[goal] || 'longevity';
};

const mapEatingPersonalityToDb = (personality: string): string => {
  const mapping: Record<string, string> = {
    'emotional_eater': 'emotional-eater',
    'busy_grazer': 'grazer',
    'mindful_but_inconsistent': 'grazer',
    'health_conscious': 'high-protein-performer',
    'traditional_homecook': 'gut-healer',
    'biohacker': 'high-protein-performer',
  };
  return mapping[personality] || 'grazer';
};

const mapActivityLevelToDb = (level: string): string => {
  const mapping: Record<string, string> = {
    'sedentary': 'sedentary',
    'light': 'light',
    'moderate': 'moderate',
    'active': 'active',
    'very_active': 'athletic',
  };
  return mapping[level] || 'moderate';
};

const mapMenopauseStageToDb = (stage: string): string => {
  const mapping: Record<string, string> = {
    'cycling': 'cycling',
    'perimenopause': 'perimenopause',
    'postmenopause': 'post-menopause',
  };
  return mapping[stage] || 'perimenopause';
};

const mapHealthLevelToDb = (level: string): string => {
  const mapping: Record<string, string> = {
    'feeling_great': 'feeling-great',
    'doing_well': 'doing-well',
    'having_challenges': 'having-challenges',
    'really_struggling': 'really-struggling',
    'need_support': 'need-support-now',
  };
  return mapping[level] || 'having-challenges';
};

export const useTestPersonas = () => {
  const [overrides, setOverrides] = useState<PersonaOverrides>({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load overrides from LocalStorage and get current user on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOverrides(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load persona overrides:', error);
    }

    // Get current authenticated user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  // Save overrides to LocalStorage
  const saveOverrides = useCallback((newOverrides: PersonaOverrides) => {
    setOverrides(newOverrides);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOverrides));
  }, []);

  // Get a persona with any LocalStorage overrides applied
  const getPersona = useCallback((id: string): TestPersona | undefined => {
    const base = getTestPersona(id);
    if (!base) return undefined;

    const personaOverride = overrides[id];
    if (!personaOverride) return base;

    // Deep merge the override
    return {
      ...base,
      ...personaOverride,
      demographics: { ...base.demographics, ...personaOverride.demographics },
      lisData: { ...base.lisData, ...personaOverride.lisData },
      nutritionData: { ...base.nutritionData, ...personaOverride.nutritionData },
      hormoneData: { ...base.hormoneData, ...personaOverride.hormoneData },
      goals: personaOverride.goals || base.goals,
      protocols: personaOverride.protocols || base.protocols,
    } as TestPersona;
  }, [overrides]);

  // Get all personas with overrides applied
  const getAllPersonas = useCallback((): TestPersona[] => {
    return TEST_PERSONAS.map(p => getPersona(p.id) || p);
  }, [getPersona]);

  // Update a specific field for a persona
  const updatePersonaField = useCallback((personaId: string, path: string, value: unknown) => {
    const newOverrides = { ...overrides };
    if (!newOverrides[personaId]) {
      newOverrides[personaId] = {};
    }

    // Handle nested paths like "demographics.age"
    const parts = path.split('.');
    let target = newOverrides[personaId] as Record<string, unknown>;
    
    for (let i = 0; i < parts.length - 1; i++) {
      if (!target[parts[i]]) {
        target[parts[i]] = {};
      }
      target = target[parts[i]] as Record<string, unknown>;
    }
    
    target[parts[parts.length - 1]] = value;
    saveOverrides(newOverrides);
  }, [overrides, saveOverrides]);

  // Reset a persona to defaults (remove overrides)
  const resetPersona = useCallback((personaId: string) => {
    const newOverrides = { ...overrides };
    delete newOverrides[personaId];
    saveOverrides(newOverrides);
  }, [overrides, saveOverrides]);

  // Reset all overrides
  const resetAllOverrides = useCallback(() => {
    saveOverrides({});
  }, [saveOverrides]);

  // Run assessments for selected personas using CURRENT USER's ID
  const runAssessments = useCallback(async (
    personaIds: string[],
    assessmentTypes: ('lis' | 'nutrition' | 'hormone')[]
  ): Promise<{ success: boolean; results: string[] }> => {
    setIsRunning(true);
    const results: string[] = [];

    try {
      // Get current authenticated user - REQUIRED for RLS
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to run test assessments');
        return { success: false, results: ['Not authenticated - please log in first'] };
      }

      const userId = user.id;

      // Note: Sequential testing - only one persona's data at a time
      // Each run overwrites previous test data for this user
      for (const personaId of personaIds) {
        const persona = getPersona(personaId);
        if (!persona) {
          results.push(`${personaId}: Persona not found`);
          continue;
        }

        // Run LIS Assessment
        if (assessmentTypes.includes('lis')) {
          try {
            const { error } = await supabase
              .from('daily_scores')
              .upsert({
                user_id: userId,
                date: new Date().toISOString().split('T')[0],
                longevity_impact_score: persona.lisData.overallScore,
                biological_age_impact: persona.lisData.biologicalAgeOffset,
                sleep_score: persona.lisData.sleepScore,
                stress_score: persona.lisData.stressScore,
                physical_activity_score: persona.lisData.activityScore,
                nutrition_score: persona.lisData.nutritionScore,
                social_connections_score: persona.lisData.socialScore,
                cognitive_engagement_score: persona.lisData.cognitiveScore,
                color_code: persona.lisData.overallScore >= 70 ? 'green' : persona.lisData.overallScore >= 50 ? 'yellow' : 'red',
                user_chronological_age: persona.demographics.age,
                is_baseline: true, // Required for Profile page to find it
                questionnaire_data: {
                  ...persona.lisData.answers,
                  _test_persona: persona.id,
                  _test_source: 'dev_test_panel'
                },
                source_type: 'manual_entry',
              }, { onConflict: 'user_id,date' });

            if (error) throw error;
            results.push(`${persona.name} LIS: ✓ Score ${persona.lisData.overallScore}`);
          } catch (error) {
            results.push(`${persona.name} LIS: ✗ ${error instanceof Error ? error.message : 'Failed'}`);
          }
        }

        // Run Nutrition Assessment
        if (assessmentTypes.includes('nutrition')) {
          try {
            const { error } = await supabase
              .from('longevity_nutrition_assessments')
              .insert({
                user_id: userId,
                session_id: `test-${persona.id}-${Date.now()}`,
                longevity_nutrition_score: persona.nutritionData.overallScore,
                protein_score: persona.nutritionData.proteinScore,
                fiber_score: persona.nutritionData.fiberScore,
                plant_diversity_score: persona.nutritionData.plantDiversityScore,
                gut_symptom_score: persona.nutritionData.gutSymptomScore,
                inflammation_score: persona.nutritionData.inflammationScore,
                craving_pattern: persona.nutritionData.cravingPattern,
                hydration_score: persona.nutritionData.hydrationScore,
                nutrition_identity_type: mapEatingPersonalityToDb(persona.nutritionData.eatingPersonality),
                age: persona.demographics.age,
                height_cm: persona.demographics.height,
                weight_kg: persona.demographics.weight,
                activity_level: mapActivityLevelToDb(persona.demographics.activityLevel),
                goal_primary: mapGoalToDb(persona.demographics.primaryGoal),
                menopause_stage: mapMenopauseStageToDb(persona.demographics.menopauseStage),
                completed_at: new Date().toISOString(),
              });

            if (error) throw error;
            results.push(`${persona.name} Nutrition: ✓ Score ${persona.nutritionData.overallScore}`);
          } catch (error) {
            results.push(`${persona.name} Nutrition: ✗ ${error instanceof Error ? error.message : 'Failed'}`);
          }
        }

        // Run Hormone Assessment
        if (assessmentTypes.includes('hormone')) {
          try {
            const { error } = await supabase
              .from('hormone_compass_stages')
              .insert({
                user_id: userId,
                stage: mapHealthLevelToDb(persona.hormoneData.healthLevel), // Health level, NOT menopause stage
                confidence_score: 0.85,
                hormone_indicators: {
                  energy_vitality: persona.hormoneData.energyVitalityScore,
                  sleep_recovery: persona.hormoneData.sleepRecoveryScore,
                  mood_cognition: persona.hormoneData.moodCognitionScore,
                  physical_symptoms: persona.hormoneData.physicalSymptomsScore,
                  metabolic_health: persona.hormoneData.metabolicHealthScore,
                  intimate_wellness: persona.hormoneData.intimateWellnessScore,
                },
                assessment_id: crypto.randomUUID(),
                calculated_at: new Date().toISOString(),
              });

            if (error) throw error;
            results.push(`${persona.name} Hormone: ✓ Level ${persona.hormoneData.healthLevel}`);
          } catch (error) {
            results.push(`${persona.name} Hormone: ✗ ${error instanceof Error ? error.message : 'Failed'}`);
          }
        }

        // Update assessment progress
        try {
          await supabase
            .from('assessment_progress')
            .upsert({
              user_id: userId, // Use current user's ID
              lis_completed: assessmentTypes.includes('lis'),
              lis_completed_at: assessmentTypes.includes('lis') ? new Date().toISOString() : null,
              nutrition_completed: assessmentTypes.includes('nutrition'),
              nutrition_completed_at: assessmentTypes.includes('nutrition') ? new Date().toISOString() : null,
              hormone_completed: assessmentTypes.includes('hormone'),
              hormone_completed_at: assessmentTypes.includes('hormone') ? new Date().toISOString() : null,
            }, { onConflict: 'user_id' });
        } catch (error) {
          console.error('Failed to update assessment progress:', error);
        }

        // Set subscription tier based on persona
        if (persona.subscriptionTier) {
          try {
            const futureDate = new Date();
            futureDate.setFullYear(futureDate.getFullYear() + 1);
            
            await supabase
              .from('user_subscriptions')
              .upsert({
                user_id: userId,
                subscription_tier: persona.subscriptionTier,
                subscription_status: 'active',
                subscription_start_date: new Date().toISOString(),
                subscription_end_date: futureDate.toISOString(),
                daily_submissions_count: 0,
              }, { onConflict: 'user_id' });
            
            // Store tier in localStorage for test mode hooks to read
            localStorage.setItem('testModeTier', persona.subscriptionTier);
            results.push(`${persona.name} Subscription: ✓ ${persona.subscriptionTier}`);
          } catch (error) {
            results.push(`${persona.name} Subscription: ✗ ${error instanceof Error ? error.message : 'Failed'}`);
          }
        }

        // Set up wearable connection if applicable
        if (persona.dataInputMethod === 'wearable' && persona.wearableProvider) {
          try {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 30);
            
            // First check if connection exists
            const { data: existing } = await supabase
              .from('wearable_connections')
              .select('id')
              .eq('user_id', userId)
              .eq('provider', persona.wearableProvider)
              .maybeSingle();

            if (existing) {
              // Update existing
              await supabase
                .from('wearable_connections')
                .update({
                  is_active: true,
                  access_token: 'demo_access_token',
                  refresh_token: 'demo_refresh_token',
                  token_expires_at: futureDate.toISOString(),
                })
                .eq('id', existing.id);
            } else {
              // Insert new
              await supabase
                .from('wearable_connections')
                .insert({
                  user_id: userId,
                  provider: persona.wearableProvider,
                  is_active: true,
                  access_token: 'demo_access_token',
                  refresh_token: 'demo_refresh_token',
                  token_expires_at: futureDate.toISOString(),
                });
            }
            
            results.push(`${persona.name} Wearable: ✓ ${persona.wearableProvider} connected`);
          } catch (error) {
            results.push(`${persona.name} Wearable: ✗ ${error instanceof Error ? error.message : 'Failed'}`);
          }
        }

        // Populate health profile with persona demographics
        try {
          const dateOfBirth = new Date();
          dateOfBirth.setFullYear(dateOfBirth.getFullYear() - persona.demographics.age);
          
          await supabase
            .from('user_health_profile')
            .upsert({
              user_id: userId,
              date_of_birth: dateOfBirth.toISOString().split('T')[0],
              weight_kg: persona.demographics.weight,
              height_cm: persona.demographics.height,
              activity_level: mapActivityLevelToDb(persona.demographics.activityLevel),
            }, { onConflict: 'user_id' });
            
          results.push(`${persona.name} Health Profile: ✓ Updated`);
        } catch (error) {
          results.push(`${persona.name} Health Profile: ✗ ${error instanceof Error ? error.message : 'Failed'}`);
        }
      }

      toast.success(`Applied ${personaIds[personaIds.length - 1]} persona data to your account`);
      return { success: true, results };
    } catch (error) {
      toast.error('Failed to run assessments');
      return { success: false, results };
    } finally {
      setIsRunning(false);
    }
  }, [getPersona]);

  // Clear test data for current user
  const clearTestData = useCallback(async () => {
    setIsRunning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to clear test data');
        return;
      }

      const userId = user.id;

      // Clear current user's test data
      await Promise.all([
        supabase.from('daily_scores').delete().eq('user_id', userId),
        supabase.from('longevity_nutrition_assessments').delete().eq('user_id', userId),
        supabase.from('hormone_compass_stages').delete().eq('user_id', userId),
        supabase.from('assessment_progress').delete().eq('user_id', userId),
        supabase.from('wearable_connections').delete().eq('user_id', userId),
        supabase.from('user_health_profile').delete().eq('user_id', userId),
      ]);

      // Note: Don't remove testModeTier - it's no longer used with real auth

      toast.success('Cleared your test data');
    } catch (error) {
      toast.error('Failed to clear test data');
      console.error('Clear test data error:', error);
    } finally {
      setIsRunning(false);
    }
  }, []);

  return {
    personas: getAllPersonas(),
    getPersona,
    updatePersonaField,
    resetPersona,
    resetAllOverrides,
    runAssessments,
    clearTestData,
    isRunning,
    hasOverrides: Object.keys(overrides).length > 0,
    currentUserId,
  };
};
