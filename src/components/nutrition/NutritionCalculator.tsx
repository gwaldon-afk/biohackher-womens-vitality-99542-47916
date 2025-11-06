import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

  // Check if preferences are set
  if (!weight || !activityLevel || !goal) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calculator className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">Set Your Preferences First</h3>
          <p className="text-muted-foreground">
            Please complete your personal details in the section above to see your personalized nutrition targets.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
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
                Based on {weight}kg, {activityLevel} activity, {goal} goal
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
              {proteinRange.min / parseFloat(weight || "1")}g - {proteinRange.max / parseFloat(weight || "1")}g per kg body weight
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
    </div>
  );
};

export default NutritionCalculator;
