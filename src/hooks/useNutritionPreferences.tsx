import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface NutritionPreferences {
  weight: string;
  activityLevel: string;
  goal: string;
  isLowFODMAP: boolean;
  hasIBS: boolean;
  allergies: string[];
  dislikes: string[];
  selectedRecipeStyle: string;
  selectedBreakfastRecipe: string;
  selectedLunchRecipe: string;
  selectedDinnerRecipe: string;
}

export const useNutritionPreferences = () => {
  console.log('[useNutritionPreferences] Hook called');
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  console.log('[useNutritionPreferences] User:', user);
  
  const [preferences, setPreferences] = useState<NutritionPreferences>({
    weight: "",
    activityLevel: "moderate",
    goal: "maintenance",
    isLowFODMAP: false,
    hasIBS: false,
    allergies: [],
    dislikes: [],
    selectedRecipeStyle: "simple",
    selectedBreakfastRecipe: "",
    selectedLunchRecipe: "",
    selectedDinnerRecipe: "",
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasPreferences, setHasPreferences] = useState(false);

  useEffect(() => {
    console.log('[useNutritionPreferences] useEffect triggered, user:', user);
    if (user) {
      console.log('[useNutritionPreferences] Loading preferences for user');
      loadPreferences();
    } else {
      console.log('[useNutritionPreferences] No user, setting isLoading to false');
      setIsLoading(false);
    }
  }, [user]);

  const loadPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          weight: data.weight?.toString() || "",
          activityLevel: data.activity_level || "moderate",
          goal: data.fitness_goal || "maintenance",
          allergies: data.allergies || [],
          dislikes: data.dislikes || [],
          selectedRecipeStyle: data.selected_recipe_style || "simple",
          selectedBreakfastRecipe: data.selected_breakfast_recipe || "",
          selectedLunchRecipe: data.selected_lunch_recipe || "",
          selectedDinnerRecipe: data.selected_dinner_recipe || "",
          isLowFODMAP: data.is_low_fodmap || false,
          hasIBS: data.has_ibs || false,
        });
        setHasPreferences(true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const prefsData = {
        user_id: user.id,
        weight: preferences.weight ? parseFloat(preferences.weight) : null,
        activity_level: preferences.activityLevel,
        fitness_goal: preferences.goal,
        allergies: preferences.allergies,
        dislikes: preferences.dislikes,
        selected_recipe_style: preferences.selectedRecipeStyle,
        selected_breakfast_recipe: preferences.selectedBreakfastRecipe,
        selected_lunch_recipe: preferences.selectedLunchRecipe,
        selected_dinner_recipe: preferences.selectedDinnerRecipe,
        is_low_fodmap: preferences.isLowFODMAP,
        has_ibs: preferences.hasIBS
      };

      const { error } = await supabase
        .from('nutrition_preferences')
        .upsert(prefsData, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      setHasPreferences(true);
      toast({
        title: t('nutrition.savedMessage'),
        description: t('nutrition.savedDescription'),
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: t('nutrition.errorSaving'),
        description: t('nutrition.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    preferences,
    setPreferences,
    isLoading,
    isSaving,
    hasPreferences,
    savePreferences,
  };
};
