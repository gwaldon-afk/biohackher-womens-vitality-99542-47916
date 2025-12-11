import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, Calculator, Search, AlertCircle, BookOpen } from 'lucide-react';
import ScienceBackedIcon from '@/components/ScienceBackedIcon';
import ResearchCitation from '@/components/ResearchCitation';
import LongevityFoodInsights from '@/components/LongevityFoodInsights';
import FoodDatabaseSearch from '@/components/FoodDatabaseSearch';
import FoodPreferencesSidebar from '@/components/FoodPreferencesSidebar';
import NutritionCalculator from '@/components/nutrition/NutritionCalculator';
import { leucineRichFoods, fodmapFoods } from '@/data/nutritionData';
import { NutritionPreferences } from '@/hooks/useNutritionPreferences';

interface FoodToolsTabProps {
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
}

const getLeucineScoreColor = (score: string) => {
  switch (score) {
    case "Excellent": return "text-green-600 bg-green-50 border-green-200";
    case "Good": return "text-blue-600 bg-blue-50 border-blue-200";
    case "Fair": return "text-orange-600 bg-orange-50 border-orange-200";
    default: return "text-gray-600 bg-gray-50 border-gray-200";
  }
};

export function FoodToolsTab({ preferences, setPreferences }: FoodToolsTabProps) {
  const [showCalculator, setShowCalculator] = useState(true);
  const [showLeucine, setShowLeucine] = useState(false);
  const [showFODMAP, setShowFODMAP] = useState(false);

  return (
    <div className="space-y-6">
      <FoodPreferencesSidebar />

      {/* Longevity Foods Database - Always visible */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Longevity Foods Database
          </CardTitle>
          <CardDescription>
            Search our database of anti-aging and longevity-promoting foods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FoodDatabaseSearch />
          <div className="mt-6">
            <LongevityFoodInsights />
          </div>
        </CardContent>
      </Card>

      {/* Protein & Macro Calculator - Collapsible */}
      <Collapsible open={showCalculator} onOpenChange={setShowCalculator}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  <CardTitle>Protein & Macro Calculator</CardTitle>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${showCalculator ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>
                Calculate your personalized protein and macronutrient targets
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <NutritionCalculator
                weight={preferences.weight}
                setWeight={(value) => setPreferences({ ...preferences, weight: value })}
                activityLevel={preferences.activityLevel}
                setActivityLevel={(value) => setPreferences({ ...preferences, activityLevel: value })}
                goal={preferences.goal}
                setGoal={(value) => setPreferences({ ...preferences, goal: value })}
              />
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Leucine Guide - Collapsible */}
      <Collapsible open={showLeucine} onOpenChange={setShowLeucine}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <CardTitle>Leucine-Rich Foods Guide</CardTitle>
                  <ScienceBackedIcon className="h-4 w-4" showTooltip={false} />
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${showLeucine ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>
                Key amino acid for muscle protein synthesis - aim for 2.5-3g per meal
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <ResearchCitation
                title="The Role of Leucine in Weight Loss Diet and Glucose Homeostasis"
                journal="Frontiers in Pharmacology"
                year={2016}
                url="https://pubmed.ncbi.nlm.nih.gov/27242532/"
                doi="10.3389/fphar.2016.00144"
                studyType="Review"
              />
              
              <div className="grid gap-3">
                {leucineRichFoods.map((food, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{food.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {food.protein}g protein • {food.leucine}g leucine
                      </p>
                    </div>
                    <Badge className={getLeucineScoreColor(food.score)}>
                      {food.score}
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  Consume leucine-rich foods within 2 hours after resistance training. 
                  Combining different protein sources helps reach the optimal leucine threshold.
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* FODMAP Guide - Collapsible */}
      <Collapsible open={showFODMAP} onOpenChange={setShowFODMAP}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  <CardTitle>FODMAP Guide</CardTitle>
                  <ScienceBackedIcon className="h-4 w-4" showTooltip={false} />
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${showFODMAP ? 'rotate-180' : ''}`} />
              </div>
              <CardDescription>
                Foods to include and avoid for digestive comfort
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0 space-y-4">
              <ResearchCitation
                title="A Diet Low in FODMAPs Reduces Symptoms of Irritable Bowel Syndrome"
                journal="Gastroenterology"
                year={2014}
                url="https://pubmed.ncbi.nlm.nih.gov/24076059/"
                doi="10.1053/j.gastro.2013.09.046"
                studyType="RCT"
              />

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fodmap-toggle"
                    checked={preferences.isLowFODMAP}
                    onCheckedChange={(value) => setPreferences({ ...preferences, isLowFODMAP: value })}
                  />
                  <Label htmlFor="fodmap-toggle">Follow Low-FODMAP diet</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="ibs-toggle"
                    checked={preferences.hasIBS}
                    onCheckedChange={(value) => setPreferences({ ...preferences, hasIBS: value })}
                  />
                  <Label htmlFor="ibs-toggle">I have IBS</Label>
                </div>
              </div>

              {preferences.hasIBS && (
                <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <p className="text-orange-800 font-medium">
                      Consider working with a registered dietitian for personalised FODMAP guidance.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-green-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-green-700 text-lg">✓ Low FODMAP Foods</CardTitle>
                    <CardDescription>Generally well-tolerated</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {fodmapFoods.low.map((food, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {food}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-red-700 text-lg">⚠️ High FODMAP Foods</CardTitle>
                    <CardDescription>Limit during elimination phase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {fodmapFoods.high.map((food, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                          {food}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );
}
