import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calculator, Utensils, Activity, AlertCircle, Target, Edit, Save, X, RefreshCw, Repeat, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import SampleDailyPreview from "@/components/SampleDailyPreview";
import TemplateSelector from "@/components/TemplateSelector";
import { templateMealPlans } from "@/data/mealTemplates";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import EvidenceBadge from "@/components/EvidenceBadge";
import ResearchCitation from "@/components/ResearchCitation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { 
  validateNutritionalCompleteness, 
  validateCulinarySense, 
  checkSafetyContraindications,
  validatePortionRealism 
} from '@/utils/nutritionValidation';
import { transformAIMeal } from '@/utils/nutritionHelpers';

const Nutrition = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Form state
  const [weight, setWeight] = useState("");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [goal, setGoal] = useState("maintenance");
  const [isLowFODMAP, setIsLowFODMAP] = useState(false);
  const [hasIBS, setHasIBS] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [selectedRecipeStyle, setSelectedRecipeStyle] = useState("simple");
  const [selectedBreakfastRecipe, setSelectedBreakfastRecipe] = useState("");
  const [selectedLunchRecipe, setSelectedLunchRecipe] = useState("");
  const [selectedDinnerRecipe, setSelectedDinnerRecipe] = useState("");
  
  // UI state
  const [weeklyPlan, setWeeklyPlan] = useState<any>(null);
  const [showWeeklyPlan, setShowWeeklyPlan] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPreferences, setHasPreferences] = useState(false);
  const [weekIndex, setWeekIndex] = useState(0);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [generationMethod, setGenerationMethod] = useState<'ai' | 'algorithmic'>('ai');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);

  // Recipe instructions for common meals
  const recipeInstructions: { [key: string]: { ingredients: string[], steps: string[] } } = {
    "Scrambled Eggs on Toast": {
      ingredients: ["2 eggs", "2 slices whole grain bread", "1 tbsp butter", "Salt & pepper"],
      steps: [
        "Toast bread slices until golden brown",
        "Crack eggs into a bowl, whisk with salt and pepper",
        "Heat butter in non-stick pan over medium-low heat",
        "Pour in eggs, gently stir with spatula as they cook",
        "Remove from heat when just set, serve on toast"
      ]
    },
    "Greek Yogurt Berry Bowl": {
      ingredients: ["1 cup Greek yogurt", "1/2 cup mixed berries", "1 tbsp honey", "2 tbsp granola"],
      steps: [
        "Place Greek yogurt in a bowl",
        "Top with fresh berries",
        "Drizzle with honey",
        "Sprinkle granola on top",
        "Serve immediately"
      ]
    },
    "Avocado Toast with Egg": {
      ingredients: ["1 ripe avocado", "2 slices sourdough", "1 egg", "Lemon juice", "Salt & pepper"],
      steps: [
        "Toast sourdough slices",
        "Mash avocado with lemon juice, salt, and pepper",
        "Fry or poach egg to your liking",
        "Spread avocado on toast",
        "Top with cooked egg"
      ]
    },
    "Mediterranean Salad Bowl": {
      ingredients: ["4 cups mixed greens", "1 cup cherry tomatoes, halved", "1 medium cucumber, diced", "1/4 cup kalamata olives", "1/2 cup feta cheese, crumbled", "2 tbsp extra virgin olive oil", "1 tbsp lemon juice"],
      steps: [
        "Wash and dry 4 cups mixed greens",
        "Halve 1 cup cherry tomatoes and dice 1 cucumber",
        "Combine vegetables in large bowl",
        "Add 1/4 cup olives and 1/2 cup crumbled feta",
        "Drizzle with 2 tbsp olive oil and 1 tbsp lemon juice, toss and serve"
      ]
    },
    "Grilled Chicken & Vegetables": {
      ingredients: ["1 chicken breast (6 oz)", "1 bell pepper, sliced", "1 medium zucchini, sliced", "2 tbsp olive oil", "1 tsp mixed herbs", "Salt & pepper to taste"],
      steps: [
        "Season 6 oz chicken breast with salt, pepper, and 1 tsp herbs",
        "Cut 1 bell pepper and 1 zucchini into even slices",
        "Heat grill or grill pan to medium-high",
        "Brush vegetables with 1 tbsp olive oil",
        "Grill chicken 6-7 minutes per side, vegetables 4-5 minutes until tender"
      ]
    },
    "Quinoa Power Bowl": {
      ingredients: ["1 cup dry quinoa", "2 cups mixed vegetables (broccoli, carrots, bell peppers)", "1/2 cup canned chickpeas, drained", "2 tbsp olive oil", "1 lemon (juiced)", "1 tsp fresh herbs"],
      steps: [
        "Cook 1 cup quinoa in 2 cups water for 15 minutes",
        "Steam or roast 2 cups mixed vegetables until tender",
        "Drain and rinse 1/2 cup chickpeas",
        "Combine cooked quinoa, vegetables, and chickpeas in bowl",
        "Dress with 2 tbsp olive oil, lemon juice, and herbs"
      ]
    },
    "Salmon with Sweet Potato": {
      ingredients: ["1 salmon fillet (6 oz)", "1 large sweet potato, cubed", "2 cups broccoli florets", "2 tbsp olive oil", "2 cloves garlic, minced", "1 tsp dried herbs", "Salt & pepper"],
      steps: [
        "Preheat oven to 200°C",
        "Cut 1 sweet potato into 2.5cm cubes, toss with 1 tbsp oil",
        "Roast sweet potato for 20 minutes",
        "Season 6 oz salmon with herbs, salt, and pepper",
        "Add salmon and 2 cups broccoli to pan, bake 15 minutes"
      ]
    },
    "Protein Smoothie Bowl": {
      ingredients: ["1 scoop protein powder (25g)", "1 cup frozen mixed berries", "1/2 banana", "1/2 cup unsweetened almond milk", "2 tbsp granola", "1 tbsp chia seeds", "Fresh berries for topping"],
      steps: [
        "Blend 1 scoop protein powder with 1 cup frozen berries and 1/2 banana",
        "Add 1/2 cup almond milk gradually until thick consistency",
        "Pour into bowl",
        "Top with 2 tbsp granola, 1 tbsp chia seeds, and fresh berries",
        "Serve immediately"
      ]
    },
    "Turkey & Veggie Wrap": {
      ingredients: ["1 large whole wheat tortilla", "4 oz sliced turkey breast", "1/4 avocado, sliced", "1/4 cup shredded carrots", "2 tbsp hummus", "1 cup fresh spinach leaves"],
      steps: [
        "Lay 1 tortilla flat on clean surface",
        "Spread 2 tbsp hummus evenly across center",
        "Layer 4 oz turkey, 1/4 sliced avocado, carrots, and 1 cup spinach",
        "Roll tightly from one end, tucking in sides",
        "Cut in half diagonally and serve"
      ]
    },
    "Lentil Curry": {
      ingredients: ["1 cup dried red lentils", "1 can (14 oz) coconut milk", "2 tsp curry powder", "1 medium onion, diced", "3 cloves garlic, minced", "1 cup jasmine rice", "2 tbsp coconut oil", "Salt to taste"],
      steps: [
        "Sauté 1 diced onion and 3 cloves garlic in 2 tbsp oil until fragrant",
        "Add 2 tsp curry powder and cook 1 minute",
        "Add 1 cup lentils and 14 oz coconut milk plus 1 cup water",
        "Simmer 20-25 minutes until lentils are soft and creamy",
        "Serve over 1 cup cooked jasmine rice"
      ]
    },
    "Baked Cod with Herbs": {
      ingredients: ["1 cod fillet (6 oz)", "2 tbsp fresh herbs (parsley, dill, thyme)", "1 lemon (juiced and zested)", "2 tbsp olive oil", "2 cups seasonal vegetables (asparagus, carrots)", "Salt & pepper"],
      steps: [
        "Preheat oven to 190°C",
        "Place 170g cod fillet on parchment-lined baking sheet",
        "Drizzle with 2 tbsp olive oil and lemon juice",
        "Season with 2 tbsp fresh herbs, lemon zest, salt, and pepper",
        "Add 2 cups vegetables to pan, bake 15-20 minutes until fish flakes"
      ]
    },
    "Overnight Oats": {
      ingredients: ["1/2 cup rolled oats", "1/2 cup milk of choice", "1 tbsp chia seeds", "1 tbsp honey or maple syrup", "1/2 cup fresh berries", "1 tbsp almond butter (optional)"],
      steps: [
        "Mix 1/2 cup oats, 1/2 cup milk, and 1 tbsp chia seeds in jar",
        "Add 1 tbsp honey and stir well",
        "Refrigerate overnight (minimum 4 hours)",
        "Top with 1/2 cup fresh berries and almond butter if desired",
        "Enjoy cold or warm slightly before serving"
      ]
    }
  };

  // Function to get recipe for a meal name
  const getRecipeForMeal = (mealName: string) => {
    // Try exact match first
    if (recipeInstructions[mealName]) {
      return recipeInstructions[mealName];
    }
    
    // Try partial matches for common meal types
    const lowerMeal = mealName.toLowerCase();
    
    // Breakfast items
    if (lowerMeal.includes('scrambled eggs') || lowerMeal.includes('eggs on toast')) return recipeInstructions["Scrambled Eggs on Toast"];
    if (lowerMeal.includes('greek yogurt') || lowerMeal.includes('yogurt bowl') || lowerMeal.includes('berry bowl')) return recipeInstructions["Greek Yogurt Berry Bowl"];
    if (lowerMeal.includes('avocado toast')) return recipeInstructions["Avocado Toast with Egg"];
    if (lowerMeal.includes('oats') || lowerMeal.includes('oatmeal') || lowerMeal.includes('porridge')) return recipeInstructions["Overnight Oats"];
    if (lowerMeal.includes('smoothie') || lowerMeal.includes('protein bowl')) return recipeInstructions["Protein Smoothie Bowl"];
    
    // Lunch items
    if (lowerMeal.includes('salad') || lowerMeal.includes('mediterranean')) return recipeInstructions["Mediterranean Salad Bowl"];
    if (lowerMeal.includes('quinoa') || lowerMeal.includes('power bowl') || lowerMeal.includes('grain bowl')) return recipeInstructions["Quinoa Power Bowl"];
    if (lowerMeal.includes('wrap') || lowerMeal.includes('turkey')) return recipeInstructions["Turkey & Veggie Wrap"];
    if (lowerMeal.includes('lentil') || lowerMeal.includes('curry')) return recipeInstructions["Lentil Curry"];
    
    // Dinner items
    if (lowerMeal.includes('grilled chicken') || lowerMeal.includes('chicken breast')) return recipeInstructions["Grilled Chicken & Vegetables"];
    if (lowerMeal.includes('salmon') || lowerMeal.includes('sweet potato')) return recipeInstructions["Salmon with Sweet Potato"];
    if (lowerMeal.includes('cod') || lowerMeal.includes('baked fish') || lowerMeal.includes('white fish')) return recipeInstructions["Baked Cod with Herbs"];
    
    // Generic categories
    if (lowerMeal.includes('fish') || lowerMeal.includes('seafood')) return recipeInstructions["Baked Cod with Herbs"];
    if (lowerMeal.includes('chicken') || lowerMeal.includes('poultry')) return recipeInstructions["Grilled Chicken & Vegetables"];
    if (lowerMeal.includes('vegetarian') || lowerMeal.includes('veggie')) return recipeInstructions["Quinoa Power Bowl"];
    
    // Default simple recipe
    return {
      ingredients: ["Fresh, whole food ingredients as listed in meal plan above"],
      steps: [
        "Gather all ingredients listed in your meal plan",
        "Prepare ingredients by washing, chopping as needed",
        "Cook using healthy methods: steaming, grilling, or light sautéing",
        "Season with herbs and spices for flavor",
        "Serve fresh and enjoy as part of your balanced nutrition plan"
      ]
    };
  };

  // Load saved preferences on component mount
  useEffect(() => {
    if (user) {
      loadUserPreferences();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data, error } = await supabase
        .from('nutrition_preferences')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading preferences:', error);
        return;
      }

      if (data) {
        setWeight(data.weight?.toString() || "");
        setActivityLevel(data.activity_level || "moderate");
        setGoal(data.fitness_goal || "maintenance");
        setAllergies(data.allergies || []);
        setDislikes(data.dislikes || []);
        setSelectedRecipeStyle(data.selected_recipe_style || "simple");
        setSelectedBreakfastRecipe(data.selected_breakfast_recipe || "");
        setSelectedLunchRecipe(data.selected_lunch_recipe || "");
        setSelectedDinnerRecipe(data.selected_dinner_recipe || "");
        setIsLowFODMAP(data.is_low_fodmap || false);
        setHasIBS(data.has_ibs || false);
        setHasPreferences(true);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserPreferences = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const preferences = {
        user_id: user.id,
        weight: weight ? parseFloat(weight) : null,
        activity_level: activityLevel,
        fitness_goal: goal,
        allergies,
        dislikes,
        selected_recipe_style: selectedRecipeStyle,
        selected_breakfast_recipe: selectedBreakfastRecipe,
        selected_lunch_recipe: selectedLunchRecipe,
        selected_dinner_recipe: selectedDinnerRecipe,
        is_low_fodmap: isLowFODMAP,
        has_ibs: hasIBS
      };

      const { error } = await supabase
        .from('nutrition_preferences')
        .upsert(preferences, { onConflict: 'user_id' });

      if (error) {
        throw error;
      }

      setHasPreferences(true);
      setIsEditing(false);
      toast({
        title: t('nutrition.savedMessage'),
        description: t('nutrition.savedDescription'),
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: t('nutrition.errorSaving'),
        description: t('nutrition.errorDescription'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
      "Chicken Breast": { protein: 31, carbs: 0, fat: 3.6, calories: 165, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
      "Turkey": { protein: 29, carbs: 0, fat: 7, calories: 189, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
      "Lean Beef": { protein: 26, carbs: 0, fat: 15, calories: 250, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
      "Salmon": { protein: 25, carbs: 0, fat: 12, calories: 208, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
      "Tuna": { protein: 26, carbs: 0, fat: 1, calories: 116, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
      "Shrimp": { protein: 24, carbs: 0, fat: 0.3, calories: 99, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
      "Greek Yogurt": { protein: 10, carbs: 4, fat: 0, calories: 59, fiber: 0, serving: "100g", category: "protein", fodmap: "moderate" },
      "Eggs": { protein: 6, carbs: 0.6, fat: 5, calories: 78, fiber: 0, serving: "1 large", category: "protein", fodmap: "low" },
      "Tofu": { protein: 8, carbs: 2, fat: 4, calories: 76, fiber: 1, serving: "100g", category: "protein", fodmap: "low" },
      "Tempeh": { protein: 19, carbs: 9, fat: 11, calories: 193, fiber: 5, serving: "100g", category: "protein", fodmap: "high" },
      "Cottage Cheese": { protein: 11, carbs: 3.4, fat: 4.3, calories: 98, fiber: 0, serving: "100g", category: "protein", fodmap: "moderate" },
      "Lentils": { protein: 9, carbs: 20, fat: 0.4, calories: 116, fiber: 8, serving: "100g cooked", category: "protein", fodmap: "high" }
    },
    carbs: {
      "Brown Rice": { protein: 2.6, carbs: 23, fat: 0.9, calories: 111, fiber: 1.8, serving: "100g cooked", category: "carb", fodmap: "low" },
      "Quinoa": { protein: 4.4, carbs: 22, fat: 1.9, calories: 120, fiber: 2.8, serving: "100g cooked", category: "carb", fodmap: "moderate" },
      "Wild Rice": { protein: 4, carbs: 21, fat: 0.3, calories: 101, fiber: 1.8, serving: "100g cooked", category: "carb", fodmap: "low" },
      "Buckwheat": { protein: 3.4, carbs: 20, fat: 0.6, calories: 92, fiber: 2.7, serving: "100g cooked", category: "carb", fodmap: "low" },
      "Sweet Potato": { protein: 2, carbs: 20, fat: 0.1, calories: 86, fiber: 3, serving: "100g", category: "carb", fodmap: "low" },
      "Oats": { protein: 2.4, carbs: 12, fat: 1.4, calories: 68, fiber: 1.7, serving: "100g cooked", category: "carb", fodmap: "moderate" },
      "Barley": { protein: 2.3, carbs: 28, fat: 0.4, calories: 123, fiber: 3.8, serving: "100g cooked", category: "carb", fodmap: "high" },
      "Whole Grain Pasta": { protein: 5, carbs: 25, fat: 0.9, calories: 124, fiber: 3.2, serving: "100g cooked", category: "carb", fodmap: "high" }
    },
    vegetables: {
      "Spinach": { protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23, fiber: 2.2, serving: "100g", category: "vegetable", fodmap: "low" },
      "Kale": { protein: 4.3, carbs: 9, fat: 0.9, calories: 49, fiber: 3.6, serving: "100g", category: "vegetable", fodmap: "low" },
      "Broccoli": { protein: 2.8, carbs: 7, fat: 0.4, calories: 34, fiber: 2.6, serving: "100g", category: "vegetable", fodmap: "low" },
      "Carrots": { protein: 0.9, carbs: 10, fat: 0.2, calories: 41, fiber: 2.8, serving: "100g", category: "vegetable", fodmap: "low" },
      "Bell Peppers": { protein: 1, carbs: 6, fat: 0.3, calories: 31, fiber: 2.1, serving: "100g", category: "vegetable", fodmap: "low" },
      "Zucchini": { protein: 1.2, carbs: 3, fat: 0.3, calories: 17, fiber: 1, serving: "100g", category: "vegetable", fodmap: "low" },
      "Asparagus": { protein: 2.2, carbs: 4, fat: 0.2, calories: 20, fiber: 2.1, serving: "100g", category: "vegetable", fodmap: "high" },
      "Cauliflower": { protein: 1.9, carbs: 5, fat: 0.3, calories: 25, fiber: 2, serving: "100g", category: "vegetable", fodmap: "moderate" },
      "Cucumber": { protein: 0.7, carbs: 3.6, fat: 0.1, calories: 15, fiber: 0.5, serving: "100g", category: "vegetable", fodmap: "low" },
      "Tomatoes": { protein: 0.9, carbs: 3.9, fat: 0.2, calories: 18, fiber: 1.2, serving: "100g", category: "vegetable", fodmap: "low" },
      "Green Beans": { protein: 1.8, carbs: 7, fat: 0.2, calories: 31, fiber: 2.7, serving: "100g", category: "vegetable", fodmap: "low" },
      "Bok Choy": { protein: 1.5, carbs: 2.2, fat: 0.2, calories: 13, fiber: 1, serving: "100g", category: "vegetable", fodmap: "low" }
    },
    fats: {
      "Avocado": { protein: 2, carbs: 9, fat: 15, calories: 160, fiber: 7, serving: "100g", category: "fat", fodmap: "low" },
      "Almonds": { protein: 21, carbs: 22, fat: 50, calories: 579, fiber: 12.5, serving: "100g", category: "fat", fodmap: "high" },
      "Walnuts": { protein: 15, carbs: 14, fat: 65, calories: 654, fiber: 6.7, serving: "100g", category: "fat", fodmap: "moderate" },
      "Chia Seeds": { protein: 17, carbs: 42, fat: 31, calories: 486, fiber: 34, serving: "100g", category: "fat", fodmap: "low" },
      "Flax Seeds": { protein: 18, carbs: 29, fat: 42, calories: 534, fiber: 27, serving: "100g", category: "fat", fodmap: "low" },
      "Tahini": { protein: 17, carbs: 21, fat: 54, calories: 595, fiber: 9.3, serving: "100g", category: "fat", fodmap: "low" },
      "Olive Oil": { protein: 0, carbs: 0, fat: 14, calories: 119, fiber: 0, serving: "1 tbsp", category: "fat", fodmap: "low" },
      "Cashews": { protein: 18, carbs: 33, fat: 44, calories: 553, fiber: 3.3, serving: "100g", category: "fat", fodmap: "high" },
      "Peanut Butter": { protein: 25, carbs: 20, fat: 50, calories: 588, fiber: 6, serving: "100g", category: "fat", fodmap: "moderate" }
    }
  };

  const foodLongevityBenefits = {
    "Chicken Breast": {
      benefits: ["High-quality protein for muscle maintenance", "Selenium supports immune function", "B vitamins for energy metabolism"],
      longevityScore: 8
    },
    "Salmon": {
      benefits: ["Omega-3 fatty acids reduce inflammation", "Supports heart and brain health", "Astaxanthin provides antioxidant protection"],
      longevityScore: 9
    },
    "Greek Yogurt": {
      benefits: ["Probiotics support gut health", "High protein maintains muscle mass", "Calcium strengthens bones"],
      longevityScore: 8
    },
    "Eggs": {
      benefits: ["Complete protein with all essential amino acids", "Choline supports brain function", "Lutein protects eye health"],
      longevityScore: 8
    },
    "Tofu": {
      benefits: ["Plant-based protein", "Isoflavones may reduce cancer risk", "Low in saturated fat"],
      longevityScore: 7
    },
    "Cottage Cheese": {
      benefits: ["Casein protein for sustained amino acid release", "High calcium content", "Low in calories"],
      longevityScore: 7
    },
    "Brown Rice": {
      benefits: ["Whole grain fibre supports digestive health", "B vitamins for energy", "Selenium acts as antioxidant"],
      longevityScore: 6
    },
    "Quinoa": {
      benefits: ["Complete protein from plants", "High in fibre and minerals", "Gluten-free whole grain"],
      longevityScore: 8
    },
    "Sweet Potato": {
      benefits: ["Beta-carotene converts to vitamin A", "High fibre supports gut health", "Potassium for heart health"],
      longevityScore: 8
    },
    "Oats": {
      benefits: ["Beta-glucan lowers cholesterol", "Sustained energy release", "High in soluble fibre"],
      longevityScore: 7
    },
    "Spinach": {
      benefits: ["Folate supports DNA repair", "Nitrates improve circulation", "Antioxidants protect against aging"],
      longevityScore: 9
    },
    "Broccoli": {
      benefits: ["Sulforaphane has anti-cancer properties", "High in vitamin C", "Supports detoxification"],
      longevityScore: 9
    },
    "Carrots": {
      benefits: ["Beta-carotene for eye health", "Fibre supports digestion", "Antioxidants fight inflammation"],
      longevityScore: 7
    },
    "Avocado": {
      benefits: ["Monounsaturated fats for heart health", "Fibre aids digestion", "Potassium regulates blood pressure"],
      longevityScore: 8
    },
    "Almonds": {
      benefits: ["Vitamin E protects cells", "Healthy fats support brain function", "Magnesium for muscle and nerve function"],
      longevityScore: 8
    },
    "Olive Oil": {
      benefits: ["Extra virgin olive oil has anti-inflammatory compounds", "Monounsaturated fats protect heart", "Polyphenols act as antioxidants"],
      longevityScore: 9
    }
  };

  const generateShoppingList = () => {
    if (!weeklyPlan) return [];
    
    const ingredientQuantities: Record<string, number> = {};
    
    weeklyPlan.forEach((dayPlan: any) => {
      ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
        const meal = dayPlan[mealType];
        meal.foods.forEach((food: any) => {
          const baseAmount = food.amount.includes('tbsp') ? 
            parseFloat(food.amount) : 
            parseFloat(food.amount.replace('g', ''));
          
          if (ingredientQuantities[food.name]) {
            ingredientQuantities[food.name] += baseAmount;
          } else {
            ingredientQuantities[food.name] = baseAmount;
          }
        });
      });
    });
    
    return Object.entries(ingredientQuantities).map(([name, quantity]) => ({
      name,
      quantity: Math.round(quantity),
      unit: name === "Olive Oil" ? "tbsp" : "g"
    }));
  };

  const printWeeklyPlan = () => {
    const printContent = document.getElementById('weekly-plan-print');
    if (printContent) {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <html>
            <head>
              <title>7-Day Nutrition Plan</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .day-header { background: #f0f0f0; padding: 10px; margin: 20px 0 10px 0; }
                .meal { margin: 10px 0; padding: 10px; border-left: 3px solid #007bff; }
                .meal-name { font-weight: bold; font-size: 16px; color: #007bff; }
                .meal-description { font-style: italic; color: #666; margin: 5px 0; }
                .foods { display: flex; flex-wrap: wrap; gap: 10px; margin: 10px 0; }
                .food-item { background: #f8f9fa; padding: 8px; border-radius: 4px; min-width: 120px; text-align: center; }
                .nutrition { font-size: 12px; color: #666; margin-top: 5px; }
                @media print { body { margin: 0; } }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        newWindow.document.close();
        newWindow.print();
      }
    }
  };

  const printShoppingList = () => {
    const shoppingList = generateShoppingList();
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Shopping List - 7-Day Nutrition Plan</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #007bff; }
              .ingredient { display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid #eee; }
              .category { font-weight: bold; margin-top: 20px; color: #333; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Shopping List - 7-Day Nutrition Plan</h1>
            <h3>Proteins:</h3>
            ${shoppingList.filter(item => ['Chicken Breast', 'Salmon', 'Greek Yogurt', 'Eggs', 'Tofu', 'Cottage Cheese'].includes(item.name))
              .map(item => `<div class="ingredient"><span>${item.name}</span><span>${item.quantity}${item.unit}</span></div>`).join('')}
            <h3>Carbohydrates:</h3>
            ${shoppingList.filter(item => ['Brown Rice', 'Quinoa', 'Sweet Potato', 'Oats'].includes(item.name))
              .map(item => `<div class="ingredient"><span>${item.name}</span><span>${item.quantity}${item.unit}</span></div>`).join('')}
            <h3>Vegetables:</h3>
            ${shoppingList.filter(item => ['Spinach', 'Broccoli', 'Carrots'].includes(item.name))
              .map(item => `<div class="ingredient"><span>${item.name}</span><span>${item.quantity}${item.unit}</span></div>`).join('')}
            <h3>Fats & Oils:</h3>
            ${shoppingList.filter(item => ['Avocado', 'Almonds', 'Olive Oil'].includes(item.name))
              .map(item => `<div class="ingredient"><span>${item.name}</span><span>${item.quantity}${item.unit}</span></div>`).join('')}
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.print();
    }
  };

  const printLongevityBenefits = () => {
    if (!weeklyPlan) return;
    
    const uniqueFoods = new Set<string>();
    weeklyPlan.forEach((dayPlan: any) => {
      ['breakfast', 'lunch', 'dinner'].forEach((mealType) => {
        const meal = dayPlan[mealType];
        meal.foods.forEach((food: any) => {
          uniqueFoods.add(food.name);
        });
      });
    });
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Longevity Benefits - 7-Day Nutrition Plan</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #007bff; }
              .food-benefit { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
              .food-name { font-weight: bold; font-size: 18px; color: #333; margin-bottom: 10px; }
              .longevity-score { float: right; background: #007bff; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px; }
              .benefits { list-style-type: none; padding: 0; }
              .benefits li { padding: 5px 0; padding-left: 20px; position: relative; }
              .benefits li:before { content: "✓"; position: absolute; left: 0; color: #28a745; font-weight: bold; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            <h1>Longevity Benefits of Your 7-Day Meal Plan</h1>
            <p>The foods in your personalised meal plan offer numerous health and longevity benefits:</p>
            ${Array.from(uniqueFoods).map(foodName => {
              const benefits = foodLongevityBenefits[foodName as keyof typeof foodLongevityBenefits];
              if (!benefits) return '';
              return `
                <div class="food-benefit">
                  <div class="food-name">
                    ${foodName}
                    <span class="longevity-score">Longevity Score: ${benefits.longevityScore}/10</span>
                  </div>
                  <ul class="benefits">
                    ${benefits.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
                  </ul>
                </div>
              `;
            }).join('')}
          </body>
        </html>
      `);
      newWindow.document.close();
      newWindow.print();
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

  const generateAIMealPlan = async () => {
    if (!weight) {
      toast({
        title: "Missing information",
        description: "Please set your weight in your preferences first.",
        variant: "destructive",
      });
      return null;
    }

    setIsGeneratingAI(true);
    console.log('Starting AI meal plan generation...');
    
    try {
      const macros = calculateMacros();
      console.log('Calling AI with macros:', macros);
      
      const { data, error } = await supabase.functions.invoke('generate-meal-plan', {
        body: {
          weight: parseFloat(weight),
          activityLevel,
          fitnessGoal: goal,
          allergies,
          dislikes,
          isLowFODMAP,
          hasIBS,
          calories: macros.calories,
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat,
          recipeStyle: selectedRecipeStyle
        }
      });

      setIsGeneratingAI(false);

      if (error) {
        console.error('AI meal generation error:', error);
        
        if (error.message?.includes('Rate limits')) {
          toast({
            title: "Rate limit reached",
            description: "Please try again in a moment. Falling back to algorithmic generation.",
            variant: "destructive",
          });
        } else if (error.message?.includes('Payment required')) {
          toast({
            title: "Credits required",
            description: "AI credits needed. Falling back to algorithmic generation.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "AI generation unavailable",
            description: "Using algorithmic meal plan instead.",
          });
        }
        return null;
      }

      if (data?.fallbackRequired) {
        console.log('AI validation failed, using algorithmic fallback');
        toast({
          title: "Validation issue",
          description: "Using algorithmic meal plan to ensure safety.",
        });
        return null;
      }

      if (data?.mealPlan) {
        console.log('AI meal plan generated successfully');
        setGenerationMethod('ai');
        return data.mealPlan;
      }

      console.log('AI returned no meal plan, falling back to algorithmic');
      return null;
    } catch (err) {
      console.error('Error calling AI:', err);
      setIsGeneratingAI(false);
      toast({
        title: "Generation error",
        description: "Falling back to algorithmic meal plan.",
      });
      return null;
    }
  };

  const generateWeeklyPlan = async (useExistingVariety: boolean = false) => {
    console.log('generateWeeklyPlan called');
    if (!weight) {
      toast({
        title: "Missing information",
        description: "Please set your weight in your preferences first.",
        variant: "destructive",
      });
      return;
    }

    // Try AI generation first
    console.log('Attempting AI generation...');
    const aiPlan = await generateAIMealPlan();
    
    if (aiPlan) {
      console.log('Using AI-generated plan');
      // Transform AI plan to match expected format
      const transformedPlan = aiPlan.map((dayPlan: any) => ({
        day: dayPlan.day,
        breakfast: transformAIMeal(dayPlan.breakfast, 'breakfast'),
        lunch: transformAIMeal(dayPlan.lunch, 'lunch'),
        dinner: transformAIMeal(dayPlan.dinner, 'dinner')
      }));
      
      setWeeklyPlan(transformedPlan);
      setShowWeeklyPlan(true);
      
      toast({
        title: "AI Meal Plan Generated",
        description: "Your personalized 7-day meal plan is ready!",
      });
      return;
    }

    // Fallback to algorithmic generation
    console.log('Using algorithmic generation');
    setGenerationMethod('algorithmic');

    const macros = calculateMacros();
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Calculate the current week index for variety
    const currentWeekIndex = useExistingVariety ? weekIndex : weekIndex + 1;
    
    // Update week index for next time if creating new variety
    if (!useExistingVariety) {
      setWeekIndex(currentWeekIndex);
    }
    
    // Calculate portions based on macros with realistic meal distribution
    const mealsPerDay = 3; // breakfast, lunch, dinner
    // Breakfast gets 25%, Lunch 35%, Dinner 40% of daily protein
    const dailyProtein = macros.protein;
    const breakfastProtein = Math.round(dailyProtein * 0.25);
    const lunchProtein = Math.round(dailyProtein * 0.35);
    const dinnerProtein = Math.round(dailyProtein * 0.40);
    
    const carbsPerMeal = Math.round(macros.carbs / mealsPerDay);
    const fatPerMeal = Math.round(macros.fat / mealsPerDay);
    
    const getProteinTarget = (mealType: string) => {
      switch(mealType) {
        case 'breakfast': return breakfastProtein;
        case 'lunch': return lunchProtein;
        case 'dinner': return dinnerProtein;
        default: return Math.round(dailyProtein / 3);
      }
    };
    
    const generateMeal = (mealType: string, dayIndex: number) => {
      let protein, carb, vegetable, fat, recipeName, recipeDescription;
      
      const currentRecipes = recipeCategories[selectedRecipeStyle as keyof typeof recipeCategories];
      const proteinPerMeal = getProteinTarget(mealType);
      
      // Create variety by using different combinations and cooking methods
      const cookingMethods = {
        breakfast: {
          eggs: ["Fluffy Scrambled Eggs", "Mediterranean Herb Omelet", "Protein-Packed Egg Bowl", "Golden Poached Eggs"],
          yogurt: ["Greek Yogurt Parfait", "Berry Protein Bowl", "Creamy Vanilla Yogurt", "Tropical Yogurt Delight"],
          cottage: ["Cottage Cheese Power Bowl", "Creamy Berry Cottage", "Savory Herb Cottage", "Protein-Rich Morning Bowl"]
        },
        lunch: {
          chicken: ["Grilled Herb Chicken", "Mediterranean Chicken Bowl", "Lemon Pepper Chicken", "Spicy Chicken Salad"],
          salmon: ["Pan-Seared Salmon", "Teriyaki Glazed Salmon", "Herb-Crusted Salmon", "Mediterranean Salmon Bowl"],
          tofu: ["Crispy Sesame Tofu", "Asian-Style Tofu Bowl", "Herb-Marinated Tofu", "Spicy Sriracha Tofu"]
        },
        dinner: {
          salmon: ["Honey Glazed Salmon", "Mediterranean Baked Salmon", "Asian-Style Salmon", "Lemon Herb Salmon Fillet"],
          chicken: ["Roasted Rosemary Chicken", "Mediterranean Chicken Breast", "Garlic Herb Chicken", "Spicy Paprika Chicken"],
          tofu: ["Ginger Soy Glazed Tofu", "Mediterranean Herb Tofu", "Spicy Asian Tofu", "Lemon Pepper Tofu"]
        }
      };

      // Meal-specific food selections with allergy/dislike filtering
      if (mealType === "breakfast") {
        // Determine which protein to use based on rotation
        let proteinOptions = isLowFODMAP 
          ? ["Eggs", "Greek Yogurt"].filter(p => !isExcluded(p))
          : ["Eggs", "Greek Yogurt", "Cottage Cheese"].filter(p => !isExcluded(p));
        
        if (proteinOptions.length === 0) proteinOptions = ["Eggs"];
        protein = proteinOptions[(dayIndex + currentWeekIndex) % proteinOptions.length];

        // Set ingredients based on protein type (realistic breakfast combinations)
        if (protein === "Eggs") {
          carb = !isExcluded("Oats") ? "Oats" : "Quinoa";
          fat = !isExcluded("Avocado") ? "Avocado" : "Olive Oil";
          vegetable = null;
          const eggStyle = cookingMethods.breakfast.eggs[(dayIndex + currentWeekIndex) % cookingMethods.breakfast.eggs.length];
          recipeName = selectedBreakfastRecipe || `${eggStyle} with ${carb}`;
          recipeDescription = `Protein-rich eggs with ${carb.toLowerCase()}`;
        } else if (protein === "Greek Yogurt" || protein === "Cottage Cheese") {
          carb = !isExcluded("Oats") ? "Oats" : "Quinoa";
          fat = !isExcluded("Almonds") ? "Almonds" : "Olive Oil";
          vegetable = null;
          const yogurtStyle = protein === "Greek Yogurt" 
            ? cookingMethods.breakfast.yogurt[(dayIndex + currentWeekIndex) % cookingMethods.breakfast.yogurt.length]
            : cookingMethods.breakfast.cottage[(dayIndex + currentWeekIndex) % cookingMethods.breakfast.cottage.length];
          recipeName = selectedBreakfastRecipe || `${yogurtStyle} with ${carb}`;
          recipeDescription = `Creamy ${protein.toLowerCase()} with ${carb.toLowerCase()} and ${fat.toLowerCase()}`;
        }
      } else if (mealType === "lunch") {
        // Use selected lunch recipe if available
        if (selectedLunchRecipe) {
          const selectedRecipe = currentRecipes.lunch.find(r => r.name === selectedLunchRecipe);
          if (selectedRecipe) {
            recipeName = selectedRecipe.name;
            recipeDescription = selectedRecipe.description;
          }
        }

        if (isLowFODMAP) {
          let proteinOptions = ["Chicken Breast", "Salmon"].filter(p => !isExcluded(p));
          let carbOptions = ["Brown Rice", "Quinoa"].filter(c => !isExcluded(c));
          let vegOptions = ["Spinach", "Carrots"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Eggs"];
          if (carbOptions.length === 0) carbOptions = ["Sweet Potato"];
          if (vegOptions.length === 0) vegOptions = ["Broccoli"];
          
          protein = proteinOptions[(dayIndex + currentWeekIndex) % proteinOptions.length];
          carb = carbOptions[(dayIndex + currentWeekIndex) % carbOptions.length];
          vegetable = vegOptions[(dayIndex + currentWeekIndex) % vegOptions.length];
          fat = "Olive Oil";
        } else {
          let proteinOptions = ["Chicken Breast", "Salmon", "Tofu"].filter(p => !isExcluded(p));
          let carbOptions = ["Brown Rice", "Quinoa", "Sweet Potato"].filter(c => !isExcluded(c));
          let vegOptions = ["Spinach", "Broccoli"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Eggs"];
          if (carbOptions.length === 0) carbOptions = ["Oats"];
          if (vegOptions.length === 0) vegOptions = ["Carrots"];
          
          protein = proteinOptions[(dayIndex + currentWeekIndex) % proteinOptions.length];
          carb = carbOptions[(dayIndex + currentWeekIndex) % carbOptions.length];
          vegetable = vegOptions[(dayIndex + currentWeekIndex) % vegOptions.length];
          fat = "Olive Oil";
        }
        
        // Create specific lunch name if not using selected recipe
        if (!recipeName) {
          if (protein === "Chicken Breast") {
            const chickenStyle = cookingMethods.lunch.chicken[(dayIndex + currentWeekIndex) % cookingMethods.lunch.chicken.length];
            recipeName = `${chickenStyle} with ${carb} and ${vegetable}`;
          } else if (protein === "Salmon") {
            const salmonStyle = cookingMethods.lunch.salmon[(dayIndex + currentWeekIndex) % cookingMethods.lunch.salmon.length];
            recipeName = `${salmonStyle} with ${carb} and ${vegetable}`;
          } else if (protein === "Tofu") {
            const tofuStyle = cookingMethods.lunch.tofu[(dayIndex + currentWeekIndex) % cookingMethods.lunch.tofu.length];
            recipeName = `${tofuStyle} with ${carb} and ${vegetable}`;
          }
          recipeDescription = `Balanced midday meal with ${protein.toLowerCase()}, ${carb.toLowerCase()}, and ${vegetable.toLowerCase()}`;
        }
      } else { // dinner
        // Use selected dinner recipe if available
        if (selectedDinnerRecipe) {
          const selectedRecipe = currentRecipes.dinner.find(r => r.name === selectedDinnerRecipe);
          if (selectedRecipe) {
            recipeName = selectedRecipe.name;
            recipeDescription = selectedRecipe.description;
          }
        }

        if (isLowFODMAP) {
          let proteinOptions = ["Salmon", "Chicken Breast"].filter(p => !isExcluded(p));
          let carbOptions = ["Sweet Potato", "Brown Rice"].filter(c => !isExcluded(c));
          let vegOptions = ["Carrots", "Broccoli"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Eggs"];
          if (carbOptions.length === 0) carbOptions = ["Quinoa"];
          if (vegOptions.length === 0) vegOptions = ["Spinach"];
          
          protein = proteinOptions[(dayIndex + currentWeekIndex) % proteinOptions.length];
          carb = carbOptions[(dayIndex + currentWeekIndex) % carbOptions.length];
          vegetable = vegOptions[(dayIndex + currentWeekIndex) % vegOptions.length];
          fat = !isExcluded("Avocado") ? "Avocado" : "Olive Oil";
        } else {
          let proteinOptions = ["Salmon", "Chicken Breast"].filter(p => !isExcluded(p));
          let carbOptions = ["Sweet Potato", "Brown Rice"].filter(c => !isExcluded(c));
          let vegOptions = ["Broccoli", "Carrots"].filter(v => !isExcluded(v));
          
          // Fallbacks
          if (proteinOptions.length === 0) proteinOptions = ["Tofu"];
          if (carbOptions.length === 0) carbOptions = ["Quinoa"];
          if (vegOptions.length === 0) vegOptions = ["Spinach"];
          
          protein = proteinOptions[(dayIndex + currentWeekIndex) % proteinOptions.length];
          carb = carbOptions[(dayIndex + currentWeekIndex) % carbOptions.length];
          vegetable = vegOptions[(dayIndex + currentWeekIndex) % vegOptions.length];
          fat = ((dayIndex + currentWeekIndex) % 2 === 0 && !isExcluded("Avocado")) ? "Avocado" : "Olive Oil";
        }
        
        // Create specific dinner name if not using selected recipe
        if (!recipeName) {
          if (protein === "Salmon") {
            const salmonStyle = cookingMethods.dinner.salmon[(dayIndex + currentWeekIndex) % cookingMethods.dinner.salmon.length];
            recipeName = `${salmonStyle} with ${carb} and ${vegetable}`;
          } else if (protein === "Chicken Breast") {
            const chickenStyle = cookingMethods.dinner.chicken[(dayIndex + currentWeekIndex) % cookingMethods.dinner.chicken.length];
            recipeName = `${chickenStyle} with ${carb} and ${vegetable}`;
          } else if (protein === "Tofu") {
            const tofuStyle = cookingMethods.dinner.tofu[(dayIndex + currentWeekIndex) % cookingMethods.dinner.tofu.length];
            recipeName = `${tofuStyle} with ${carb} and ${vegetable}`;
          }
          recipeDescription = `Satisfying evening meal with ${protein.toLowerCase()}, ${carb.toLowerCase()}, and ${vegetable.toLowerCase()}`;
        }
      }
      
      // Calculate portions to meet macro targets
      const proteinFood = foodDatabase.proteins[protein as keyof typeof foodDatabase.proteins];
      const carbFood = foodDatabase.carbs[carb as keyof typeof foodDatabase.carbs];
      const vegFood = vegetable ? foodDatabase.vegetables[vegetable as keyof typeof foodDatabase.vegetables] : null;
      const fatFood = foodDatabase.fats[fat as keyof typeof foodDatabase.fats];
      
      // Calculate serving sizes to hit macro targets with realistic caps
      const maxProteinServing = protein === "Eggs" ? 300 : 250; // Max 5 eggs or 250g other protein
      const maxCarbServing = 150; // Max 150g carbs per meal
      const maxVegServing = 150; // Max 150g vegetables
      
      const proteinServing = Math.min(
        Math.round((proteinPerMeal / proteinFood.protein) * 100),
        maxProteinServing
      );
      const carbServing = Math.min(
        Math.round((carbsPerMeal / carbFood.carbs) * 100),
        maxCarbServing
      );
      const vegServing = vegetable ? Math.min(100, maxVegServing) : 0;
      const fatServing = fat === "Olive Oil" ? Math.min(2, Math.round(fatPerMeal / 10)) : 
                         Math.min(30, Math.round((fatPerMeal / fatFood.fat) * 100));
      
      // Calculate meal totals
      const mealCalories = Math.round(
        (proteinFood.calories * proteinServing / 100) +
        (carbFood.calories * carbServing / 100) +
        (vegFood ? vegFood.calories * vegServing / 100 : 0) +
        (fatFood.calories * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      const mealProtein = Math.round(
        (proteinFood.protein * proteinServing / 100) +
        (carbFood.protein * carbServing / 100) +
        (vegFood ? vegFood.protein * vegServing / 100 : 0) +
        (fatFood.protein * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      const mealCarbs = Math.round(
        (proteinFood.carbs * proteinServing / 100) +
        (carbFood.carbs * carbServing / 100) +
        (vegFood ? vegFood.carbs * vegServing / 100 : 0) +
        (fatFood.carbs * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      const mealFat = Math.round(
        (proteinFood.fat * proteinServing / 100) +
        (carbFood.fat * carbServing / 100) +
        (vegFood ? vegFood.fat * vegServing / 100 : 0) +
        (fatFood.fat * (fat === "Olive Oil" ? fatServing : fatServing / 100))
      );
      
      // Build foods array with only included ingredients
      const foods = [
        { name: protein, amount: `${proteinServing}g`, nutrition: proteinFood },
        { name: carb, amount: `${carbServing}g`, nutrition: carbFood }
      ];
      
      if (vegetable && vegFood) {
        foods.push({ name: vegetable, amount: `${vegServing}g`, nutrition: vegFood });
      }
      
      foods.push({ name: fat, amount: fat === "Olive Oil" ? `${fatServing} tbsp` : `${fatServing}g`, nutrition: fatFood });
      
      return {
        recipeName,
        recipeDescription,
        foods,
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
    console.log('Algorithmic meal plan generated:', weekPlan);
    
    toast({
      title: "Meal Plan Generated",
      description: "Your personalized 7-day meal plan is ready!",
    });
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    // Load the template meal plan
    const templateData = templateMealPlans[templateId as keyof typeof templateMealPlans];
    
    if (!templateData) {
      toast({
        title: "Error",
        description: "Template not found",
        variant: "destructive"
      });
      return;
    }

    // Convert template data to weeklyPlan format
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayKeys = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    const weekPlan = days.map((day, index) => {
      const dayData = templateData[dayKeys[index] as keyof typeof templateData];
      
      return {
        day,
        breakfast: {
          name: dayData.breakfast.name,
          description: dayData.breakfast.description,
          foods: [],
          totals: {
            calories: dayData.breakfast.calories,
            protein: dayData.breakfast.protein,
            carbs: dayData.breakfast.carbs,
            fat: dayData.breakfast.fat
          },
          instructions: `Prepared according to ${templateId} template guidelines`
        },
        lunch: {
          name: dayData.lunch.name,
          description: dayData.lunch.description,
          foods: [],
          totals: {
            calories: dayData.lunch.calories,
            protein: dayData.lunch.protein,
            carbs: dayData.lunch.carbs,
            fat: dayData.lunch.fat
          },
          instructions: `Prepared according to ${templateId} template guidelines`
        },
        dinner: {
          name: dayData.dinner.name,
          description: dayData.dinner.description,
          foods: [],
          totals: {
            calories: dayData.dinner.calories,
            protein: dayData.dinner.protein,
            carbs: dayData.dinner.carbs,
            fat: dayData.dinner.fat
          },
          instructions: `Prepared according to ${templateId} template guidelines`
        },
        dailyTotals: {
          calories: dayData.breakfast.calories + dayData.lunch.calories + dayData.dinner.calories,
          protein: dayData.breakfast.protein + dayData.lunch.protein + dayData.dinner.protein,
          carbs: dayData.breakfast.carbs + dayData.lunch.carbs + dayData.dinner.carbs,
          fat: dayData.breakfast.fat + dayData.lunch.fat + dayData.dinner.fat
        }
      };
    });

    setWeeklyPlan(weekPlan);
    setShowWeeklyPlan(true);
    
    toast({
      title: "Template Applied",
      description: `Your ${templateId} meal plan is ready!`,
    });
  };

  const handleCustomize = () => {
    setShowCustomization(true);
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
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold gradient-text">{t('nutrition.title')}</h1>
            <ScienceBackedIcon className="h-6 w-6" />
          </div>
          <p className="text-muted-foreground text-center">
            {t('nutrition.description')}
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 max-w-3xl mx-auto">
            <p className="text-sm text-blue-800">
              <strong>📚 Educational Information:</strong> This content presents evidence-based nutrition recommendations. 
              It is for educational purposes only and does not constitute medical or dietary advice. 
              Always consult with qualified healthcare or nutrition professionals before making dietary changes.
            </p>
          </div>
        </div>

        {/* Current Preferences Display */}
        {!isLoading && hasPreferences && !isEditing && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    Your Current Preferences
                  </CardTitle>
                  <CardDescription>
                    Your saved nutrition and dietary preferences
                  </CardDescription>
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
                {weight && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground">Weight</div>
                    <div className="font-semibold">{weight} kg</div>
                  </div>
                )}
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-sm text-muted-foreground">Activity Level</div>
                  <div className="font-semibold capitalize">{activityLevel.replace('-', ' ')}</div>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-sm text-muted-foreground">Goal</div>
                  <div className="font-semibold capitalize">{goal.replace('-', ' ')}</div>
                </div>
                <div className="p-3 bg-background rounded-lg border">
                  <div className="text-sm text-muted-foreground">Recipe Style</div>
                  <div className="font-semibold capitalize">{selectedRecipeStyle}</div>
                </div>
                {allergies.length > 0 && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground">Allergies</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {allergies.map((allergy) => (
                        <Badge key={allergy} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {dislikes.length > 0 && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground">Dislikes</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dislikes.map((dislike) => (
                        <Badge key={dislike} variant="secondary" className="text-xs">
                          {dislike}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {(isLowFODMAP || hasIBS) && (
                  <div className="p-3 bg-background rounded-lg border">
                    <div className="text-sm text-muted-foreground">Dietary Requirements</div>
                    <div className="flex gap-1 mt-1">
                      {isLowFODMAP && (
                        <Badge variant="outline" className="text-xs">Low FODMAP</Badge>
                      )}
                      {hasIBS && (
                        <Badge variant="outline" className="text-xs">IBS Friendly</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Show selected recipes if any */}
              {(selectedBreakfastRecipe || selectedLunchRecipe || selectedDinnerRecipe) && (
                <div className="mt-4 p-3 bg-background rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-2">Selected Recipes</div>
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
            </CardContent>
          </Card>
        )}

        {/* Edit Mode or Initial Setup */}
        {!isLoading && (!hasPreferences || isEditing) && (
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
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-weight">Body Weight (kg)</Label>
                    <Input
                      id="edit-weight"
                      type="number"
                      placeholder="Enter weight in kg"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-activity">Activity Level</Label>
                    <select 
                      id="edit-activity"
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
                    <Label htmlFor="edit-goal">Fitness Goal</Label>
                    <select 
                      id="edit-goal"
                      className="w-full p-2 border rounded-md bg-background"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                    >
                      <option value="weight-loss">Weight Loss</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="muscle-gain">Muscle Gain</option>
                    </select>
                  </div>
                </div>

                {/* Recipe Style */}
                <div>
                  <Label>Recipe Style Preference</Label>
                  <div className="flex gap-4 mt-2">
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

                {/* Dietary Requirements */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-fodmap"
                      checked={isLowFODMAP}
                      onCheckedChange={setIsLowFODMAP}
                    />
                    <Label htmlFor="edit-fodmap">Follow Low-FODMAP diet</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="edit-ibs"
                      checked={hasIBS}
                      onCheckedChange={setHasIBS}
                    />
                    <Label htmlFor="edit-ibs">I have IBS or digestive sensitivities</Label>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <Label>Food Allergies</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {commonAllergies.map((allergy) => (
                      <label key={allergy} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={allergies.includes(allergy)}
                          onChange={() => toggleAllergy(allergy)}
                        />
                        {allergy}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dislikes */}
                <div>
                  <Label>Food Dislikes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {commonDislikes.map((dislike) => (
                      <label key={dislike} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={dislikes.includes(dislike)}
                          onChange={() => toggleDislike(dislike)}
                        />
                        {dislike}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={saveUserPreferences}
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
        )}

        {isLoading && (
          <Card className="mb-6">
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">Loading your preferences...</div>
            </CardContent>
          </Card>
        )}

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
                  <CardDescription>Enter your information for personalised recommendations</CardDescription>
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
                      <option value="maintenance">Maintenance</option>
                      <option value="muscle-gain">Muscle Gain</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Your Targets
                  </CardTitle>
                  <CardDescription>Personalised recommendations based on your profile</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 border rounded-lg bg-primary/5">
                    <div className="text-2xl font-bold text-primary">
                      {proteinNeeds.min}g - {proteinNeeds.max}g
                    </div>
                    <div className="text-sm text-muted-foreground">Daily Protein Target</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 border rounded">
                      <div className="font-bold">{dailyMacros.calories}</div>
                      <div className="text-xs text-muted-foreground">Calories</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-bold">{dailyMacros.carbs}g</div>
                      <div className="text-xs text-muted-foreground">Carbs</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="font-bold">{dailyMacros.fat}g</div>
                      <div className="text-xs text-muted-foreground">Fat</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      <strong>Note:</strong> These targets are calculated based on your activity level and goals. 
                      Aim for the higher end of the protein range for optimal muscle protein synthesis.
                    </div>
                    <div className="pt-2 border-t">
                      <ResearchCitation
                        title="Protein Requirements and Recommendations for Athletes"
                        journal="Journal of Sports Sciences"
                        year={2018}
                        url="https://pubmed.ncbi.nlm.nih.gov/29466096/"
                        doi="10.1080/02640414.2018.1437722"
                        studyType="Review"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="leucine" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Leucine-Rich Foods
                  <ScienceBackedIcon className="h-5 w-5" showTooltip={false} />
                  <ResearchCitation
                    title="The Role of Leucine in Weight Loss Diet and Glucose Homeostasis"
                    journal="Frontiers in Pharmacology"
                    year={2016}
                    url="https://pubmed.ncbi.nlm.nih.gov/27242532/"
                    doi="10.3389/fphar.2016.00144"
                    studyType="Review"
                  />
                </CardTitle>
                <CardDescription>
                  Leucine is a key amino acid that triggers muscle protein synthesis. Aim for 2.5-3g per meal.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {leucineRichFoods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{food.name}</h3>
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
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h4>
                  <p className="text-sm text-blue-800 mb-3">
                    To maximize muscle protein synthesis, consume leucine-rich foods within 2 hours after resistance training. 
                    Combining different protein sources can help you reach the optimal leucine threshold.
                  </p>
                  <div className="border-t border-blue-300 pt-2">
                    <ResearchCitation
                      title="Nutrient Timing Revisited: Is There a Post-Exercise Anabolic Window?"
                      journal="Journal of the International Society of Sports Nutrition"
                      year={2013}
                      url="https://pubmed.ncbi.nlm.nih.gov/23360586/"
                      doi="10.1186/1550-2783-10-5"
                      studyType="Review"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="fodmap" className="mt-6">
              <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold">FODMAP Guide</h2>
                    <ScienceBackedIcon className="h-5 w-5" showTooltip={false} />
                    <ResearchCitation
                      title="A Diet Low in FODMAPs Reduces Symptoms of Irritable Bowel Syndrome"
                      journal="Gastroenterology"
                      year={2014}
                      url="https://pubmed.ncbi.nlm.nih.gov/24076059/"
                      doi="10.1053/j.gastro.2013.09.046"
                      studyType="RCT"
                    />
                  </div>
                  <p className="text-muted-foreground">
                    Foods to include and avoid for digestive comfort
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="fodmap-toggle"
                    checked={isLowFODMAP}
                    onCheckedChange={setIsLowFODMAP}
                  />
                  <Label htmlFor="fodmap-toggle">Follow Low-FODMAP diet</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ibs-toggle"
                  checked={hasIBS}
                  onCheckedChange={setHasIBS}
                />
                <Label htmlFor="ibs-toggle">I have IBS or digestive sensitivities</Label>
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
                {/* Template Selector - shown first */}
                {!showCustomization && (
                  <TemplateSelector
                    onSelectTemplate={handleSelectTemplate}
                    onCustomize={handleCustomize}
                  />
                )}

                {/* Customization UI - shown after user clicks customize */}
                {showCustomization && (
                  <>
                    {/* Sample Daily Preview */}
                    <SampleDailyPreview 
                      onCustomize={() => {
                        // Scroll to recipe selection
                        const element = document.getElementById('recipe-selection');
                        element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }}
                    />

                    {/* Recipe Category Selection */}
                    <div id="recipe-selection" className="mb-6">
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
                    <h4 className="text-lg font-semibold mb-3 gradient-text">🌅 Breakfast Options</h4>
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
                    <h4 className="text-lg font-semibold mb-3 gradient-text">🍽️ Lunch Options</h4>
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
                    <h4 className="text-lg font-semibold mb-3 gradient-text">🌙 Dinner Options</h4>
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
                  <div className="mt-6 p-4 bg-primary/20 border-2 border-primary rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      ✓ Your Selected Recipe Preferences
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      These recipes will be used when generating your weekly meal plan. Click "Generate Weekly Plan" below to create your personalised 7-day plan.
                    </p>
                    <div className="grid gap-2 text-sm bg-background/50 p-3 rounded">
                      {selectedBreakfastRecipe && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌅</span>
                          <span className="font-medium">Breakfast:</span> {selectedBreakfastRecipe}
                        </div>
                      )}
                      {selectedLunchRecipe && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">☀️</span>
                          <span className="font-medium">Lunch:</span> {selectedLunchRecipe}
                        </div>
                      )}
                      {selectedDinnerRecipe && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">🌙</span>
                          <span className="font-medium">Dinner:</span> {selectedDinnerRecipe}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 flex gap-4">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          onClick={() => generateWeeklyPlan(false)}
                          size="lg"
                          className="flex items-center gap-2"
                        >
                          <Sparkles className="h-5 w-5" />
                          Generate 7-Day Personalized Plan
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p className="font-semibold mb-1">Creates 7 unique days with variety</p>
                        <p className="text-xs">Each day will feature different ingredient combinations while respecting your recipe preferences and dietary requirements</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <Button variant="outline">
                    Shopping List
                  </Button>
                </div>
                
                {showWeeklyPlan && weeklyPlan && (
                  <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">Your Personalised 7-Day Meal Plan</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateWeeklyPlan(true)}
                          className="flex items-center gap-2"
                        >
                          <Repeat className="h-4 w-4" />
                          Same Plan
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => generateWeeklyPlan(false)}
                          className="flex items-center gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          New Variety
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={printWeeklyPlan}
                        >
                          🖨️ Print Plan
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={printShoppingList}
                        >
                          📋 Print Shopping List
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={printLongevityBenefits}
                        >
                          🧬 Longevity Benefits
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setShowWeeklyPlan(false)}
                        >
                          Hide Plan
                        </Button>
                      </div>
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
                    
                    <div id="weekly-plan-print" className="space-y-6">
                      {weeklyPlan.map((dayPlan: any, index: number) => (
                        <Card key={index} className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 shadow-md hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-primary/20">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-10 bg-primary rounded-full" />
                                <h4 className="text-2xl font-bold text-foreground">{dayPlan.day}</h4>
                              </div>
                              <div className="text-right text-sm bg-secondary/30 px-4 py-2 rounded-lg">
                                <div className="font-semibold text-foreground">Daily Total:</div>
                                <div className="text-muted-foreground">{dayPlan.dailyTotals.calories} cal | {dayPlan.dailyTotals.protein}p | {dayPlan.dailyTotals.carbs}c | {dayPlan.dailyTotals.fat}f</div>
                              </div>
                            </div>
                            
                            <div className="grid gap-4">
                              {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                const meal = dayPlan[mealType];
                                const mealColors = {
                                  breakfast: 'bg-primary/10 border-primary/40 hover:bg-primary/15',
                                  lunch: 'bg-secondary/20 border-secondary/50 hover:bg-secondary/25',
                                  dinner: 'bg-accent/30 border-accent-foreground/20 hover:bg-accent/35'
                                };
                                return (
                                  <div key={mealType} className={`border-2 rounded-lg p-4 transition-colors ${mealColors[mealType as keyof typeof mealColors]}`}>
                                    <div className="mb-3">
                                      {/* Meal Type Header */}
                                      <div className="flex items-center gap-2 mb-3">
                                        <span className="text-lg">
                                          {mealType === 'breakfast' && '🌅'}
                                          {mealType === 'lunch' && '☀️'}
                                          {mealType === 'dinner' && '🌙'}
                                        </span>
                                        <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                          {mealType}
                                        </span>
                                      </div>
                                       <div className="flex items-center justify-between mb-2">
                                         <div>
                                            <Dialog>
                                              <DialogTrigger asChild>
                                <button 
                                                  className="font-bold text-xl text-foreground bg-primary px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-left shadow-sm"
                                                  onClick={() => {
                                                    // Generate recipe from actual meal foods
                                                    const mealFoods = meal.foods.map((f: any) => `${f.amount} ${f.name}`);
                                                    const mealName = meal.recipeName || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`;
                                                    
                                                    // Generate cooking instructions based on the foods in this meal
                                                    const steps: string[] = [];
                                                    const hasEggs = meal.foods.some((f: any) => f.name === 'Eggs');
                                                    const hasYogurt = meal.foods.some((f: any) => f.name === 'Greek Yogurt' || f.name === 'Cottage Cheese');
                                                    const hasOats = meal.foods.some((f: any) => f.name === 'Oats');
                                                    const hasProtein = meal.foods.some((f: any) => ['Chicken Breast', 'Salmon', 'Tofu'].includes(f.name));
                                                    const hasRice = meal.foods.some((f: any) => ['Brown Rice', 'Quinoa'].includes(f.name));
                                                    const hasVeg = meal.foods.some((f: any) => ['Spinach', 'Broccoli', 'Carrots'].includes(f.name));
                                                    
                                                     if (mealType === 'breakfast') {
                                                       if (hasEggs) {
                                                         steps.push(
                                                           "Heat a non-stick pan over medium-low heat with a small amount of butter or oil",
                                                           "Crack eggs into a bowl and whisk with a pinch of salt and pepper",
                                                           "Pour eggs into pan and gently stir with a spatula as they cook until just set (2-3 minutes)",
                                                           "Remove from heat while still slightly soft - they'll continue cooking"
                                                         );
                                                         if (hasOats) {
                                                           steps.push("Meanwhile, cook oats: combine oats with double the amount of water, simmer 5-7 minutes until creamy");
                                                         }
                                                         if (meal.foods.some((f: any) => f.name === 'Quinoa')) {
                                                           steps.push("Cook quinoa: rinse well, then simmer in water (1:2 ratio) for 12-15 minutes until fluffy");
                                                         }
                                                       } else if (hasYogurt) {
                                                         steps.push(
                                                           "Place yogurt or cottage cheese in a serving bowl"
                                                         );
                                                         if (hasOats) {
                                                           steps.push("Stir in oats (can be served cold as overnight oats or warmed if preferred)");
                                                         }
                                                         if (meal.foods.some((f: any) => f.name === 'Quinoa')) {
                                                           steps.push("Mix in cooked quinoa for added protein and texture");
                                                         }
                                                         if (meal.foods.some((f: any) => f.name === 'Almonds')) {
                                                           steps.push("Top with sliced almonds for healthy fats and crunch");
                                                         }
                                                         if (meal.foods.some((f: any) => f.name === 'Avocado')) {
                                                           steps.push("Add sliced avocado for creamy texture and healthy fats");
                                                         }
                                                         steps.push("Add fresh berries or fruit if available, drizzle with honey if desired");
                                                       }
                                                       steps.push("Serve immediately and enjoy!");
                                                    } else if (hasProtein) {
                                                      const proteinFood = meal.foods.find((f: any) => ['Chicken Breast', 'Salmon', 'Tofu'].includes(f.name));
                                                      steps.push(`Season ${proteinFood.name.toLowerCase()} with salt, pepper, and your choice of herbs or spices`);
                                                      
                                                      if (proteinFood.name === 'Salmon' || proteinFood.name === 'Chicken Breast') {
                                                        steps.push(`Heat a pan or grill to medium-high heat with a small amount of oil`);
                                                        steps.push(`Cook ${proteinFood.name.toLowerCase()} for 4-6 minutes per side until cooked through`);
                                                      } else if (proteinFood.name === 'Tofu') {
                                                        steps.push("Press tofu to remove excess water, then cut into cubes");
                                                        steps.push("Pan-fry tofu in oil over medium-high heat until golden on all sides (8-10 minutes)");
                                                      }
                                                      
                                                      if (hasRice) {
                                                        const grain = meal.foods.find((f: any) => ['Brown Rice', 'Quinoa'].includes(f.name));
                                                        steps.push(`Cook ${grain.name.toLowerCase()} according to package instructions (usually 1 cup grain to 2 cups water)`);
                                                      }
                                                      
                                                      if (hasVeg) {
                                                        const veggies = meal.foods.filter((f: any) => ['Spinach', 'Broccoli', 'Carrots'].includes(f.name)).map((f: any) => f.name.toLowerCase()).join(', ');
                                                        steps.push(`Steam or lightly sauté ${veggies} until tender (3-5 minutes for spinach, 5-7 for broccoli/carrots)`);
                                                      }
                                                      
                                                      steps.push("Arrange all components on a plate and serve hot");
                                                    } else {
                                                      steps.push("Gather all ingredients listed above");
                                                      steps.push("Prepare ingredients by washing and chopping as needed");
                                                      steps.push("Cook using healthy methods: steaming, grilling, or light sautéing");
                                                      steps.push("Season with herbs and spices for flavour");
                                                      steps.push("Serve fresh and enjoy");
                                                    }
                                                    
                                                    setSelectedRecipe({
                                                      name: mealName,
                                                      ingredients: mealFoods,
                                                      steps: steps
                                                    });
                                                  }}
                                                >
                                                  {meal.recipeName || `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}`}
                                                </button>
                                              </DialogTrigger>
                                              <DialogContent className="max-w-md">
                                                <DialogHeader>
                                                  <DialogTitle className="gradient-text text-left">
                                                    {selectedRecipe?.name || 'Recipe'}
                                                  </DialogTitle>
                                                </DialogHeader>
                                                <div className="space-y-4">
                                                  <div>
                                                    <h4 className="font-semibold text-primary mb-2">{t('nutrition.ingredients')}:</h4>
                                                    <ul className="space-y-1">
                                                      {selectedRecipe?.ingredients?.map((ingredient: string, idx: number) => (
                                                        <li key={idx} className="text-sm flex items-center gap-2">
                                                          <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0"></span>
                                                          {ingredient}
                                                        </li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                  <div>
                                                    <h4 className="font-semibold text-primary mb-2">{t('nutrition.instructions')}:</h4>
                                                    <ol className="space-y-2">
                                                      {selectedRecipe?.steps?.map((step: string, idx: number) => (
                                                        <li key={idx} className="text-sm flex gap-3">
                                                          <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5">
                                                            {idx + 1}
                                                          </span>
                                                          {step}
                                                        </li>
                                                      ))}
                                                    </ol>
                                                  </div>
                                                </div>
                                              </DialogContent>
                                            </Dialog>
                                           {meal.recipeDescription && (
                                             <p className="text-sm text-muted-foreground italic">{meal.recipeDescription}</p>
                                           )}
                                         </div>
                                        <div className="text-sm font-medium text-right">
                                          {meal.totals.calories} cal | {meal.totals.protein}p | {meal.totals.carbs}c | {meal.totals.fat}f
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="flex flex-wrap gap-2 justify-center">
                                      {meal.foods.map((food: any, foodIndex: number) => {
                                        const foodCalories = Math.round(food.nutrition.calories * (food.amount.includes('tbsp') ? 1 : parseInt(food.amount) / 100));
                                        const foodKj = Math.round(foodCalories * 4.184);
                                        return (
                                          <div key={foodIndex} className="bg-muted/30 p-2 rounded text-center min-w-[120px]">
                                            <div className="font-medium text-sm mb-1">{food.name}</div>
                                            <div className="text-primary-dark font-bold text-lg">{food.amount}</div>
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
                  </>
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