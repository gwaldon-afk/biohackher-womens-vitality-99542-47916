import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertCircle, Apple } from 'lucide-react';
import ScienceBackedIcon from '@/components/ScienceBackedIcon';
import ResearchCitation from '@/components/ResearchCitation';
import { fodmapFoods } from '@/data/nutritionData';
import { NutritionPreferences } from '@/hooks/useNutritionPreferences';

interface FODMAPGuideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preferences: NutritionPreferences;
  setPreferences: (prefs: NutritionPreferences) => void;
}

export function FODMAPGuideDrawer({ 
  open, 
  onOpenChange, 
  preferences, 
  setPreferences 
}: FODMAPGuideDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Apple className="h-5 w-5 text-primary" />
            FODMAP Guide
            <ScienceBackedIcon className="h-4 w-4" showTooltip={false} />
          </SheetTitle>
          <SheetDescription>
            Foods to include and avoid for digestive comfort
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6 space-y-4">
          <ResearchCitation
            title="A Diet Low in FODMAPs Reduces Symptoms of Irritable Bowel Syndrome"
            journal="Gastroenterology"
            year={2014}
            url="https://pubmed.ncbi.nlm.nih.gov/24076059/"
            doi="10.1053/j.gastro.2013.09.046"
            studyType="RCT"
          />

          <div className="flex flex-col gap-3">
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
                <p className="text-orange-800 font-medium text-sm">
                  Consider working with a registered dietitian for personalised FODMAP guidance.
                </p>
              </div>
            </div>
          )}

          <div className="grid gap-4">
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-700 text-base">✓ Low FODMAP Foods</CardTitle>
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
                <CardTitle className="text-red-700 text-base">⚠️ High FODMAP Foods</CardTitle>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
