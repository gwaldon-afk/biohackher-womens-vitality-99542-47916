import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { useTranslation } from 'react-i18next';
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";
import NutritionPreferencesForm from "@/components/nutrition/NutritionPreferencesForm";
import NutritionCalculator from "@/components/nutrition/NutritionCalculator";
import FoodScienceTab from "@/components/nutrition/FoodScienceTab";
import MealPlansTab from "@/components/nutrition/MealPlansTab";
import NutritionalScorecard from "@/components/NutritionalScorecard";
import { GuidedNutritionOnboarding } from "@/components/onboarding/GuidedNutritionOnboarding";
import { useSearchParams } from "react-router-dom";

const Nutrition = () => {
  console.log('[Nutrition] Component rendering');
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const {
    preferences,
    setPreferences,
    isLoading,
    isSaving,
    hasPreferences,
    savePreferences,
  } = useNutritionPreferences();
  
  console.log('[Nutrition] State:', { preferences, isLoading, hasPreferences });

  const [isEditing, setIsEditing] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [activeTab, setActiveTab] = useState("assessment");

  // Check if guided tour should be shown (from Dashboard navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const showTour = urlParams.get('showTour');
    const onboardingCompleted = localStorage.getItem('nutrition_onboarding_completed');
    
    if (showTour === 'true' && !onboardingCompleted) {
      setShowGuidedTour(true);
      
      // Clean up URL
      window.history.replaceState({}, '', '/nutrition');
    }
  }, []);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'meal-plans') {
      setActiveTab('meals');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Guided Nutrition Onboarding */}
      <GuidedNutritionOnboarding
        isActive={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold gradient-text">{t('nutrition.title')}</h1>
            <ScienceBackedIcon className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground text-center">
            {t('nutrition.description')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-3xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>📚 Educational Information:</strong> This content presents evidence-based nutrition recommendations. 
              It is for educational purposes only and does not constitute medical or dietary advice. 
              Always consult with qualified healthcare or nutrition professionals before making dietary changes.
            </p>
          </div>
        </div>

        <NutritionPreferencesForm
          preferences={preferences}
          setPreferences={setPreferences}
          isLoading={isLoading}
          isSaving={isSaving}
          hasPreferences={hasPreferences}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          onSave={savePreferences}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="assessment">Daily Assessment</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="food-science">Food Science</TabsTrigger>
            <TabsTrigger value="meals">Meal Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="assessment" className="mt-6">
            <NutritionalScorecard 
              onScoreCalculated={(score, grade) => {
                console.log('Nutrition score:', score, grade);
              }}
              hasDairySensitivity={preferences.hasIBS || preferences.isLowFODMAP}
            />
          </TabsContent>
          
          <TabsContent value="calculator" className="mt-6">
            <NutritionCalculator
              weight={preferences.weight}
              setWeight={(value) => setPreferences({ ...preferences, weight: value })}
              activityLevel={preferences.activityLevel}
              setActivityLevel={(value) => setPreferences({ ...preferences, activityLevel: value })}
              goal={preferences.goal}
              setGoal={(value) => setPreferences({ ...preferences, goal: value })}
            />
          </TabsContent>
          
          <TabsContent value="food-science" className="mt-6">
            <FoodScienceTab
              isLowFODMAP={preferences.isLowFODMAP}
              setIsLowFODMAP={(value) => setPreferences({ ...preferences, isLowFODMAP: value })}
              hasIBS={preferences.hasIBS}
              setHasIBS={(value) => setPreferences({ ...preferences, hasIBS: value })}
            />
          </TabsContent>
          
          <TabsContent value="meals" className="mt-6">
            <MealPlansTab
              preferences={preferences}
              setPreferences={setPreferences}
              savePreferences={savePreferences}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Nutrition;
