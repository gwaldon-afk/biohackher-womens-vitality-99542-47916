import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface FoodPreferences {
  likedFoods: string[];
  dislikedFoods: string[];
}

export const useFoodPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<FoodPreferences>({
    likedFoods: [],
    dislikedFoods: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from Supabase
  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      // Load from localStorage for non-authenticated users
      const saved = localStorage.getItem('foodPreferences');
      if (saved) {
        setPreferences(JSON.parse(saved));
      }
      setIsLoading(false);
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('nutrition_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading food preferences:', error);
        return;
      }

      if (data) {
        setPreferences({
          likedFoods: (data as any).liked_foods || [],
          dislikedFoods: (data as any).disliked_foods || []
        });
      }
    } catch (error) {
      console.error('Error loading food preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: FoodPreferences) => {
    if (user) {
      try {
        const { error } = await supabase
          .from('nutrition_preferences')
          .upsert({
            user_id: user.id,
            liked_foods: newPreferences.likedFoods,
            disliked_foods: newPreferences.dislikedFoods
          }, { onConflict: 'user_id' });

        if (error) throw error;

        toast({
          title: "Preferences saved",
          description: "Your food preferences have been updated."
        });
      } catch (error) {
        console.error('Error saving food preferences:', error);
        toast({
          title: "Error saving preferences",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } else {
      // Save to localStorage for non-authenticated users
      localStorage.setItem('foodPreferences', JSON.stringify(newPreferences));
    }
    
    setPreferences(newPreferences);
  };

  const addLikedFood = (foodId: string) => {
    const newPreferences = {
      likedFoods: [...preferences.likedFoods.filter(id => id !== foodId), foodId],
      dislikedFoods: preferences.dislikedFoods.filter(id => id !== foodId)
    };
    savePreferences(newPreferences);
  };

  const addDislikedFood = (foodId: string) => {
    const newPreferences = {
      likedFoods: preferences.likedFoods.filter(id => id !== foodId),
      dislikedFoods: [...preferences.dislikedFoods.filter(id => id !== foodId), foodId]
    };
    savePreferences(newPreferences);
  };

  const removeLikedFood = (foodId: string) => {
    const newPreferences = {
      ...preferences,
      likedFoods: preferences.likedFoods.filter(id => id !== foodId)
    };
    savePreferences(newPreferences);
  };

  const removeDislikedFood = (foodId: string) => {
    const newPreferences = {
      ...preferences,
      dislikedFoods: preferences.dislikedFoods.filter(id => id !== foodId)
    };
    savePreferences(newPreferences);
  };

  const clearAllPreferences = () => {
    savePreferences({ likedFoods: [], dislikedFoods: [] });
  };

  return {
    preferences,
    isLoading,
    addLikedFood,
    addDislikedFood,
    removeLikedFood,
    removeDislikedFood,
    clearAllPreferences
  };
};
