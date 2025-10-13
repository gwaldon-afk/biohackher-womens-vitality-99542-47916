import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Utensils } from "lucide-react";
import { NutritionPreferences } from "@/hooks/useNutritionPreferences";
import TemplateSelector from "@/components/TemplateSelector";

interface MealPlansTabProps {
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
}

const MealPlansTab = ({ preferences, setPreferences }: MealPlansTabProps) => {
  console.log('[MealPlansTab] Rendering, preferences:', preferences);
  const [showCustomization, setShowCustomization] = useState(false);

  const handleSelectTemplate = (templateId: string) => {
    console.log("Template selected:", templateId);
    // Template selection logic will be implemented
  };

  const handleCustomize = () => {
    console.log('[MealPlansTab] Starting customization');
    setShowCustomization(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Utensils className="h-5 w-5" />
          {preferences.isLowFODMAP ? "Low-FODMAP" : "Standard"} Meal Plan
        </CardTitle>
        <CardDescription>
          Protein-optimised meals {preferences.isLowFODMAP ? "suitable for IBS management" : "for general wellness"}
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
