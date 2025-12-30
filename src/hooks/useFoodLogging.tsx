import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

export interface FoodAnalysisResult {
  food_items: string[];
  calories_estimated: number;
  protein_g: number;
  carbs_g: number;
  fats_g: number;
  fibre_g: number;
  serving_size_estimate: string;
  confidence_score: number;
  meal_description: string;
  health_notes: string[];
}

export interface MealPhoto {
  id: string;
  user_id: string;
  photo_url: string | null;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  meal_date: string;
  analysis_result: FoodAnalysisResult | Record<string, unknown> | null;
  calories_estimated: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  fibre_g: number | null;
  food_items: string[] | null;
  confirmed: boolean;
  user_adjusted: boolean;
  created_at: string;
}

export interface DailyMacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fibre: number;
  mealCount: number;
}

export function useFoodLogging() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Fetch today's meals
  const { data: todaysMeals, isLoading: isLoadingMeals } = useQuery({
    queryKey: ['meal-photos', 'today', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('meal_photos')
        .select('*')
        .eq('user_id', user.id)
        .eq('meal_date', today)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as MealPhoto[];
    },
    enabled: !!user,
  });

  // Fetch weekly meals for trends
  const { data: weeklyMeals } = useQuery({
    queryKey: ['meal-photos', 'weekly', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('meal_photos')
        .select('*')
        .eq('user_id', user.id)
        .eq('confirmed', true)
        .gte('meal_date', weekAgo.toISOString().split('T')[0])
        .order('meal_date', { ascending: false });

      if (error) throw error;
      return (data || []) as unknown as MealPhoto[];
    },
    enabled: !!user,
  });

  // Calculate daily macro totals (confirmed meals only)
  const getDailyMacroTotals = (): DailyMacroTotals => {
    const confirmedMeals = (todaysMeals || []).filter(m => m.confirmed);
    
    return confirmedMeals.reduce((acc, meal) => ({
      calories: acc.calories + (meal.calories_estimated || 0),
      protein: acc.protein + (meal.protein_g || 0),
      carbs: acc.carbs + (meal.carbs_g || 0),
      fats: acc.fats + (meal.fats_g || 0),
      fibre: acc.fibre + (meal.fibre_g || 0),
      mealCount: acc.mealCount + 1,
    }), { calories: 0, protein: 0, carbs: 0, fats: 0, fibre: 0, mealCount: 0 });
  };

  // Analyze photo mutation
  const analyzePhotoMutation = useMutation({
    mutationFn: async ({ imageBase64, mealType }: { imageBase64: string; mealType: string }) => {
      setIsAnalyzing(true);
      
      const { data, error } = await supabase.functions.invoke('analyze-food-photo', {
        body: { imageBase64, mealType }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      return data.analysis as FoodAnalysisResult;
    },
    onError: (error) => {
      console.error('Analysis error:', error);
      toast({
        title: t('foodScanner.analysisError', 'Analysis Failed'),
        description: error instanceof Error ? error.message : t('foodScanner.tryAgain', 'Please try again with a clearer photo'),
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsAnalyzing(false);
    }
  });

  // Save meal (unconfirmed) mutation
  const saveMealMutation = useMutation({
    mutationFn: async ({ 
      photoUrl, 
      mealType, 
      analysis,
      confirmed = false 
    }: { 
      photoUrl?: string; 
      mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      analysis: FoodAnalysisResult;
      confirmed?: boolean;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meal_photos')
        .insert({
          user_id: user.id,
          photo_url: photoUrl || null,
          meal_type: mealType,
          meal_date: new Date().toISOString().split('T')[0],
          analysis_result: analysis as any,
          calories_estimated: Math.round(analysis.calories_estimated),
          protein_g: Number(analysis.protein_g.toFixed(1)),
          carbs_g: Number(analysis.carbs_g.toFixed(1)),
          fats_g: Number(analysis.fats_g.toFixed(1)),
          fibre_g: Number(analysis.fibre_g.toFixed(1)),
          food_items: analysis.food_items,
          confirmed,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-photos'] });
    },
    onError: (error) => {
      console.error('Save meal error:', error);
      toast({
        title: t('foodScanner.saveError', 'Save Failed'),
        description: t('foodScanner.saveErrorDesc', 'Could not save meal. Please try again.'),
        variant: 'destructive',
      });
    }
  });

  // Confirm meal mutation
  const confirmMealMutation = useMutation({
    mutationFn: async ({ 
      mealId, 
      adjustedValues 
    }: { 
      mealId: string; 
      adjustedValues?: Partial<Pick<MealPhoto, 'calories_estimated' | 'protein_g' | 'carbs_g' | 'fats_g' | 'fibre_g'>> 
    }) => {
      const updateData: any = { confirmed: true };
      
      if (adjustedValues) {
        updateData.user_adjusted = true;
        Object.assign(updateData, adjustedValues);
      }

      const { data, error } = await supabase
        .from('meal_photos')
        .update(updateData)
        .eq('id', mealId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-photos'] });
      toast({
        title: t('foodScanner.addedSuccess', 'Meal Added!'),
        description: t('foodScanner.addedToRecord', 'Added to your daily nutrition record.'),
      });
    },
    onError: (error) => {
      console.error('Confirm meal error:', error);
      toast({
        title: t('foodScanner.confirmError', 'Confirmation Failed'),
        description: t('foodScanner.confirmErrorDesc', 'Could not confirm meal. Please try again.'),
        variant: 'destructive',
      });
    }
  });

  // Delete meal mutation
  const deleteMealMutation = useMutation({
    mutationFn: async (mealId: string) => {
      const { error } = await supabase
        .from('meal_photos')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meal-photos'] });
      toast({
        title: t('foodScanner.deleted', 'Meal Removed'),
        description: t('foodScanner.deletedDesc', 'The meal has been removed from your record.'),
      });
    },
    onError: (error) => {
      console.error('Delete meal error:', error);
      toast({
        title: t('foodScanner.deleteError', 'Delete Failed'),
        description: t('foodScanner.deleteErrorDesc', 'Could not delete meal. Please try again.'),
        variant: 'destructive',
      });
    }
  });

  // Upload photo to storage
  const uploadPhoto = async (imageBase64: string): Promise<string | null> => {
    if (!user) return null;

    try {
      // Convert base64 to blob
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const fileName = `${user.id}/${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from('meal-photos')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('meal-photos')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  return {
    // Data
    todaysMeals: todaysMeals || [],
    weeklyMeals: weeklyMeals || [],
    dailyTotals: getDailyMacroTotals(),
    confirmedMealsToday: (todaysMeals || []).filter(m => m.confirmed),
    
    // Loading states
    isLoadingMeals,
    isAnalyzing,
    isSaving: saveMealMutation.isPending,
    isConfirming: confirmMealMutation.isPending,
    isDeleting: deleteMealMutation.isPending,
    
    // Actions
    analyzePhoto: analyzePhotoMutation.mutateAsync,
    saveMeal: saveMealMutation.mutateAsync,
    confirmMeal: confirmMealMutation.mutateAsync,
    deleteMeal: deleteMealMutation.mutateAsync,
    uploadPhoto,
  };
}
