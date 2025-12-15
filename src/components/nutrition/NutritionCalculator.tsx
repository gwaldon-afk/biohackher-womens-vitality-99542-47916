import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Activity, Target } from "lucide-react";
import { useNutritionCalculations } from "@/hooks/useNutritionCalculations";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import ResearchCitation from "@/components/ResearchCitation";
import EvidenceBadge from "@/components/EvidenceBadge";

interface NutritionCalculatorProps {
  weight: string;
  setWeight: (value: string) => void;
  activityLevel: string;
  setActivityLevel: (value: string) => void;
  goal: string;
  setGoal: (value: string) => void;
}

const NutritionCalculator = ({
  weight,
  setWeight,
  activityLevel,
  setActivityLevel,
  goal,
  setGoal
}: NutritionCalculatorProps) => {
  const { calculateProtein, calculateCalories, calculateMacros } = useNutritionCalculations(
    weight,
    activityLevel,
    goal
  );

  const proteinRange = calculateProtein();
  const calories = calculateCalories();
  const macros = calculateMacros();

  const hasAllInputs = weight && activityLevel && goal;

  return (
    <div className="space-y-6">
      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Your Details
          </CardTitle>
          <CardDescription>
            Enter your details to calculate personalized targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="e.g. 70"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity">Activity Level</Label>
            <Select value={activityLevel} onValueChange={setActivityLevel}>
              <SelectTrigger id="activity">
                <SelectValue placeholder="Select activity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                <SelectItem value="moderate">Moderate (3-5 days/week)</SelectItem>
                <SelectItem value="active">Active (6-7 days/week)</SelectItem>
                <SelectItem value="athlete">Athlete (intense training)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal">Fitness Goal</Label>
            <Select value={goal} onValueChange={setGoal}>
              <SelectTrigger id="goal">
                <SelectValue placeholder="Select your goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weight_loss">Weight Loss</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="muscle_gain">Muscle Gain</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results - only show when all inputs are filled */}
      {hasAllInputs && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Your Daily Nutrition Targets
                  <ScienceBackedIcon className="h-5 w-5" showTooltip={false} />
                </CardTitle>
                <CardDescription>
                  Based on {weight}kg, {activityLevel.replace('_', ' ')} activity, {goal.replace('_', ' ')} goal
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Daily Calories</span>
                <Badge variant="outline" className="text-base">
                  {calories} kcal
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your activity level and fitness goal
              </p>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Protein Target
                  <EvidenceBadge level="Gold" />
                </span>
                <Badge variant="outline" className="text-base text-primary">
                  {proteinRange.min}-{proteinRange.max}g
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                {(proteinRange.min / parseFloat(weight || "1")).toFixed(1)}g - {(proteinRange.max / parseFloat(weight || "1")).toFixed(1)}g per kg body weight
              </p>
              <ResearchCitation
                title="Protein requirements and recommendations for older people"
                journal="Nutrition Research Reviews"
                year={2012}
                url="https://pubmed.ncbi.nlm.nih.gov/22595377/"
                doi="10.1017/S0954422412000073"
                studyType="Review"
              />
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-semibold">Macronutrient Breakdown</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 bg-muted/50 rounded">
                  <div className="text-lg font-bold text-primary">{macros.protein}g</div>
                  <div className="text-xs text-muted-foreground">Protein</div>
                </div>
                <div className="p-3 bg-muted/50 rounded">
                  <div className="text-lg font-bold">{macros.carbs}g</div>
                  <div className="text-xs text-muted-foreground">Carbs</div>
                </div>
                <div className="p-3 bg-muted/50 rounded">
                  <div className="text-lg font-bold">{macros.fat}g</div>
                  <div className="text-xs text-muted-foreground">Fat</div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800">
                <strong>Note:</strong> These are evidence-based estimates. Individual needs may vary. 
                Consult a registered dietitian for personalised advice.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NutritionCalculator;
