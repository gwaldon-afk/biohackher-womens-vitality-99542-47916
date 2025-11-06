import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { NutritionPreferences } from "@/hooks/useNutritionPreferences";

interface FoodPreferencesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
  onSave: () => Promise<void>;
}

const commonAllergies = [
  "Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy", "Fish", "Sesame"
];

const commonDislikes = [
  "Fish", "Mushrooms", "Olives", "Avocado", "Tomatoes", "Onions", "Garlic", "Spinach"
];

const FoodPreferencesDialog = ({ 
  open, 
  onOpenChange, 
  preferences, 
  setPreferences, 
  onSave 
}: FoodPreferencesDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);

  const toggleAllergy = (allergy: string) => {
    const current = preferences.allergies || [];
    if (current.includes(allergy)) {
      setPreferences({
        ...preferences,
        allergies: current.filter(a => a !== allergy)
      });
    } else {
      setPreferences({
        ...preferences,
        allergies: [...current, allergy]
      });
    }
  };

  const toggleDislike = (dislike: string) => {
    const current = preferences.dislikes || [];
    if (current.includes(dislike)) {
      setPreferences({
        ...preferences,
        dislikes: current.filter(d => d !== dislike)
      });
    } else {
      setPreferences({
        ...preferences,
        dislikes: [...current, dislike]
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
      onOpenChange(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set Your Food Preferences</DialogTitle>
          <DialogDescription>
            Let us know about your dietary restrictions so we can customize your meal plan
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Allergies */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Food Allergies</Label>
            <p className="text-sm text-muted-foreground">Select any foods you're allergic to</p>
            <div className="grid grid-cols-2 gap-3">
              {commonAllergies.map((allergy) => (
                <div key={allergy} className="flex items-center space-x-2">
                  <Checkbox
                    id={`allergy-${allergy}`}
                    checked={preferences.allergies?.includes(allergy)}
                    onCheckedChange={() => toggleAllergy(allergy)}
                  />
                  <label
                    htmlFor={`allergy-${allergy}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {allergy}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Dislikes */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Food Dislikes</Label>
            <p className="text-sm text-muted-foreground">Select foods you prefer to avoid</p>
            <div className="grid grid-cols-2 gap-3">
              {commonDislikes.map((dislike) => (
                <div key={dislike} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dislike-${dislike}`}
                    checked={preferences.dislikes?.includes(dislike)}
                    onCheckedChange={() => toggleDislike(dislike)}
                  />
                  <label
                    htmlFor={`dislike-${dislike}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {dislike}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Requirements */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Dietary Requirements</Label>
            <div className="space-y-3 border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="low-fodmap" className="font-medium">Low-FODMAP Diet</Label>
                  <p className="text-sm text-muted-foreground">For digestive sensitivity</p>
                </div>
                <Switch
                  id="low-fodmap"
                  checked={preferences.isLowFODMAP}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, isLowFODMAP: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ibs" className="font-medium">IBS-Friendly</Label>
                  <p className="text-sm text-muted-foreground">Suitable for IBS management</p>
                </div>
                <Switch
                  id="ibs"
                  checked={preferences.hasIBS}
                  onCheckedChange={(checked) => setPreferences({ ...preferences, hasIBS: checked })}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Preferences"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FoodPreferencesDialog;
