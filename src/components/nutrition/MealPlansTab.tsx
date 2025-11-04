import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils, Check } from "lucide-react";
import { NutritionPreferences } from "@/hooks/useNutritionPreferences";
import TemplateSelector from "@/components/TemplateSelector";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

interface MealPlansTabProps {
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
  savePreferences: () => Promise<void>;
}

const MealPlansTab = ({ preferences, setPreferences, savePreferences }: MealPlansTabProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCustomization, setShowCustomization] = useState(false);

  const handleSelectTemplate = async (templateId: string) => {
    // Update preferences with selected template
    setPreferences({
      ...preferences,
      selectedMealPlanTemplate: templateId,
    });
    
    // Save to database
    await savePreferences();
    
    toast({
      title: "Meal plan activated!",
      description: "Check your daily plan to see today's meals.",
    });
    
    // Navigate to daily plan
    setTimeout(() => {
      navigate('/today');
    }, 1500);
  };

  const handleCustomize = () => {
    setShowCustomization(true);
  };

  return (
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
            `Following ${preferences.selectedMealPlanTemplate} meal plan`
          ) : (
            `Protein-optimised meals ${preferences.isLowFODMAP ? "suitable for IBS management" : "for general wellness"}`
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showCustomization && (
          <TemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onCustomize={handleCustomize}
          />
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
  );
};

export default MealPlansTab;
