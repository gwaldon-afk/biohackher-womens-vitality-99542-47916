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
  const [goal, setGoal] = useState("maintenance");
  const [isLowFODMAP, setIsLowFODMAP] = useState(false);
  const [hasIBS, setHasIBS] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [selectedRecipeStyle, setSelectedRecipeStyle] = useState("simple");
  const [selectedBreakfastRecipe, setSelectedBreakfastRecipe] = useState("");
  const [selectedLunchRecipe, setSelectedLunchRecipe] = useState("");
  const [selectedDinnerRecipe, setSelectedDinnerRecipe] = useState("");

  const commonAllergies = [
    "Dairy", "Eggs", "Fish", "Shellfish", "Tree Nuts", "Peanuts", "Soy", "Gluten"
  ];

  const commonDislikes = [
    "Salmon", "Chicken", "Tofu", "Eggs", "Yogurt", "Broccoli", "Spinach", 
    "Carrots", "Quinoa", "Brown Rice", "Sweet Potato", "Oats", "Avocado", "Almonds"
  ];

  const toggleAllergy = (allergy: string) => {
    setAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const toggleDislike = (dislike: string) => {
    setDislikes(prev => 
      prev.includes(dislike) 
        ? prev.filter(d => d !== dislike)
        : [...prev, dislike]
    );
  };

  const isAllergic = (food: string) => {
    const allergyMap: Record<string, string[]> = {
      "Dairy": ["Greek Yogurt", "Cottage Cheese"],
      "Eggs": ["Eggs"],
      "Fish": ["Salmon"],
      "Tree Nuts": ["Almonds"],
      "Soy": ["Tofu"],
      "Gluten": ["Oats"] // simplified - would need gluten-free oats
    };
    
    return allergies.some(allergy => 
      allergyMap[allergy]?.includes(food)
    );
  };

  const hasDislike = (food: string) => {
    return dislikes.includes(food);
  };

  const isExcluded = (food: string) => {
    return isAllergic(food) || hasDislike(food);
  };

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

  const calculateCalories = () => {
    if (!weight) return 0;
    const weightNum = parseFloat(weight);
    
    // Base metabolic rate calculation (simplified)
    let bmr = weightNum * 22; // Rough estimate
    
    // Activity multiplier
    let activityMultiplier;
    switch (activityLevel) {
      case "sedentary": activityMultiplier = 1.2; break;
      case "moderate": activityMultiplier = 1.5; break;
      case "active": activityMultiplier = 1.7; break;
      case "athlete": activityMultiplier = 1.9; break;
      default: activityMultiplier = 1.5;
    }
    
    let dailyCalories = bmr * activityMultiplier;
    
    // Goal adjustment
    switch (goal) {
      case "weight-loss": dailyCalories *= 0.85; break; // 15% deficit
      case "muscle-gain": dailyCalories *= 1.15; break; // 15% surplus
      case "maintenance": break; // No change
      default: break;
    }
    
    return Math.round(dailyCalories);
  };

  const calculateMacros = () => {
    const calories = calculateCalories();
    const proteinNeeds = calculateProtein();
    
    // Protein: 4 calories per gram
    const proteinCalories = proteinNeeds.max * 4;
    
    // Fat: 25-30% of calories, 9 calories per gram
    const fatCalories = calories * 0.275; // 27.5% average
    const fatGrams = Math.round(fatCalories / 9);
    
    // Carbs: remaining calories, 4 calories per gram
    const carbCalories = calories - proteinCalories - fatCalories;
    const carbGrams = Math.round(carbCalories / 4);
    
    return {
      calories,
      protein: proteinNeeds.max,
      carbs: carbGrams,
      fat: fatGrams
    };
  };

  const proteinNeeds = calculateProtein();
  const dailyMacros = calculateMacros();

  const foodDatabase = {
    proteins: {
      "Chicken Breast": { protein: 31, carbs: 0, fat: 3.6, calories: 165, serving: "100g" },
      "Salmon": { protein: 25, carbs: 0, fat: 12, calories: 208, serving: "100g" },
      "Greek Yogurt": { protein: 10, carbs: 4, fat: 0, calories: 59, serving: "100g" },
      "Eggs": { protein: 6, carbs: 0.6, fat: 5, calories: 78, serving: "1 large" },
      "Tofu": { protein: 8, carbs: 2, fat: 4, calories: 76, serving: "100g" },
      "Cottage Cheese": { protein: 11, carbs: 3.4, fat: 4.3, calories: 98, serving: "100g" }
    },
    carbs: {
      "Brown Rice": { protein: 2.6, carbs: 23, fat: 0.9, calories: 111, serving: "100g cooked" },
      "Quinoa": { protein: 4.4, carbs: 22, fat: 1.9, calories: 120, serving: "100g cooked" },
      "Sweet Potato": { protein: 2, carbs: 20, fat: 0.1, calories: 86, serving: "100g" },
      "Oats": { protein: 2.4, carbs: 12, fat: 1.4, calories: 68, serving: "100g cooked" }
    },
    vegetables: {
      "Spinach": { protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23, serving: "100g" },
      "Broccoli": { protein: 2.8, carbs: 7, fat: 0.4, calories: 34, serving: "100g" },
      "Carrots": { protein: 0.9, carbs: 10, fat: 0.2, calories: 41, serving: "100g" }
    },
    fats: {
      "Avocado": { protein: 2, carbs: 9, fat: 15, calories: 160, serving: "100g" },
      "Almonds": { protein: 21, carbs: 22, fat: 50, calories: 579, serving: "100g" },
      "Olive Oil": { protein: 0, carbs: 0, fat: 14, calories: 119, serving: "1 tbsp" }
    }
  };

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

  const recipeCategories = {
    simple: {
      name: "Simple",
      breakfast: [
        { name: "Scrambled Eggs & Toast", description: "Fluffy scrambled eggs with whole grain toast and avocado" },
        { name: "Overnight Oats", description: "Rolled oats with milk, berries, and honey" },
        { name: "Greek Yogurt Bowl", description: "Greek yogurt with granola and fresh fruit" },
        { name: "Protein Smoothie", description: "Banana, protein powder, spinach, and almond milk" }
      ],
      lunch: [
        { name: "Grilled Chicken Salad", description: "Mixed greens with grilled chicken, cherry tomatoes, and balsamic" },
        { name: "Tuna Wrap", description: "Whole wheat wrap with tuna, cucumber, and lettuce" },
        { name: "Quinoa Bowl", description: "Quinoa with roasted vegetables and lean protein" },
        { name: "Soup & Sandwich", description: "Vegetable soup with turkey and avocado sandwich" }
      ],
      dinner: [
        { name: "Baked Salmon", description: "Herb-crusted salmon with steamed broccoli and sweet potato" },
        { name: "Chicken Stir-fry", description: "Lean chicken with mixed vegetables over brown rice" },
        { name: "Turkey Meatballs", description: "Lean turkey meatballs with marinara and zucchini noodles" },
        { name: "Grilled Fish Tacos", description: "Grilled white fish with cabbage slaw in corn tortillas" }
      ]
    },
    mediterranean: {
      name: "Mediterranean",
      breakfast: [
        { name: "Greek Omelet", description: "Eggs with feta, spinach, tomatoes, and olives" },
        { name: "Mediterranean Bowl", description: "Quinoa with cucumber, tomatoes, feta, and olive oil" },
        { name: "Fig & Yogurt Parfait", description: "Greek yogurt with fresh figs, nuts, and honey" },
        { name: "Shakshuka", description: "Eggs poached in spiced tomato and pepper sauce" }
      ],
      lunch: [
        { name: "Greek Salad with Chicken", description: "Traditional Greek salad topped with grilled chicken" },
        { name: "Hummus & Veggie Wrap", description: "Whole wheat wrap with hummus, vegetables, and feta" },
        { name: "Mediterranean Quinoa Salad", description: "Quinoa with olives, cucumber, tomatoes, and herbs" },
        { name: "Lentil Soup", description: "Mediterranean-style lentil soup with vegetables and herbs" }
      ],
      dinner: [
        { name: "Herb-Crusted Lamb", description: "Grilled lamb with Mediterranean herbs and roasted vegetables" },
        { name: "Mediterranean Sea Bass", description: "Baked sea bass with olives, tomatoes, and capers" },
        { name: "Stuffed Bell Peppers", description: "Peppers stuffed with quinoa, herbs, and feta cheese" },
        { name: "Chicken Souvlaki", description: "Marinated chicken skewers with tzatziki and pita" }
      ]
    },
    spicy: {
      name: "Spicy",
      breakfast: [
        { name: "Spicy Breakfast Burrito", description: "Scrambled eggs with jalapeños, salsa, and pepper jack cheese" },
        { name: "Cajun Breakfast Bowl", description: "Quinoa with spicy shrimp, peppers, and hot sauce" },
        { name: "Spicy Avocado Toast", description: "Whole grain toast with avocado, sriracha, and chili flakes" },
        { name: "Mexican Egg Scramble", description: "Eggs with peppers, onions, and spicy Mexican seasonings" }
      ],
      lunch: [
        { name: "Buffalo Chicken Salad", description: "Mixed greens with buffalo chicken, celery, and blue cheese" },
        { name: "Spicy Thai Beef Salad", description: "Thai-style beef salad with chili lime dressing" },
        { name: "Korean BBQ Bowl", description: "Marinated beef with kimchi over steamed rice" },
        { name: "Cajun Shrimp Wrap", description: "Spicy Cajun shrimp with vegetables in a tortilla wrap" }
      ],
      dinner: [
        { name: "Spicy Salmon Curry", description: "Salmon in coconut curry sauce with vegetables" },
        { name: "Jalapeño Stuffed Chicken", description: "Chicken breast stuffed with jalapeños and cheese" },
        { name: "Thai Basil Beef", description: "Ground beef with Thai basil, chili, and jasmine rice" },
        { name: "Spicy Black Bean Tacos", description: "Black beans with chipotle peppers in corn tortillas" }
      ]
    }
  };

  const currentMealPlan = isLowFODMAP ? mealPlans.lowFODMAP : mealPlans.regular;

  const generateWeeklyPlan = () => {
    if (!weight) {
      alert("Please enter your weight first to generate a personalized plan.");
      return;
    }

    const macros = calculateMacros();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Calculate portions based on macros
    const mealsPerDay = 3; // breakfast, lunch, dinner
    const proteinPerMeal = Math.round(macros.protein / mealsPerDay);
    const carbsPerMeal = Math.round(macros.carbs / mealsPerDay);
    const fatPerMeal = Math.round(macros.fat / mealsPerDay);
    
    const generateMeal = (mealType: string, dayIndex: number) => {
      let protein, carb, vegetable, fat;
      
      // Meal-specific food selections with allergy/dislike filtering
      if (mealType === "breakfast") {
        if (isLowFODMAP) {
          let proteinOptions = ["Eggs", "Greek Yogurt"].filter(p => !isExcluded(p));
          let carbOptions = ["Oats", "Quinoa"].filter(c => !isExcluded(c));
          let vegOptions = ["Spinach"].filter(v => !isExcluded(v));
          
          // Fallbacks if all options are excluded
          if (proteinOptions.length === 0) proteinOptions = ["Chicken Breast"];
          if (carbOptions.length === 0) carbOptions = ["Brown Rice"];
          if (vegOptions.length === 0) vegOptions = ["Carrots"];
          
          protein = proteinOptions[dayIndex % proteinOptions.length];
          carb = carbOptions[dayIndex % carbOptions.length];
          vegetable = vegOptions[0];
          fat = (dayIndex % 2 === 0 && !isExcluded("Almonds")) ? "Almonds" : "Olive Oil";
        } else {
          let proteinOptions = ["Eggs", "Greek Yogurt", "Cottage Cheese"].filter(p => !isExcluded(p));
          let carbOptions = ["Oats", "Quinoa"].filter(c => !isExcluded(c));
          let vegOptions = ["Spinach"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Chicken Breast"];
          if (carbOptions.length === 0) carbOptions = ["Brown Rice"];
          if (vegOptions.length === 0) vegOptions = ["Carrots"];
          
          protein = proteinOptions[dayIndex % proteinOptions.length];
          carb = carbOptions[dayIndex % carbOptions.length];
          vegetable = vegOptions[0];
          fat = (dayIndex % 2 === 0 && !isExcluded("Almonds")) ? "Almonds" : 
                (!isExcluded("Avocado")) ? "Avocado" : "Olive Oil";
        }
      } else if (mealType === "lunch") {
        if (isLowFODMAP) {
          let proteinOptions = ["Chicken Breast", "Salmon"].filter(p => !isExcluded(p));
          let carbOptions = ["Brown Rice", "Quinoa"].filter(c => !isExcluded(c));
          let vegOptions = ["Spinach", "Carrots"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Eggs"];
          if (carbOptions.length === 0) carbOptions = ["Sweet Potato"];
          if (vegOptions.length === 0) vegOptions = ["Broccoli"];
          
          protein = proteinOptions[dayIndex % proteinOptions.length];
          carb = carbOptions[dayIndex % carbOptions.length];
          vegetable = vegOptions[dayIndex % vegOptions.length];
          fat = "Olive Oil";
        } else {
          let proteinOptions = ["Chicken Breast", "Salmon", "Tofu"].filter(p => !isExcluded(p));
          let carbOptions = ["Brown Rice", "Quinoa", "Sweet Potato"].filter(c => !isExcluded(c));
          let vegOptions = ["Spinach", "Broccoli"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Eggs"];
          if (carbOptions.length === 0) carbOptions = ["Oats"];
          if (vegOptions.length === 0) vegOptions = ["Carrots"];
          
          protein = proteinOptions[dayIndex % proteinOptions.length];
          carb = carbOptions[dayIndex % carbOptions.length];
          vegetable = vegOptions[dayIndex % vegOptions.length];
          fat = "Olive Oil";
        }
      } else { // dinner
        if (isLowFODMAP) {
          let proteinOptions = ["Salmon", "Chicken Breast"].filter(p => !isExcluded(p));
          let carbOptions = ["Sweet Potato", "Brown Rice"].filter(c => !isExcluded(c));
          let vegOptions = ["Carrots", "Broccoli"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Eggs"];
          if (carbOptions.length === 0) carbOptions = ["Quinoa"];
          if (vegOptions.length === 0) vegOptions = ["Spinach"];
          
          protein = proteinOptions[dayIndex % proteinOptions.length];
          carb = carbOptions[dayIndex % carbOptions.length];
          vegetable = vegOptions[dayIndex % vegOptions.length];
          fat = !isExcluded("Avocado") ? "Avocado" : "Olive Oil";
        } else {
          let proteinOptions = ["Salmon", "Chicken Breast"].filter(p => !isExcluded(p));
          let carbOptions = ["Sweet Potato", "Brown Rice"].filter(c => !isExcluded(c));
          let vegOptions = ["Broccoli", "Carrots"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Tofu"];
          if (carbOptions.length === 0) carbOptions = ["Quinoa"];
          if (vegOptions.length === 0) vegOptions = ["Spinach"];
          
          protein = proteinOptions[dayIndex % proteinOptions.length];
          carb = carbOptions[dayIndex % carbOptions.length];
          vegetable = vegOptions[dayIndex % vegOptions.length];
          fat = (dayIndex % 2 === 0 && !isExcluded("Avocado")) ? "Avocado" : "Olive Oil";
        }
      }
      
      // Calculate portions to meet macro targets
      const proteinFood = foodDatabase.proteins[protein as keyof typeof foodDatabase.proteins];
      const carbFood = foodDatabase.carbs[carb as keyof typeof foodDatabase.carbs];
      const vegFood = foodDatabase.vegetables[vegetable as keyof typeof foodDatabase.vegetables];
      const fatFood = foodDatabase.fats[fat as keyof typeof foodDatabase.fats];
      
      // Calculate serving sizes to hit macro targets (simplified)
      const proteinServing = Math.round((proteinPerMeal / proteinFood.protein) * 100);
      const carbServing = Math.round((carbsPerMeal / carbFood.carbs) * 100);
      const vegServing = 100; // Standard serving
      const fatServing = fat === "Olive Oil" ? 1 : Math.round((fatPerMeal / fatFood.fat) * 100);
      
      // Calculate meal totals
      const mealCalories = Math.round(
        (proteinFood.calories * proteinServing / 100) +
        (carbFood.calories * carbServing / 100) +
        (vegFood.calories * vegServing / 100) +
        (fatFood.calories * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      const mealProtein = Math.round(
        (proteinFood.protein * proteinServing / 100) +
        (carbFood.protein * carbServing / 100) +
        (vegFood.protein * vegServing / 100) +
        (fatFood.protein * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      const mealCarbs = Math.round(
        (proteinFood.carbs * proteinServing / 100) +
        (carbFood.carbs * carbServing / 100) +
        (vegFood.carbs * vegServing / 100) +
        (fatFood.carbs * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      const mealFat = Math.round(
        (proteinFood.fat * proteinServing / 100) +
        (carbFood.fat * carbServing / 100) +
        (vegFood.fat * vegServing / 100) +
        (fatFood.fat * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      return {
        foods: [
          { name: protein, amount: `${proteinServing}g`, nutrition: proteinFood },
          { name: carb, amount: `${carbServing}g`, nutrition: carbFood },
          { name: vegetable, amount: `${vegServing}g`, nutrition: vegFood },
          { name: fat, amount: fat === "Olive Oil" ? `${fatServing} tbsp` : `${fatServing}g`, nutrition: fatFood }
        ],
        totals: {
          calories: mealCalories,
          protein: mealProtein,
          carbs: mealCarbs,
          fat: mealFat
        }
      };
    };

    const weekPlan = days.map((day, dayIndex) => ({
      day,
      breakfast: generateMeal("breakfast", dayIndex),
      lunch: generateMeal("lunch", dayIndex + 1),
      dinner: generateMeal("dinner", dayIndex + 2),
      dailyTotals: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    }));

    // Calculate daily totals
    weekPlan.forEach(dayPlan => {
      dayPlan.dailyTotals = {
        calories: dayPlan.breakfast.totals.calories + dayPlan.lunch.totals.calories + dayPlan.dinner.totals.calories,
        protein: dayPlan.breakfast.totals.protein + dayPlan.lunch.totals.protein + dayPlan.dinner.totals.protein,
        carbs: dayPlan.breakfast.totals.carbs + dayPlan.lunch.totals.carbs + dayPlan.dinner.totals.carbs,
        fat: dayPlan.breakfast.totals.fat + dayPlan.lunch.totals.fat + dayPlan.dinner.totals.fat
      };
    });

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
          <h1 className="text-3xl font-bold mb-2 gradient-text">Nutrition Optimization</h1>
          <p className="text-muted-foreground">
            Calculate your personalized protein needs and explore leucine-rich foods for optimal muscle protein synthesis
          </p>
        </div>

        <Tabs defaultValue="calculator" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="calculator">Protein Calculator</TabsTrigger>
            <TabsTrigger value="leucine">Leucine Content</TabsTrigger>
            <TabsTrigger value="fodmap">FODMAP Guide</TabsTrigger>
            <TabsTrigger value="meals">Meal Plans</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calculator" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Personal Details
                  </CardTitle>
                  <CardDescription>Enter your information for personalized recommendations</CardDescription>
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
                      className="w-full p-2 border rounded-md bg-background"
                      value={activityLevel}
                      onChange={(e) => setActivityLevel(e.target.value)}
                    >
                      <option value="sedentary">Sedentary (little/no exercise)</option>
                      <option value="moderate">Moderate (3-5 days/week)</option>
                      <option value="active">Very Active (6-7 days/week)</option>
                      <option value="athlete">Athlete (2x/day, intense)</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="goal">Fitness Goal</Label>
                    <select 
                      id="goal"
                      className="w-full p-2 border rounded-md bg-background"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    >
                      <option value="weight-loss">Weight Loss</option>
                      <option value="maintenance">Maintain Current Weight</option>
                      <option value="muscle-gain">Muscle Gain</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Allergies & Dietary Restrictions</CardTitle>
                  <CardDescription>Select any allergies or foods you want to avoid</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Common Allergies</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {commonAllergies.map((allergy) => (
                        <div key={allergy} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`allergy-${allergy}`}
                            checked={allergies.includes(allergy)}
                            onChange={() => toggleAllergy(allergy)}
                            className="rounded border-gray-300"
                          />
                          <Label 
                            htmlFor={`allergy-${allergy}`}
                            className="text-sm cursor-pointer"
                          >
                            {allergy}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Food Dislikes</Label>
                    <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                      {commonDislikes.map((dislike) => (
                        <div key={dislike} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`dislike-${dislike}`}
                            checked={dislikes.includes(dislike)}
                            onChange={() => toggleDislike(dislike)}
                            className="rounded border-gray-300"
                          />
                          <Label 
                            htmlFor={`dislike-${dislike}`}
                            className="text-sm cursor-pointer"
                          >
                            {dislike}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {(allergies.length > 0 || dislikes.length > 0) && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="text-sm text-orange-800">
                        <strong>Note:</strong> Your meal plans will automatically exclude selected items and provide suitable alternatives.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Daily Nutrition Targets</CardTitle>
                  <CardDescription>Based on your goals and activity level</CardDescription>
                </CardHeader>
                <CardContent>
                  {dailyMacros.calories > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{dailyMacros.calories}</div>
                        <div className="text-xs text-muted-foreground">Calories</div>
                      </div>
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{dailyMacros.protein}g</div>
                        <div className="text-xs text-muted-foreground">Protein</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{dailyMacros.carbs}g</div>
                        <div className="text-xs text-muted-foreground">Carbs</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{dailyMacros.fat}g</div>
                        <div className="text-xs text-muted-foreground">Fat</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center">
                      Enter your details to see personalized nutrition targets
                    </p>
                  )}
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
                  Leucine is a key amino acid that triggers muscle protein synthesis. Aim for 2.5-3g per meal.
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
                      <Badge className={getLeucineScoreColor(food.score)}>
                        {food.score}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fodmap" className="mt-6">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Switch
                  id="ibs-switch"
                  checked={hasIBS}
                  onCheckedChange={setHasIBS}
                />
                <Label htmlFor="ibs-switch">I have IBS or digestive issues</Label>
              </div>
              
              <div className="flex items-center gap-4">
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
                {/* Recipe Category Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Choose Your Recipe Style</h3>
                  <div className="flex gap-4 mb-6">
                    {Object.entries(recipeCategories).map(([key, category]) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="recipeStyle"
                          value={key}
                          checked={selectedRecipeStyle === key}
                          onChange={(e) => setSelectedRecipeStyle(e.target.value)}
                          className="text-primary"
                        />
                        <span className="font-medium">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Recipe Selection for Each Meal */}
                <div className="space-y-6">
                  {/* Breakfast Recipes */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-3 text-primary">🌅 Breakfast Options</h4>
                    <div className="grid gap-3">
                      {recipeCategories[selectedRecipeStyle as keyof typeof recipeCategories].breakfast.map((recipe, index) => (
                        <label key={index} className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-muted/30 transition-colors">
                          <input
                            type="radio"
                            name="breakfast"
                            value={recipe.name}
                            checked={selectedBreakfastRecipe === recipe.name}
                            onChange={(e) => setSelectedBreakfastRecipe(e.target.value)}
                            className="mt-1 text-primary"
                          />
                          <div>
                            <div className="font-medium">{recipe.name}</div>
                            <div className="text-sm text-muted-foreground">{recipe.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Lunch Recipes */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-3 text-primary">🍽️ Lunch Options</h4>
                    <div className="grid gap-3">
                      {recipeCategories[selectedRecipeStyle as keyof typeof recipeCategories].lunch.map((recipe, index) => (
                        <label key={index} className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-muted/30 transition-colors">
                          <input
                            type="radio"
                            name="lunch"
                            value={recipe.name}
                            checked={selectedLunchRecipe === recipe.name}
                            onChange={(e) => setSelectedLunchRecipe(e.target.value)}
                            className="mt-1 text-primary"
                          />
                          <div>
                            <div className="font-medium">{recipe.name}</div>
                            <div className="text-sm text-muted-foreground">{recipe.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Dinner Recipes */}
                  <div className="border rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-3 text-primary">🌙 Dinner Options</h4>
                    <div className="grid gap-3">
                      {recipeCategories[selectedRecipeStyle as keyof typeof recipeCategories].dinner.map((recipe, index) => (
                        <label key={index} className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-muted/30 transition-colors">
                          <input
                            type="radio"
                            name="dinner"
                            value={recipe.name}
                            checked={selectedDinnerRecipe === recipe.name}
                            onChange={(e) => setSelectedDinnerRecipe(e.target.value)}
                            className="mt-1 text-primary"
                          />
                          <div>
                            <div className="font-medium">{recipe.name}</div>
                            <div className="text-sm text-muted-foreground">{recipe.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Current Selected Recipes Summary */}
                {(selectedBreakfastRecipe || selectedLunchRecipe || selectedDinnerRecipe) && (
                  <div className="mt-6 p-4 bg-primary/10 rounded-lg">
                    <h4 className="font-semibold mb-3">Your Selected Recipes:</h4>
                    <div className="grid gap-2 text-sm">
                      {selectedBreakfastRecipe && (
                        <div><span className="font-medium">Breakfast:</span> {selectedBreakfastRecipe}</div>
                      )}
                      {selectedLunchRecipe && (
                        <div><span className="font-medium">Lunch:</span> {selectedLunchRecipe}</div>
                      )}
                      {selectedDinnerRecipe && (
                        <div><span className="font-medium">Dinner:</span> {selectedDinnerRecipe}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Original meal plan - now showing as a simplified view */}
                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-semibold mb-4">Standard {isLowFODMAP ? "Low-FODMAP" : "Balanced"} Meal Template:</h4>
                  <div className="grid gap-4">
                    {Object.entries(currentMealPlan).map(([meal, description]) => (
                      <div key={meal} className="p-4 border rounded-lg">
                        <h3 className="font-semibold capitalize mb-2">{meal}</h3>
                        <p className="text-muted-foreground">{description}</p>
                      </div>
                    ))}
                  </div>
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
                      <h3 className="text-lg font-semibold">Your Personalized 7-Day Meal Plan</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowWeeklyPlan(false)}
                      >
                        Hide Plan
                      </Button>
                    </div>
                    
                    <div className="mb-4 p-4 bg-primary/10 rounded-lg">
                      <h4 className="font-semibold mb-2">Your Daily Targets:</h4>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="text-center">
                          <div className="font-bold">{dailyMacros.calories}</div>
                          <div className="text-muted-foreground">Calories</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{dailyMacros.protein}g</div>
                          <div className="text-muted-foreground">Protein</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{dailyMacros.carbs}g</div>
                          <div className="text-muted-foreground">Carbs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-bold">{dailyMacros.fat}g</div>
                          <div className="text-muted-foreground">Fat</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      {weeklyPlan.map((dayPlan: any, index: number) => (
                        <Card key={index} className="border-l-4 border-l-primary">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-xl font-semibold text-primary">{dayPlan.day}</h4>
                              <div className="text-right text-sm">
                                <div className="font-semibold">Daily Total:</div>
                                <div>{dayPlan.dailyTotals.calories} cal | {dayPlan.dailyTotals.protein}p | {dayPlan.dailyTotals.carbs}c | {dayPlan.dailyTotals.fat}f</div>
                              </div>
                            </div>
                            
                            <div className="grid gap-4">
                              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                const meal = dayPlan[mealType];
                                return (
                                  <div key={mealType} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                      <h5 className="font-medium capitalize text-lg">{mealType}</h5>
                                      <div className="text-sm font-medium">
                                        {meal.totals.calories} cal | {meal.totals.protein}p | {meal.totals.carbs}c | {meal.totals.fat}f
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 justify-center">
                                      {meal.foods.map((food: any, foodIndex: number) => {
                                        const foodCalories = Math.round(food.nutrition.calories * (food.amount.includes('tbsp') ? 1 : parseInt(food.amount) / 100));
                                        const foodKj = Math.round(foodCalories * 4.184);
                                        return (
                                          <div key={foodIndex} className="bg-muted/30 p-2 rounded text-center min-w-[120px]">
                                            <div className="font-medium text-sm mb-1">{food.name}</div>
                                            <div className="text-primary font-semibold text-lg">{food.amount}</div>
                                            <div className="text-xs text-muted-foreground">
                                              <div>{foodCalories} cal</div>
                                              <div>{foodKj} kJ</div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })}
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