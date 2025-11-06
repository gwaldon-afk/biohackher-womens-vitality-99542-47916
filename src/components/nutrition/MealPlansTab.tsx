import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, Check, Sparkles, Download, Calendar } from "lucide-react";
import { NutritionPreferences } from "@/hooks/useNutritionPreferences";
import TemplateSelector from "@/components/TemplateSelector";
import FoodPreferencesDialog from "@/components/nutrition/FoodPreferencesDialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { mealTemplates } from "@/data/mealTemplates";

interface MealPlansTabProps {
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
  savePreferences: () => Promise<void>;
}

const MealPlansTab = ({ preferences, setPreferences, savePreferences }: MealPlansTabProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCustomization, setShowCustomization] = useState(false);
  const [showPreferencesDialog, setShowPreferencesDialog] = useState(false);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null);
  const [justActivated, setJustActivated] = useState(false);

  const handleSelectTemplate = async (templateId: string) => {
    // Check if food preferences are set (at least allergies initialized)
    if (!preferences.allergies || preferences.allergies.length === 0 && 
        !preferences.dislikes || preferences.dislikes.length === 0 &&
        !preferences.isLowFODMAP && !preferences.hasIBS) {
      // First time setup - show preferences dialog
      setShowPreferencesDialog(true);
      setPendingTemplateId(templateId);
      return;
    }
    
    // Preferences already set - proceed with activation
    await activateTemplate(templateId);
  };

  const handlePreferencesSaved = async () => {
    setShowPreferencesDialog(false);
    if (pendingTemplateId) {
      await activateTemplate(pendingTemplateId);
      setPendingTemplateId(null);
    }
  };

  const activateTemplate = async (templateId: string) => {
    // Update preferences with selected template
    setPreferences({
      ...preferences,
      selectedMealPlanTemplate: templateId,
    });
    
    // Save to database
    await savePreferences();
    
    setJustActivated(true);
    
    toast({
      title: "Meal plan activated!",
      description: "Check your daily plan to see today's meals.",
    });
  };

  const handleCustomize = () => {
    setShowCustomization(true);
  };

  const handleChangePlan = () => {
    setJustActivated(false);
  };

  const handleViewDailyPlan = () => {
    navigate('/today');
  };

  const getCurrentDay = () => {
    // Calculate which day of the meal plan we're on
    // For now, just cycle through 1-7
    const today = new Date().getDay(); // 0-6
    return today === 0 ? 7 : today;
  };

  const getTemplateName = (templateId: string) => {
    const template = mealTemplates.find(t => t.id === templateId);
    return template?.name || templateId;
  };

  const getMealsCompletedToday = () => {
    // TODO: Query meal_completions table for today
    return 0;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              {preferences.isLowFODMAP ? "Low-FODMAP" : "Standard"} Meal Plan
            </div>
            {preferences.selectedMealPlanTemplate && (
              <Badge variant="default" className="gap-1">
                <Check className="h-3 w-3" />
                Active
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {preferences.selectedMealPlanTemplate ? (
              `Following ${getTemplateName(preferences.selectedMealPlanTemplate)} meal plan`
            ) : (
              `Protein-optimised meals ${preferences.isLowFODMAP ? "suitable for IBS management" : "for general wellness"}`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Plan Status Card */}
          {preferences.selectedMealPlanTemplate && justActivated && (
            <Card className="border-2 border-green-500 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold text-foreground">Meal Plan Activated!</h3>
                    <p className="text-muted-foreground">
                      Your {getTemplateName(preferences.selectedMealPlanTemplate)} plan is now active for 7 days
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <p className="font-medium text-foreground">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    <li>Today's meals appear in your Daily Plan</li>
                    <li>Track completion to hit protein targets</li>
                    <li>Download shopping list for the week</li>
                    <li>Change your plan anytime</li>
                  </ul>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleViewDailyPlan} size="lg">
                    View Today's Meals →
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Plan Dashboard */}
          {preferences.selectedMealPlanTemplate && !justActivated && (
            <Card className="bg-primary/5 border-primary">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="default">Active</Badge>
                    <div>
                      <p className="font-semibold text-foreground">{getTemplateName(preferences.selectedMealPlanTemplate)} Plan</p>
                      <p className="text-sm text-muted-foreground">
                        Day {getCurrentDay()}/7 • {getMealsCompletedToday()}/3 meals logged today
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleViewDailyPlan}>
                      <Calendar className="h-4 w-4 mr-1" />
                      Today's Meals
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleChangePlan}>
                      Change Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Template Selection */}
          {(!preferences.selectedMealPlanTemplate || !justActivated) && !showCustomization && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Choose Your Approach</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button variant="outline" className="h-auto flex-col gap-2 p-4">
                  <Utensils className="h-6 w-6" />
                  <span className="font-semibold">Use Template</span>
                  <span className="text-xs text-muted-foreground">Quick start with pre-built plans</span>
                </Button>
                <Button variant="outline" className="h-auto flex-col gap-2 p-4" disabled>
                  <Sparkles className="h-6 w-6" />
                  <span className="font-semibold">Custom AI</span>
                  <span className="text-xs text-muted-foreground">Coming soon</span>
                </Button>
              </div>

              <TemplateSelector
                onSelectTemplate={handleSelectTemplate}
                onCustomize={handleCustomize}
              />
            </div>
          )}
          
          {showCustomization && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Meal plan customization coming soon...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Food Preferences Dialog */}
      <FoodPreferencesDialog
        open={showPreferencesDialog}
        onOpenChange={setShowPreferencesDialog}
        preferences={preferences}
        setPreferences={setPreferences}
        onSave={handlePreferencesSaved}
      />
    </>
  );
};

export default MealPlansTab;
