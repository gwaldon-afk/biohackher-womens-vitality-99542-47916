import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ProgressCircle } from "@/components/ui/progress-circle";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Utensils, Droplets, Leaf, Beef, Fish, Cookie, Wine, Milk, HelpCircle, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

// Emoji mapping functions
const getHydrationEmoji = (value: number) => {
  if (value === 1) return "😟";
  if (value === 3) return "😊";
  return "🌟";
};

const getHydrationLabel = (value: number) => {
  if (value === 1) return "Needs more water";
  if (value === 3) return "Good hydration";
  return "Excellent!";
};

const getVegetablesEmoji = (value: number) => {
  if (value === 1) return "🥗";
  if (value === 3) return "🥬";
  return "🌈";
};

const getVegetablesLabel = (value: number) => {
  if (value === 1) return "Add more veggies";
  if (value === 3) return "Good variety";
  return "Amazing variety!";
};

const getProteinEmoji = (value: number) => {
  if (value === 1) return "💪🏻";
  if (value === 3) return "💪";
  return "💪🏽";
};

const getProteinLabel = (value: number) => {
  if (value === 1) return "Below goal";
  if (value === 3) return "Met goal";
  return "Exceeded goal!";
};

const getFatsEmoji = (value: number) => value === 5 ? "✅" : "❌";
const getFatsLabel = (value: number) => value === 5 ? "Great choice!" : "Consider adding";

const getSugarEmoji = (value: number) => {
  if (value === 0) return "🌟";
  if (value === -2.5) return "😬";
  return "🚫";
};

const getSugarLabel = (value: number) => {
  if (value === 0) return "Perfect!";
  if (value === -2.5) return "Some treats";
  return "Cheat day";
};

const getAlcoholEmoji = (value: number) => {
  if (value === 0) return "🌟";
  if (value === -2.5) return "🍷";
  return "🍺🍺";
};

const getAlcoholLabel = (value: number) => {
  if (value === 0) return "Alcohol-free";
  if (value === -2.5) return "One drink";
  return "Multiple drinks";
};

const getDairyEmoji = (value: number) => value === 0 ? "🌟" : "🥛";
const getDairyLabel = (value: number) => value === 0 ? "Avoided triggers" : "Consumed dairy/gluten";

interface NutritionalData {
  hydration: number;
  vegetables: number;
  protein: number;
  fatsOmegas: number;
  sugarProcessed: number;
  alcohol: number;
  dairyGluten?: number;
}

interface NutritionalScorecardProps {
  onScoreCalculated: (score: number, grade: string) => void;
  hasDairySensitivity?: boolean;
}

