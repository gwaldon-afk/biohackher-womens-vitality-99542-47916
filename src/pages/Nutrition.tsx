import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { Sparkles, Clock, TrendingUp, Heart } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useAuth } from "@/hooks/useAuth";
import { useNutritionPreferences } from "@/hooks/useNutritionPreferences";
import NutritionCalculator from "@/components/nutrition/NutritionCalculator";
import FoodScienceTab from "@/components/nutrition/FoodScienceTab";
import MealPlansTab from "@/components/nutrition/MealPlansTab";
import { LongevityNutritionScoreCard } from "@/components/nutrition/LongevityNutritionScoreCard";
import { GuidedNutritionOnboarding } from "@/components/onboarding/GuidedNutritionOnboarding";
import { useSearchParams } from "react-router-dom";

const Nutrition = () => {
  console.log('[Nutrition] Component rendering');
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
  
  console.log('[Nutrition] State:', { preferences, isLoading, hasPreferences });

  const [isEditing, setIsEditing] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [activeTab, setActiveTab] = useState("score");

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
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold gradient-text">{t('nutrition.title')}</h1>
                <ScienceBackedIcon className="h-6 w-6" />
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Discover your personalized nutrition blueprint for longevity, gut health, and hormone balance
              </p>
            </div>
            <Button onClick={() => navigate('/longevity-nutrition')} size="lg" className="ml-4">
              Take Assessment
            </Button>
          </div>

          {/* What You'll Discover Card */}
          <Card className="border-2 border-primary/30 shadow-lg bg-gradient-to-br from-primary/10 via-secondary/5 to-background mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                What You'll Discover
              </CardTitle>
              <CardDescription>
                A comprehensive analysis of your nutrition patterns and their impact on healthy aging
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Your Longevity Nutrition Score</h3>
                  <p className="text-sm text-muted-foreground">
                    A comprehensive 0-100 score based on protein, fiber, gut health, inflammation, and more
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">4-Pillar Breakdown</h3>
                  <p className="text-sm text-muted-foreground">
                    How your nutrition impacts BODY, BRAIN, BALANCE, and BEAUTY
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Eating Personality Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    Understand your unique patterns and how they affect longevity
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Personalized Protocol</h3>
                  <p className="text-sm text-muted-foreground">
                    Immediate actions, foundational habits, and optimization strategies
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timing Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-3xl mx-auto justify-center mb-4">
            <Clock className="h-4 w-4" />
            <span>8 minutes</span>
            <span>•</span>
            <span>16 questions</span>
            <span>•</span>
            <span>Evidence-based</span>
            <span>•</span>
            <span>Free</span>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-3xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>📚 Educational Information:</strong> This content presents evidence-based nutrition recommendations. 
              It is for educational purposes only and does not constitute medical or dietary advice. 
              Always consult with qualified healthcare or nutrition professionals before making dietary changes.
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="score">Longevity Nutrition Score</TabsTrigger>
            <TabsTrigger value="calculator">Calculator</TabsTrigger>
            <TabsTrigger value="food-science">Food Science</TabsTrigger>
            <TabsTrigger value="meals">Meal Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="score" className="mt-6">
            <LongevityNutritionScoreCard 
              preferences={preferences}
              onRetakeAssessment={() => navigate('/longevity-nutrition')}
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
