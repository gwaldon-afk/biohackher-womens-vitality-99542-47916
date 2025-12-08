/**
 * Hook for managing test personas with LocalStorage overrides
 */
import { useState, useEffect, useCallback } from 'react';
import { TEST_PERSONAS, TestPersona, getTestPersona } from '@/config/mockTestPersonas';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const STORAGE_KEY = 'dev_test_persona_overrides';

interface PersonaOverrides {
  [personaId: string]: Partial<TestPersona>;
}

export const useTestPersonas = () => {
  const [overrides, setOverrides] = useState<PersonaOverrides>({});
  const [isRunning, setIsRunning] = useState(false);

  // Load overrides from LocalStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setOverrides(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load persona overrides:', error);
    }
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

  // Run assessments for selected personas
  const runAssessments = useCallback(async (
    personaIds: string[],
    assessmentTypes: ('lis' | 'nutrition' | 'hormone')[]
  ): Promise<{ success: boolean; results: string[] }> => {
    setIsRunning(true);
    const results: string[] = [];

    try {
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
                user_id: persona.testUserId,
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
                questionnaire_data: persona.lisData.answers,
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
                user_id: persona.testUserId,
                session_id: `test-session-${Date.now()}`,
                overall_score: persona.nutritionData.overallScore,
                grade: persona.nutritionData.grade,
                pillar_scores: {
                  body: persona.nutritionData.proteinScore * 20,
                  brain: (5 - persona.nutritionData.inflammationScore) * 20,
                  balance: persona.nutritionData.hydrationScore * 20,
                  beauty: (5 - persona.nutritionData.gutSymptomScore) * 20,
                },
                assessment_data: persona.nutritionData.answers,
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
                user_id: persona.testUserId,
                stage: persona.demographics.menopauseStage,
                confidence_score: 0.85,
                hormone_indicators: {
                  energy_vitality: persona.hormoneData.energyVitalityScore,
                  sleep_recovery: persona.hormoneData.sleepRecoveryScore,
                  mood_cognition: persona.hormoneData.moodCognitionScore,
                  physical_symptoms: persona.hormoneData.physicalSymptomsScore,
                  metabolic_health: persona.hormoneData.metabolicHealthScore,
                  intimate_wellness: persona.hormoneData.intimateWellnessScore,
                },
                assessment_id: `test-assessment-${Date.now()}`,
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
              user_id: persona.testUserId,
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
      }

      toast.success(`Ran ${assessmentTypes.length} assessment(s) for ${personaIds.length} persona(s)`);
      return { success: true, results };
    } catch (error) {
      toast.error('Failed to run assessments');
      return { success: false, results };
    } finally {
      setIsRunning(false);
    }
  }, [getPersona]);

  // Clear all test data from database
  const clearTestData = useCallback(async () => {
    setIsRunning(true);
    try {
      const testUserIds = TEST_PERSONAS.map(p => p.testUserId);

      // Clear from all assessment tables
      await Promise.all([
        supabase.from('daily_scores').delete().in('user_id', testUserIds),
        supabase.from('longevity_nutrition_assessments').delete().in('user_id', testUserIds),
        supabase.from('hormone_compass_stages').delete().in('user_id', testUserIds),
        supabase.from('assessment_progress').delete().in('user_id', testUserIds),
      ]);

      toast.success('Cleared all test data');
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
  };
};
