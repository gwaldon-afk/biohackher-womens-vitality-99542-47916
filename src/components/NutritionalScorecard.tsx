import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Utensils, Droplets, Leaf, Beef, Fish, Cookie, Wine, Milk, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Validation schema for nutritional data
const nutritionalSchema = z.object({
  hydration: z.number().min(1).max(5),
  vegetables: z.number().min(1).max(5),
  protein: z.number().min(1).max(5),
  fatsOmegas: z.number().min(0).max(5),
  sugarProcessed: z.number().min(-5).max(0),
  alcohol: z.number().min(-5).max(0),
  dairyGluten: z.number().min(-3).max(0).optional()
});

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
  const { toast } = useToast();
  const [nutritionalData, setNutritionalData] = useState<NutritionalData>({
    hydration: 3,
    vegetables: 3,
    protein: 3,
    fatsOmegas: 5,
    sugarProcessed: 0,
    alcohol: 0,
    dairyGluten: 0
  });

  // Category definitions for help tooltips
  const categoryDefinitions = {
    hydration: "Proper hydration supports cellular function, nutrient transport, and helps reduce inflammation by maintaining optimal blood flow and toxin elimination.",
    vegetables: "Leafy greens and colorful vegetables provide antioxidants, fiber, and phytonutrients that combat oxidative stress and reduce inflammatory markers.",
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

  const handleSubmit = () => {
    try {
      nutritionalSchema.parse(nutritionalData);
      const score = calculateScore();
      const { grade, description } = getGrade(score);
      
      onScoreCalculated(score, grade);
      
      toast({
        title: `Daily Nutrition Score: ${grade}`,
        description: description,
        variant: "default"
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Please complete all sections",
          description: "All nutritional questions must be answered.",
          variant: "destructive"
        });
      }
    }
  };

  const currentScore = calculateScore();
  const { grade, description, color } = getGrade(currentScore);
  const progressValue = Math.max(0, Math.min(100, ((currentScore + 10) / 25) * 100));

  return (
    <TooltipProvider>
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5 text-orange-500" />
            Daily Nutritional Scorecard
            <Badge variant="secondary" className={color}>
              Score: {currentScore} ({grade})
            </Badge>
          </CardTitle>
          <CardDescription>
            Track your anti-inflammatory nutrition choices to support longevity and reduce biological aging
          </CardDescription>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Net Inflammatory Score</span>
              <span className={color}>{currentScore}/15</span>
            </div>
            <Progress value={progressValue} className="h-2" />
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Anti-Inflammatory Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Leaf className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold text-green-700">Anti-Inflammatory Choices (+Points)</h3>
            </div>

            {/* Hydration */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <Label className="font-bold">Hydration (Water Intake)</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{categoryDefinitions.hydration}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={nutritionalData.hydration.toString()}
                onValueChange={(value) => setNutritionalData({...nutritionalData, hydration: parseInt(value)})}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="hydration-1" />
                  <Label htmlFor="hydration-1" className="text-sm cursor-pointer">Barely (1-2 glasses) +1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="hydration-3" />
                  <Label htmlFor="hydration-3" className="text-sm cursor-pointer">Okay (3-5 glasses) +3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="hydration-5" />
                  <Label htmlFor="hydration-5" className="text-sm cursor-pointer">Excellent (6+ glasses) +5</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Vegetables */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-500" />
                <Label className="font-bold">Leafy Greens & Colorful Vegetables</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{categoryDefinitions.vegetables}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={nutritionalData.vegetables.toString()}
                onValueChange={(value) => setNutritionalData({...nutritionalData, vegetables: parseInt(value)})}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="vegetables-1" />
                  <Label htmlFor="vegetables-1" className="text-sm cursor-pointer">One serving +1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="vegetables-3" />
                  <Label htmlFor="vegetables-3" className="text-sm cursor-pointer">Two servings +3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="vegetables-5" />
                  <Label htmlFor="vegetables-5" className="text-sm cursor-pointer">Three or more servings +5</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Protein */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Beef className="h-4 w-4 text-red-500" />
                <Label className="font-bold">Protein Intake</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{categoryDefinitions.protein}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={nutritionalData.protein.toString()}
                onValueChange={(value) => setNutritionalData({...nutritionalData, protein: parseInt(value)})}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="protein-1" />
                  <Label htmlFor="protein-1" className="text-sm cursor-pointer">Below personal goal +1</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="protein-3" />
                  <Label htmlFor="protein-3" className="text-sm cursor-pointer">Met personal goal +3</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="protein-5" />
                  <Label htmlFor="protein-5" className="text-sm cursor-pointer">Exceeded personal goal +5</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Healthy Fats & Omega-3s */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Fish className="h-4 w-4 text-blue-500" />
                <Label className="font-bold">Healthy Fats & Omega-3s</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{categoryDefinitions.fatsOmegas}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={nutritionalData.fatsOmegas.toString()}
                onValueChange={(value) => setNutritionalData({...nutritionalData, fatsOmegas: parseInt(value)})}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="5" id="fats-yes" />
                  <Label htmlFor="fats-yes" className="text-sm cursor-pointer">Yes, I consumed healthy fats or Omega-3s +5</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="fats-no" />
                  <Label htmlFor="fats-no" className="text-sm cursor-pointer">No, I did not +0</Label>
                </div>
              </RadioGroup>
            </div>
          </div>

          <Separator />

          {/* Pro-Inflammatory Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Cookie className="h-4 w-4 text-red-500" />
              <h3 className="font-semibold text-red-700">Pro-Inflammatory Choices (Deductions)</h3>
            </div>

            {/* Refined Sugars & Processed Foods */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Cookie className="h-4 w-4 text-orange-500" />
                <Label className="font-bold">Refined Sugars & Processed Foods</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{categoryDefinitions.sugarProcessed}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={nutritionalData.sugarProcessed.toString()}
                onValueChange={(value) => setNutritionalData({...nutritionalData, sugarProcessed: parseInt(value)})}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="sugar-none" />
                  <Label htmlFor="sugar-none" className="text-sm cursor-pointer">I had none +0</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="-2" id="sugar-some" />
                  <Label htmlFor="sugar-some" className="text-sm cursor-pointer">I had some -2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="-5" id="sugar-cheat" />
                  <Label htmlFor="sugar-cheat" className="text-sm cursor-pointer">I had a cheat day -5</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Alcohol */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wine className="h-4 w-4 text-purple-500" />
                <Label className="font-bold">Alcohol</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{categoryDefinitions.alcohol}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <RadioGroup
                value={nutritionalData.alcohol.toString()}
                onValueChange={(value) => setNutritionalData({...nutritionalData, alcohol: parseInt(value)})}
                className="flex flex-wrap gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="0" id="alcohol-none" />
                  <Label htmlFor="alcohol-none" className="text-sm cursor-pointer">None +0</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="-2" id="alcohol-one" />
                  <Label htmlFor="alcohol-one" className="text-sm cursor-pointer">1 drink -2</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="-5" id="alcohol-multiple" />
                  <Label htmlFor="alcohol-multiple" className="text-sm cursor-pointer">2 or more drinks -5</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Dairy & Gluten (conditional) */}
            {hasDairySensitivity && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Milk className="h-4 w-4 text-yellow-500" />
                  <Label className="font-bold">Dairy & Gluten (based on your sensitivity)</Label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>{categoryDefinitions.dairyGluten}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <RadioGroup
                  value={(nutritionalData.dairyGluten || 0).toString()}
                  onValueChange={(value) => setNutritionalData({...nutritionalData, dairyGluten: parseInt(value)})}
                  className="flex flex-wrap gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="-3" id="dairy-yes" />
                    <Label htmlFor="dairy-yes" className="text-sm cursor-pointer">Yes, I consumed dairy or gluten today -3</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="0" id="dairy-no" />
                    <Label htmlFor="dairy-no" className="text-sm cursor-pointer">No, I did not +0</Label>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-end">
            <Button onClick={handleSubmit}>
              Calculate Nutrition Score
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default NutritionalScorecard;