const NutritionalScorecard = ({ onScoreCalculated, hasDairySensitivity = false }: NutritionalScorecardProps) => {
  const [nutritionalData, setNutritionalData] = useState<NutritionalData>({
    hydration: 3,
    vegetables: 3,
    protein: 3,
    fatsOmegas: 5,
    sugarProcessed: 0,
    alcohol: 0,
    dairyGluten: 0
  });

  const [showLearnMore, setShowLearnMore] = useState(false);

  // Category definitions for help tooltips
  const categoryDefinitions = {
    hydration: "Proper hydration supports cellular function, nutrient transport, and helps reduce inflammation by maintaining optimal blood flow and toxin elimination.",
    vegetables: "Leafy greens and colourful vegetables provide antioxidants, fibre, and phytonutrients that combat oxidative stress and reduce inflammatory markers.",
    protein: "Adequate protein intake supports muscle maintenance, immune function, and hormone production - critical for healthy aging, especially after 35.",
    fatsOmegas: "Healthy fats like omega-3s from fish, nuts, and seeds help reduce inflammation, support brain health, and improve cardiovascular function.",
    sugarProcessed: "Refined sugars and processed foods spike blood glucose, promote inflammation, and accelerate cellular aging through glycation processes.",
    alcohol: "Alcohol consumption increases inflammatory cytokines, disrupts sleep quality, and places oxidative stress on the liver and other organs.",
    dairyGluten: "For sensitive individuals, dairy and gluten can trigger inflammatory responses, digestive issues, and contribute to systemic inflammation."
  };

  const calculateScore = () => {
    const antiInflammatory = nutritionalData.hydration + nutritionalData.vegetables + nutritionalData.protein + nutritionalData.fatsOmegas;
    const proInflammatory = nutritionalData.sugarProcessed + nutritionalData.alcohol + (hasDairySensitivity ? (nutritionalData.dairyGluten || 0) : 0);
    return antiInflammatory + proInflammatory;
  };

  const getGrade = (score: number) => {
    if (score >= 10) return { grade: 'A', description: 'Excellent. A highly anti-inflammatory day.', color: 'text-green-600' };
    if (score >= 5) return { grade: 'B', description: 'Good. A balanced, anti-inflammatory dietary pattern.', color: 'text-blue-600' };
    if (score >= 0) return { grade: 'C', description: 'Average. A neutral day, can be improved.', color: 'text-yellow-600' };
    if (score >= -5) return { grade: 'D', description: 'Needs Improvement. A generally pro-inflammatory day.', color: 'text-orange-600' };
    return { grade: 'F', description: 'Poor. A highly pro-inflammatory day.', color: 'text-red-600' };
  };

  // Auto-calculate score on every change
  useEffect(() => {
    const score = calculateScore();
    const { grade } = getGrade(score);
    onScoreCalculated(score, grade);
  }, [nutritionalData, hasDairySensitivity, onScoreCalculated]);

  const updateValue = (key: keyof NutritionalData, value: number) => {
    setNutritionalData(prev => ({ ...prev, [key]: value }));
  };

  const currentScore = calculateScore();
  const { grade, description, color } = getGrade(currentScore);
  const progressValue = Math.max(0, Math.min(100, ((currentScore + 10) / 25) * 100));

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Daily Nutrition Scorecard
          </CardTitle>
          <CardDescription>
            Track your anti-inflammatory choices
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Score Display - Using ProgressCircle */}
          <div className="flex flex-col items-center justify-center py-4">
            <ProgressCircle value={progressValue} size="xl" className="mb-3">
              <motion.div 
                key={currentScore}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center"
              >
                <div className={`text-4xl font-bold ${color}`}>{currentScore}</div>
                <div className={`text-xl font-semibold ${color}`}>{grade}</div>
              </motion.div>
            </ProgressCircle>
            <p className="text-sm text-center text-muted-foreground max-w-xs">{description}</p>
          </div>

          <Separator />

          {/* Anti-Inflammatory Sliders */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-500" />
              <h3 className="font-semibold text-green-700">Build Your Score</h3>
            </div>

            {/* Hydration Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Droplets className="h-5 w-5 text-blue-500" />
                  <Label>Water</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Hydration supports cellular function and reduces inflammation</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getHydrationEmoji(nutritionalData.hydration)}</span>
                  <Badge variant="secondary" className="text-green-600">+{nutritionalData.hydration}</Badge>
                </div>
              </div>
              <Slider
                value={[nutritionalData.hydration]}
                onValueChange={([value]) => updateValue('hydration', value)}
                min={1}
                max={5}
                step={2}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground text-center">
                {getHydrationLabel(nutritionalData.hydration)}
              </p>
            </div>

            {/* Vegetables Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-500" />
                  <Label>Vegetables</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Vegetables provide antioxidants that combat inflammation</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getVegetablesEmoji(nutritionalData.vegetables)}</span>
                  <Badge variant="secondary" className="text-green-600">+{nutritionalData.vegetables}</Badge>
                </div>
              </div>
              <Slider
                value={[nutritionalData.vegetables]}
                onValueChange={([value]) => updateValue('vegetables', value)}
                min={1}
                max={5}
                step={2}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground text-center">
                {getVegetablesLabel(nutritionalData.vegetables)}
              </p>
            </div>

            {/* Protein Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Beef className="h-5 w-5 text-red-500" />
                  <Label>Protein</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Protein supports muscle and immune function</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getProteinEmoji(nutritionalData.protein)}</span>
                  <Badge variant="secondary" className="text-green-600">+{nutritionalData.protein}</Badge>
                </div>
              </div>
              <Slider
                value={[nutritionalData.protein]}
                onValueChange={([value]) => updateValue('protein', value)}
                min={1}
                max={5}
                step={2}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground text-center">
                {getProteinLabel(nutritionalData.protein)}
              </p>
            </div>

            {/* Healthy Fats Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Fish className="h-5 w-5 text-blue-500" />
                  <Label>Healthy Fats</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Omega-3s reduce inflammation and support brain health</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getFatsEmoji(nutritionalData.fatsOmegas)}</span>
                  <Badge variant="secondary" className="text-green-600">+{nutritionalData.fatsOmegas}</Badge>
                </div>
              </div>
              <Slider
                value={[nutritionalData.fatsOmegas]}
                onValueChange={([value]) => updateValue('fatsOmegas', value)}
                min={0}
                max={5}
                step={5}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground text-center">
                {getFatsLabel(nutritionalData.fatsOmegas)}
              </p>
            </div>
          </div>

          <Separator />

          {/* Pro-Inflammatory Sliders */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-red-700">Watch These</h3>
            </div>

            {/* Sugar Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cookie className="h-5 w-5 text-orange-500" />
                  <Label>Sugar & Processed</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Refined sugars promote inflammation</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getSugarEmoji(nutritionalData.sugarProcessed)}</span>
                  <Badge variant="secondary" className="text-red-600">{nutritionalData.sugarProcessed}</Badge>
                </div>
              </div>
              <Slider
                value={[nutritionalData.sugarProcessed]}
                onValueChange={([value]) => updateValue('sugarProcessed', value)}
                min={-5}
                max={0}
                step={2.5}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground text-center">
                {getSugarLabel(nutritionalData.sugarProcessed)}
              </p>
            </div>

            {/* Alcohol Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wine className="h-5 w-5 text-purple-500" />
                  <Label>Alcohol</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3 w-3 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p className="text-xs">Alcohol increases inflammatory markers</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getAlcoholEmoji(nutritionalData.alcohol)}</span>
                  <Badge variant="secondary" className="text-red-600">{nutritionalData.alcohol}</Badge>
                </div>
              </div>
              <Slider
                value={[nutritionalData.alcohol]}
                onValueChange={([value]) => updateValue('alcohol', value)}
                min={-5}
                max={0}
                step={2.5}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground text-center">
                {getAlcoholLabel(nutritionalData.alcohol)}
              </p>
            </div>

            {/* Dairy & Gluten Slider (conditional) */}
            {hasDairySensitivity && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Milk className="h-5 w-5 text-yellow-500" />
                    <Label>Dairy & Gluten</Label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3 w-3 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="text-xs">Can trigger inflammation if sensitive</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getDairyEmoji(nutritionalData.dairyGluten || 0)}</span>
                    <Badge variant="secondary" className="text-red-600">{nutritionalData.dairyGluten || 0}</Badge>
                  </div>
                </div>
                <Slider
                  value={[nutritionalData.dairyGluten || 0]}
                  onValueChange={([value]) => updateValue('dairyGluten', value)}
                  min={-3}
                  max={0}
                  step={3}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground text-center">
                  {getDairyLabel(nutritionalData.dairyGluten || 0)}
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Collapsible Learn More Section */}
          <Collapsible open={showLearnMore} onOpenChange={setShowLearnMore}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground w-full">
              <ChevronDown className={`h-4 w-4 transition-transform ${showLearnMore ? 'rotate-180' : ''}`} />
              Learn More About Anti-Inflammatory Nutrition
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-3 text-xs text-muted-foreground">
              <div>
                <p className="font-semibold text-foreground mb-1">💧 Hydration</p>
                <p>{categoryDefinitions.hydration}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">🥬 Vegetables</p>
                <p>{categoryDefinitions.vegetables}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">💪 Protein</p>
                <p>{categoryDefinitions.protein}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">🐟 Healthy Fats</p>
                <p>{categoryDefinitions.fatsOmegas}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">🍪 Sugar & Processed Foods</p>
                <p>{categoryDefinitions.sugarProcessed}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">🍷 Alcohol</p>
                <p>{categoryDefinitions.alcohol}</p>
              </div>
              {hasDairySensitivity && (
                <div>
                  <p className="font-semibold text-foreground mb-1">🥛 Dairy & Gluten</p>
                  <p>{categoryDefinitions.dairyGluten}</p>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default NutritionalScorecard;