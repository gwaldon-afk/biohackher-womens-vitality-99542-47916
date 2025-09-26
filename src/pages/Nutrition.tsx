import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Utensils, Activity, AlertCircle, Target } from "lucide-react";
import Navigation from "@/components/Navigation";

const Nutrition = () => {
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [isLowFODMAP, setIsLowFODMAP] = useState(false);
  const [hasIBS, setHasIBS] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);

  const calculateProtein = () => {
    if (!weight) return { min: 0, max: 0 };
    const weightNum = parseFloat(weight);
    
    // Base protein requirements vary by activity level
    let multipliers;
    switch (activityLevel) {
      case "sedentary":
        multipliers = { min: 1.4, max: 1.6 };
        break;
      case "moderate":
        multipliers = { min: 1.6, max: 2.0 };
        break;
      case "active":
        multipliers = { min: 2.0, max: 2.4 };
        break;
      case "athlete":
        multipliers = { min: 2.4, max: 2.8 };
        break;
      default:
        multipliers = { min: 1.6, max: 2.0 };
    }
    
    return {
      min: Math.round(weightNum * multipliers.min * 10) / 10,
      max: Math.round(weightNum * multipliers.max * 10) / 10
    };
  };

  const proteinNeeds = calculateProtein();

  const leucineRichFoods = [
    { name: "Chicken Breast (100g)", protein: 31, leucine: 2.5, score: "Excellent" },
    { name: "Salmon (100g)", protein: 25, leucine: 2.0, score: "Excellent" },
    { name: "Greek Yogurt (170g)", protein: 17, leucine: 1.8, score: "Good" },
    { name: "Eggs (2 large)", protein: 12, leucine: 1.6, score: "Good" },
    { name: "Cottage Cheese (100g)", protein: 11, leucine: 1.4, score: "Good" },
    { name: "Tofu (100g)", protein: 8, leucine: 0.7, score: "Fair" },
    { name: "Quinoa (100g cooked)", protein: 4.4, leucine: 0.3, score: "Fair" }
  ];

  const fodmapFoods = {
    low: [
      "Chicken, Fish, Eggs", "Lactose-free dairy", "Rice, Quinoa", 
      "Spinach, Carrots", "Strawberries, Oranges", "Almonds (small portions)"
    ],
    high: [
      "Wheat, Rye, Barley", "Regular dairy", "Beans, Lentils",
      "Onions, Garlic", "Apples, Pears", "Cashews, Pistachios"
    ]
  };

  const mealPlans = {
    regular: {
      breakfast: "Greek yogurt with berries and almonds",
      lunch: "Grilled chicken salad with quinoa",
      dinner: "Salmon with roasted vegetables",
      snack: "Hard-boiled eggs with carrots"
    },
    lowFODMAP: {
      breakfast: "Lactose-free yogurt with strawberries",
      lunch: "Chicken and rice bowl with spinach",
      dinner: "Grilled fish with carrots and potatoes", 
      snack: "Rice cakes with peanut butter"
    }
  };

  const currentMealPlan = isLowFODMAP ? mealPlans.lowFODMAP : mealPlans.regular;

  const generateWeeklyPlan = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const mealVariations = {
      regular: {
        breakfast: [
          "Greek yogurt with berries and almonds",
          "Scrambled eggs with spinach and toast",
          "Protein smoothie with banana",
          "Oatmeal with protein powder and nuts"
        ],
        lunch: [
          "Grilled chicken salad with quinoa",
          "Turkey and avocado wrap",
          "Lentil soup with whole grain bread",
          "Tuna salad with mixed greens"
        ],
        dinner: [
          "Salmon with roasted vegetables",
          "Lean beef stir-fry with brown rice",
          "Grilled chicken with sweet potato",
          "Baked cod with quinoa pilaf"
        ],
        snack: [
          "Hard-boiled eggs with carrots",
          "Greek yogurt with nuts",
          "Apple with almond butter",
          "Cottage cheese with berries"
        ]
      },
      lowFODMAP: {
        breakfast: [
          "Lactose-free yogurt with strawberries",
          "Scrambled eggs with spinach",
          "Rice porridge with banana",
          "Gluten-free oats with blueberries"
        ],
        lunch: [
          "Chicken and rice bowl with spinach",
          "Turkey lettuce wraps",
          "Quinoa salad with cucumber",
          "Grilled fish with rice"
        ],
        dinner: [
          "Grilled fish with carrots and potatoes",
          "Chicken stir-fry with bok choy",
          "Beef with roasted parsnips",
          "Salmon with green beans"
        ],
        snack: [
          "Rice cakes with peanut butter",
          "Lactose-free cheese with crackers",
          "Orange with almonds (small portion)",
          "Carrot sticks with hummus"
        ]
      }
    };

    const selectedMeals = isLowFODMAP ? mealVariations.lowFODMAP : mealVariations.regular;
    const weekPlan = days.map((day, index) => ({
      day,
      breakfast: selectedMeals.breakfast[index % selectedMeals.breakfast.length],
      lunch: selectedMeals.lunch[index % selectedMeals.lunch.length],
      dinner: selectedMeals.dinner[index % selectedMeals.dinner.length],
      snack: selectedMeals.snack[index % selectedMeals.snack.length]
    }));

    setWeeklyPlan(weekPlan);
    setShowWeeklyPlan(true);
  };

  const getLeucineScoreColor = (score: string) => {
    switch (score) {
      case "Excellent": return "text-green-600 bg-green-50 border-green-200";
      case "Good": return "text-blue-600 bg-blue-50 border-blue-200";
      case "Fair": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 gradient-text">Nutrition & Protein</h1>
          <p className="text-muted-foreground">
            Optimise your protein intake and navigate dietary restrictions for longevity
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">Protein Calculator</TabsTrigger>
            <TabsTrigger value="leucine">Leucine Scoring</TabsTrigger>
            <TabsTrigger value="fodmap">FODMAP Guide</TabsTrigger>
            <TabsTrigger value="meals">Meal Planning</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Protein Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate your daily protein needs based on current research (1.6-2.0g/kg)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="weight">Body Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="Enter weight in kg"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="activity">Activity Level</Label>
                    <select 
                      id="activity"
                      className="w-full p-2 border rounded-md"
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                    >
                      <option value="sedentary">Sedentary</option>
                      <option value="moderate">Moderate Exercise</option>
                      <option value="active">Very Active</option>
                      <option value="athlete">Athlete</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Your Protein Target</CardTitle>
                </CardHeader>
                <CardContent>
                  {proteinNeeds.min > 0 ? (
                    <div className="text-center">
                      <div className="text-4xl font-bold gradient-text mb-2">
                        {proteinNeeds.min} - {proteinNeeds.max}g
                      </div>
                      <p className="text-muted-foreground mb-4">Daily protein target</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium">Per Meal</div>
                          <div className="text-lg font-semibold">{Math.round(proteinNeeds.min / 3)}-{Math.round(proteinNeeds.max / 3)}g</div>
                        </div>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="font-medium">Leucine/Meal</div>
                          <div className="text-lg font-semibold">2.5-3g</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary">
                          <Target className="h-4 w-4 inline mr-1" />
                          Aim for 25-40g protein per meal for optimal muscle protein synthesis
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      Enter your weight to calculate protein needs
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="leucine" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Leucine Content & Scoring</CardTitle>
                <CardDescription>
                  Leucine triggers muscle protein synthesis. Aim for 2.5-3g per meal for optimal results.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {leucineRichFoods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-medium">{food.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {food.protein}g protein • {food.leucine}g leucine
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={getLeucineScoreColor(food.score)}
                      >
                        {food.score}
                      </Badge>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-medium mb-2">Leucine Optimisation Tips</h3>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Combine lower leucine proteins (like plant proteins) with higher ones</li>
                    <li>• Time protein intake around workouts for enhanced muscle building</li>
                    <li>• Spread protein evenly across meals rather than loading one meal</li>
                    <li>• Consider leucine supplements if following plant-based diet</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fodmap" className="mt-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ibs-mode"
                  checked={hasIBS}
                  onCheckedChange={setHasIBS}
                />
                <Label htmlFor="ibs-mode">I have IBS</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="fodmap-mode"
                  checked={isLowFODMAP}
                  onCheckedChange={setIsLowFODMAP}
                />
                <Label htmlFor="fodmap-mode">Follow Low-FODMAP diet</Label>
              </div>
            </div>

            {hasIBS && (
              <Card className="mb-6 border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <p className="text-orange-800 font-medium">
                      IBS Management: Consider working with a registered dietitian for personalised FODMAP guidance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">✓ Low FODMAP Foods</CardTitle>
                  <CardDescription>Generally well-tolerated foods</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fodmapFoods.low.map((food, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{food}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="text-red-700">⚠️ High FODMAP Foods</CardTitle>
                  <CardDescription>Limit or avoid during elimination phase</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {fodmapFoods.high.map((food, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                        <span className="text-sm">{food}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="meals" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  {isLowFODMAP ? "Low-FODMAP" : "Standard"} Meal Plan
                </CardTitle>
                <CardDescription>
                  Protein-optimised meals {isLowFODMAP ? "suitable for IBS management" : "for general wellness"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {Object.entries(currentMealPlan).map(([meal, description]) => (
                    <div key={meal} className="p-4 border rounded-lg">
                      <h3 className="font-semibold capitalize mb-2">{meal}</h3>
                      <p className="text-muted-foreground">{description}</p>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex gap-4">
                  <Button onClick={generateWeeklyPlan}>
                    <Activity className="h-4 w-4 mr-2" />
                    Generate Weekly Plan
                  </Button>
                  <Button variant="outline">
                    Shopping List
                  </Button>
                </div>
                
                {showWeeklyPlan && weeklyPlan && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Your 7-Day Meal Plan</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowWeeklyPlan(false)}
                      >
                        Hide Plan
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      {weeklyPlan.map((dayPlan: any, index: number) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-primary mb-3">{dayPlan.day}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-muted-foreground">Breakfast:</span>
                                <p className="mt-1">{dayPlan.breakfast}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Lunch:</span>
                                <p className="mt-1">{dayPlan.lunch}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Dinner:</span>
                                <p className="mt-1">{dayPlan.dinner}</p>
                              </div>
                              <div>
                                <span className="font-medium text-muted-foreground">Snack:</span>
                                <p className="mt-1">{dayPlan.snack}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Nutrition;