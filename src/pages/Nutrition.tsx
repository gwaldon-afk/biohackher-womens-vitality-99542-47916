import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";
import { LongevityNutritionScoreCard } from "@/components/nutrition/LongevityNutritionScoreCard";
import { LifeStageNutritionSection } from "@/components/nutrition/LifeStageNutritionSection";
import { LifeStageShopRecommendations } from "@/components/nutrition/LifeStageShopRecommendations";
import { QuickAccessToolsGrid } from "@/components/nutrition/QuickAccessToolsGrid";
import { ProteinCalculatorDrawer } from "@/components/nutrition/ProteinCalculatorDrawer";
import { FoodSearchDrawer } from "@/components/nutrition/FoodSearchDrawer";
import { LeucineGuideDrawer } from "@/components/nutrition/LeucineGuideDrawer";
import { FODMAPGuideDrawer } from "@/components/nutrition/FODMAPGuideDrawer";
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
  
  // Tool drawer states
  const [showCalculator, setShowCalculator] = useState(false);
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [showLeucine, setShowLeucine] = useState(false);
  const [showFODMAP, setShowFODMAP] = useState(false);

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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <GuidedNutritionOnboarding
        isActive={showGuidedTour}
        onComplete={() => setShowGuidedTour(false)}
      />
      
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-bold gradient-text">{t('nutrition.title')}</h1>
            <ScienceBackedIcon className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Personalized nutrition guidance for longevity, gut health, and hormone balance
          </p>
        </div>

        {/* Educational Disclaimer */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">📚 Educational Information:</strong> Evidence-based nutrition recommendations for educational purposes only. 
            Always consult qualified healthcare professionals before making dietary changes.
          </p>
        </div>

        {/* Score Card with Assessment CTA */}
        <LongevityNutritionScoreCard 
          preferences={preferences}
          onRetakeAssessment={() => navigate('/longevity-nutrition')}
        />
        
        {/* Life Stage Personalization - For authenticated users */}
        {user && <LifeStageNutritionSection />}
        
        {/* Life Stage Shop Recommendations - For authenticated users */}
        {user && <LifeStageShopRecommendations />}
        
        {/* Meal Plans Section */}
        <MealPlansTab
          preferences={preferences}
          setPreferences={setPreferences}
          savePreferences={savePreferences}
        />

        {/* Quick Access Tools Grid */}
        <QuickAccessToolsGrid
          onOpenCalculator={() => setShowCalculator(true)}
          onOpenFoodSearch={() => setShowFoodSearch(true)}
          onOpenLeucine={() => setShowLeucine(true)}
          onOpenFODMAP={() => setShowFODMAP(true)}
        />
      </main>

      {/* Tool Drawers */}
      <ProteinCalculatorDrawer
        open={showCalculator}
        onOpenChange={setShowCalculator}
        preferences={preferences}
        setPreferences={setPreferences}
      />
      <FoodSearchDrawer
        open={showFoodSearch}
        onOpenChange={setShowFoodSearch}
      />
      <LeucineGuideDrawer
        open={showLeucine}
        onOpenChange={setShowLeucine}
      />
      <FODMAPGuideDrawer
        open={showFODMAP}
        onOpenChange={setShowFODMAP}
        preferences={preferences}
        setPreferences={setPreferences}
      />
    </div>
  );
};

export default Nutrition;
