import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Edit, Save, X, Target } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { NutritionPreferences } from "@/hooks/useNutritionPreferences";
import { recipeCategories } from "@/data/nutritionData";

interface NutritionPreferencesFormProps {
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
  isLoading: boolean;
  isSaving: boolean;
  hasPreferences: boolean;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  onSave: () => void;
}

const commonAllergies = [
  "Dairy", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Soy", "Gluten"
];

const commonDislikes = [
  "Salmon", "Chicken", "Tofu", "Eggs", "Yogurt", "Broccoli", "Spinach", 
  "Carrots", "Quinoa", "Brown Rice", "Sweet Potato", "Oats", "Avocado", "Almonds"
];

const NutritionPreferencesForm = ({
  preferences,
  setPreferences,
  isLoading,
  isSaving,
  hasPreferences,
  isEditing,
  setIsEditing,
  onSave
}: NutritionPreferencesFormProps) => {
  const { t } = useTranslation();

  const toggleAllergy = (allergy: string) => {
    setPreferences({
      ...preferences,
      allergies: preferences.allergies.includes(allergy)
        ? preferences.allergies.filter(a => a !== allergy)
        : [...preferences.allergies, allergy]
    });
  };

  const toggleDislike = (dislike: string) => {
    setPreferences({
      ...preferences,
      dislikes: preferences.dislikes.includes(dislike)
        ? preferences.dislikes.filter(d => d !== dislike)
        : [...preferences.dislikes, dislike]
    });
  };

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">Loading your preferences...</div>
        </CardContent>
      </Card>
    );
  }

  // Current Preferences Display
  if (hasPreferences && !isEditing) {
    return (
      <Card className="mb-6 border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Current Preferences
              </CardTitle>
              <CardDescription>Your saved nutrition and dietary preferences</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit Preferences
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {preferences.weight && (
              <div className="p-3 bg-background rounded-lg border">
                <div className="text-sm text-muted-foreground">Weight</div>
                <div className="font-semibold">{preferences.weight} kg</div>
              </div>
            )}
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground">Activity Level</div>
              <div className="font-semibold capitalize">{preferences.activityLevel.replace('-', ' ')}</div>
            </div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground">Goal</div>
              <div className="font-semibold capitalize">{preferences.goal.replace('-', ' ')}</div>
            </div>
            <div className="p-3 bg-background rounded-lg border">
              <div className="text-sm text-muted-foreground">Recipe Style</div>
              <div className="font-semibold capitalize">{preferences.selectedRecipeStyle}</div>
            </div>
            {preferences.allergies.length > 0 && (
              <div className="p-3 bg-background rounded-lg border">
                <div className="text-sm text-muted-foreground">Allergies</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preferences.allergies.map((allergy) => (
                    <Badge key={allergy} variant="destructive" className="text-xs">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {preferences.dislikes.length > 0 && (
              <div className="p-3 bg-background rounded-lg border">
                <div className="text-sm text-muted-foreground">Dislikes</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {preferences.dislikes.map((dislike) => (
                    <Badge key={dislike} variant="secondary" className="text-xs">
                      {dislike}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {(preferences.isLowFODMAP || preferences.hasIBS) && (
              <div className="p-3 bg-background rounded-lg border">
                <div className="text-sm text-muted-foreground">Dietary Requirements</div>
                <div className="flex gap-1 mt-1">
                  {preferences.isLowFODMAP && (
                    <Badge variant="outline" className="text-xs">Low FODMAP</Badge>
                  )}
                  {preferences.hasIBS && (
                    <Badge variant="outline" className="text-xs">IBS Friendly</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Edit Mode or Initial Setup
  return (
    <Card className="mb-6 border-orange-200 bg-orange-50/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-orange-600" />
              {hasPreferences ? "Edit Your Preferences" : "Set Up Your Preferences"}
            </CardTitle>
            <CardDescription>
              {hasPreferences ? "Update your nutrition and dietary preferences" : "Configure your personal nutrition settings for tailored recommendations"}
            </CardDescription>
          </div>
          {hasPreferences && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="edit-weight">Body Weight (kg)</Label>
              <Input
                id="edit-weight"
                type="number"
                placeholder="Enter weight in kg"
                value={preferences.weight}
                onChange={(e) => setPreferences({ ...preferences, weight: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-activity">Activity Level</Label>
              <select 
                id="edit-activity"
                className="w-full p-2 border rounded-md bg-background"
                value={preferences.activityLevel}
                onChange={(e) => setPreferences({ ...preferences, activityLevel: e.target.value })}
              >
                <option value="sedentary">Sedentary (little/no exercise)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Very Active (6-7 days/week)</option>
                <option value="athlete">Athlete (2x/day, intense)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="edit-goal">Fitness Goal</Label>
              <select 
                id="edit-goal"
                className="w-full p-2 border rounded-md bg-background"
                value={preferences.goal}
                onChange={(e) => setPreferences({ ...preferences, goal: e.target.value })}
              >
                <option value="weight-loss">Weight Loss</option>
                <option value="maintenance">Maintenance</option>
                <option value="muscle-gain">Muscle Gain</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Recipe Style Preference</Label>
            <div className="flex gap-4 mt-2">
              {Object.entries(recipeCategories).map(([key, category]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="recipeStyle"
                    value={key}
                    checked={preferences.selectedRecipeStyle === key}
                    onChange={(e) => setPreferences({ ...preferences, selectedRecipeStyle: e.target.value })}
                    className="text-primary"
                  />
                  <span className="font-medium">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-fodmap"
                checked={preferences.isLowFODMAP}
                onCheckedChange={(checked) => setPreferences({ ...preferences, isLowFODMAP: checked })}
              />
              <Label htmlFor="edit-fodmap">Follow Low-FODMAP diet</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-ibs"
                checked={preferences.hasIBS}
                onCheckedChange={(checked) => setPreferences({ ...preferences, hasIBS: checked })}
              />
              <Label htmlFor="edit-ibs">I have IBS or digestive sensitivities</Label>
            </div>
          </div>

          <div>
            <Label>Food Allergies</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {commonAllergies.map((allergy) => (
                <label key={allergy} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.allergies.includes(allergy)}
                    onChange={() => toggleAllergy(allergy)}
                  />
                  {allergy}
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label>Food Dislikes</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {commonDislikes.map((dislike) => (
                <label key={dislike} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={preferences.dislikes.includes(dislike)}
                    onChange={() => toggleDislike(dislike)}
                  />
                  {dislike}
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? t('nutrition.savingPreferences') : t('nutrition.savePreferences')}
            </Button>
            {hasPreferences && (
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NutritionPreferencesForm;
