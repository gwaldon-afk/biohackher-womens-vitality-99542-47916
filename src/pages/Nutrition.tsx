import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/Navigation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";
import { LongevityNutritionScoreCard } from "@/components/nutrition/LongevityNutritionScoreCard";
import { LifeStageNutritionSection } from "@/components/nutrition/LifeStageNutritionSection";
import { LifeStageShopRecommendations } from "@/components/nutrition/LifeStageShopRecommendations";
import { FoodToolsTab } from "@/components/nutrition/FoodToolsTab";
import MealPlansTab from "@/components/nutrition/MealPlansTab";
import { GuidedNutritionOnboarding } from "@/components/onboarding/GuidedNutritionOnboarding";

const Nutrition = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    preferences,
    setPreferences,
    isLoading,
    isSaving,
    hasPreferences,
    savePreferences,
  } = useNutritionPreferences();

  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [activeTab, setActiveTab] = useState("score");

  // Check if guided tour should be shown (from Dashboard navigation)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const showTour = urlParams.get('showTour');
    const onboardingCompleted = localStorage.getItem('nutrition_onboarding_completed');
    
    if (showTour === 'true' && !onboardingCompleted) {
      setShowGuidedTour(true);
      window.history.replaceState({}, '', '/nutrition');
    }
  }, []);

  // Handle tab parameter from URL
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'meal-plans') {
      setActiveTab('tools');
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <GuidedNutritionOnboarding
        isActive={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
      />
      
      <main className="container mx-auto px-4 py-8">
        {/* Simplified Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold gradient-text">{t('nutrition.title')}</h1>
            <ScienceBackedIcon className="h-6 w-6" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Personalized nutrition guidance for longevity, gut health, and hormone balance
          </p>
        </div>

        {/* Educational Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>📚 Educational Information:</strong> Evidence-based nutrition recommendations for educational purposes only. 
            Always consult qualified healthcare professionals before making dietary changes.
          </p>
        </div>

        {/* Simplified 2-Tab Structure */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="score">My Score & Protocol</TabsTrigger>
            <TabsTrigger value="tools">Food Tools & Guides</TabsTrigger>
          </TabsList>
          
          {/* Tab 1: My Score & Protocol */}
          <TabsContent value="score" className="mt-6 space-y-6">
            {/* Score Card with Assessment CTA */}
            <LongevityNutritionScoreCard 
              preferences={preferences}
              onRetakeAssessment={() => navigate('/longevity-nutrition')}
            />
            
            {/* Life Stage Personalization */}
            {user && <LifeStageNutritionSection />}
            
            {/* Life Stage Shop Recommendations */}
            {user && <LifeStageShopRecommendations />}
            
            {/* Meal Plans Section */}
            <MealPlansTab
              preferences={preferences}
              setPreferences={setPreferences}
              savePreferences={savePreferences}
            />
          </TabsContent>
          
          {/* Tab 2: Food Tools & Guides */}
          <TabsContent value="tools" className="mt-6">
            <FoodToolsTab 
              preferences={preferences}
              setPreferences={setPreferences}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Nutrition;
