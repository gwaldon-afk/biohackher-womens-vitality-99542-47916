import { MealPlanTemplate } from "@/components/TemplateCard";

export const mealTemplates: MealPlanTemplate[] = [
  {
    id: "mediterranean",
    name: "Mediterranean Week",
    description: "Heart-healthy meals rich in omega-3s, olive oil & whole grains",
    benefits: [
      "30% reduced cardiovascular risk",
      "High in anti-inflammatory omega-3 fatty acids",
      "Rich in antioxidants & polyphenols",
      "Supports cognitive health & longevity"
    ],
    avgCalories: 1800,
    avgProtein: 120,
    avgCarbs: 180,
    avgFat: 65,
    dietaryTags: ["Heart-Healthy", "Anti-Inflammatory", "Omega-3 Rich"],
    icon: "🌊"
  },
  {
    id: "high-protein",
    name: "High Protein Athlete",
    description: "Optimized for muscle building with 2g protein per kg bodyweight",
    benefits: [
      "25g+ leucine daily for optimal muscle protein synthesis",
      "Enhanced recovery & performance",
      "Supports lean mass development",
      "Sustained energy throughout the day"
    ],
    avgCalories: 2200,
    avgProtein: 180,
    avgCarbs: 200,
    avgFat: 60,
    dietaryTags: ["High Protein", "Muscle Building", "Performance"],
    icon: "💪"
  },
  {
    id: "plant-based",
    name: "Plant-Based Power",
    description: "Complete plant-based nutrition with optimal amino acid profile",
    benefits: [
      "Complete essential amino acids from varied plant sources",
      "High fiber content (40g+) for gut health",
      "Rich in phytonutrients & antioxidants",
      "Environmentally sustainable choices"
    ],
    avgCalories: 1900,
    avgProtein: 110,
    avgCarbs: 220,
    avgFat: 55,
    dietaryTags: ["Plant-Based", "High Fiber", "Sustainable"],
    icon: "🌱"
  },
  {
    id: "low-fodmap",
    name: "Low-FODMAP Gentle",
    description: "IBS-friendly meals to support digestive comfort",
    benefits: [
      "Reduces bloating & digestive discomfort",
      "Suitable for IBS & sensitive digestion",
      "Maintains complete nutritional balance",
      "Gentle on the gut while nourishing"
    ],
    avgCalories: 1750,
    avgProtein: 115,
    avgCarbs: 170,
    avgFat: 60,
    dietaryTags: ["Low-FODMAP", "IBS-Friendly", "Gentle Digestion"],
    icon: "🤲"
  }
];

// Detailed 7-day meal plans for each template
export const templateMealPlans = {
  mediterranean: {
    monday: {
      breakfast: { name: "Greek Yogurt Bowl", description: "Greek yogurt, honey, walnuts, berries", calories: 380, protein: 25, carbs: 42, fat: 12 },
      lunch: { name: "Grilled Fish Plate", description: "Salmon, quinoa, roasted vegetables, olive oil", calories: 620, protein: 48, carbs: 52, fat: 24 },
      dinner: { name: "Mediterranean Chicken", description: "Chicken breast, olives, tomatoes, feta, whole wheat couscous", calories: 580, protein: 52, carbs: 48, fat: 18 }
    },
    tuesday: {
      breakfast: { name: "Avocado Toast", description: "Whole grain bread, avocado, poached eggs, tomatoes", calories: 420, protein: 22, carbs: 38, fat: 20 },
      lunch: { name: "Tuna Nicoise Salad", description: "Tuna, green beans, potatoes, olives, egg", calories: 580, protein: 42, carbs: 48, fat: 22 },
      dinner: { name: "Lamb & Chickpea Stew", description: "Lean lamb, chickpeas, vegetables, spices", calories: 640, protein: 48, carbs: 58, fat: 24 }
    },
    wednesday: {
      breakfast: { name: "Mediterranean Omelette", description: "Eggs, spinach, feta, tomatoes, olives", calories: 360, protein: 28, carbs: 18, fat: 20 },
      lunch: { name: "Sardine Pasta", description: "Whole wheat pasta, sardines, tomatoes, capers", calories: 620, protein: 38, carbs: 72, fat: 18 },
      dinner: { name: "Grilled Prawns", description: "Prawns, lemon, garlic, quinoa, asparagus", calories: 540, protein: 52, carbs: 48, fat: 14 }
    },
    thursday: {
      breakfast: { name: "Fig & Almond Porridge", description: "Oats, almonds, fresh figs, honey", calories: 400, protein: 18, carbs: 58, fat: 14 },
      lunch: { name: "Chicken Souvlaki Bowl", description: "Chicken skewers, tzatziki, rice, salad", calories: 600, protein: 48, carbs: 54, fat: 20 },
      dinner: { name: "Baked White Fish", description: "Sea bass, herbs, potatoes, green beans", calories: 520, protein: 46, carbs: 52, fat: 16 }
    },
    friday: {
      breakfast: { name: "Shakshuka", description: "Eggs in tomato sauce, whole grain bread", calories: 380, protein: 24, carbs: 42, fat: 16 },
      lunch: { name: "Greek Salad with Chicken", description: "Grilled chicken, feta, olives, cucumber, tomatoes", calories: 560, protein: 48, carbs: 32, fat: 28 },
      dinner: { name: "Seafood Paella", description: "Mixed seafood, saffron rice, vegetables", calories: 640, protein: 52, carbs: 68, fat: 18 }
    },
    saturday: {
      breakfast: { name: "Smoked Salmon Bagel", description: "Whole grain bagel, cream cheese, salmon, capers", calories: 440, protein: 28, carbs: 48, fat: 16 },
      lunch: { name: "Falafel Wrap", description: "Chickpea falafel, hummus, vegetables, whole wheat wrap", calories: 580, protein: 24, carbs: 72, fat: 22 },
      dinner: { name: "Herb-Crusted Cod", description: "Cod fillet, herbs, roasted vegetables, wild rice", calories: 560, protein: 48, carbs: 52, fat: 16 }
    },
    sunday: {
      breakfast: { name: "Turkish Menemen", description: "Scrambled eggs, peppers, tomatoes, olives", calories: 360, protein: 22, carbs: 28, fat: 18 },
      lunch: { name: "Moussaka", description: "Eggplant, lean beef, tomatoes, bechamel", calories: 620, protein: 42, carbs: 48, fat: 26 },
      dinner: { name: "Grilled Octopus", description: "Octopus, lemon, olive oil, roasted potatoes, arugula", calories: 540, protein: 52, carbs: 46, fat: 16 }
    }
  },
  "high-protein": {
    monday: {
      breakfast: { name: "Protein Power Oats", description: "Oats, whey protein, peanut butter, banana", calories: 520, protein: 42, carbs: 58, fat: 16 },
      lunch: { name: "Triple Protein Bowl", description: "Chicken, Greek yogurt, quinoa, chickpeas", calories: 680, protein: 62, carbs: 64, fat: 18 },
      dinner: { name: "Steak & Sweet Potato", description: "Lean steak, sweet potato, broccoli", calories: 720, protein: 68, carbs: 62, fat: 20 }
    },
    tuesday: {
      breakfast: { name: "Egg White Scramble", description: "6 egg whites, 2 whole eggs, spinach, turkey bacon", calories: 480, protein: 52, carbs: 12, fat: 22 },
      lunch: { name: "Tuna Protein Plate", description: "Tuna steak, brown rice, edamame, vegetables", calories: 640, protein: 58, carbs: 62, fat: 16 },
      dinner: { name: "Chicken Breast Feast", description: "Double chicken breast, quinoa, asparagus", calories: 700, protein: 72, carbs: 58, fat: 16 }
    },
    wednesday: {
      breakfast: { name: "Cottage Cheese Bowl", description: "Cottage cheese, berries, almonds, honey", calories: 460, protein: 38, carbs: 48, fat: 14 },
      lunch: { name: "Salmon Power Bowl", description: "Salmon, lentils, kale, tahini", calories: 660, protein: 56, carbs: 58, fat: 24 },
      dinner: { name: "Turkey Meatballs", description: "Lean turkey meatballs, whole wheat pasta, marinara", calories: 680, protein: 62, carbs: 68, fat: 18 }
    },
    thursday: {
      breakfast: { name: "Protein Pancakes", description: "Protein powder pancakes, Greek yogurt, berries", calories: 500, protein: 48, carbs: 52, fat: 12 },
      lunch: { name: "Grilled Chicken Caesar", description: "Double chicken, egg, parmesan, whole grain croutons", calories: 620, protein: 68, carbs: 42, fat: 20 },
      dinner: { name: "Beef Stir Fry", description: "Lean beef strips, mixed vegetables, brown rice", calories: 720, protein: 64, carbs: 72, fat: 18 }
    },
    friday: {
      breakfast: { name: "Smoked Salmon Scramble", description: "Eggs, smoked salmon, avocado, whole grain toast", calories: 520, protein: 42, carbs: 38, fat: 22 },
      lunch: { name: "Protein Buddha Bowl", description: "Tempeh, chicken, quinoa, chickpeas, vegetables", calories: 680, protein: 58, carbs: 64, fat: 20 },
      dinner: { name: "Grilled Shrimp Feast", description: "Large prawns, wild rice, zucchini", calories: 640, protein: 72, carbs: 58, fat: 14 }
    },
    saturday: {
      breakfast: { name: "Builder's Breakfast", description: "4 eggs, turkey sausage, beans, toast", calories: 580, protein: 52, carbs: 52, fat: 20 },
      lunch: { name: "Chicken & Chickpea Curry", description: "Chicken, chickpeas, spinach, brown rice", calories: 700, protein: 62, carbs: 68, fat: 20 },
      dinner: { name: "Tuna Steak Dinner", description: "Seared tuna, quinoa, green beans", calories: 660, protein: 68, carbs: 58, fat: 18 }
    },
    sunday: {
      breakfast: { name: "Mega Protein Smoothie Bowl", description: "Protein powder, Greek yogurt, berries, granola, nuts", calories: 540, protein: 48, carbs: 58, fat: 16 },
      lunch: { name: "Lamb Kofta Plate", description: "Lean lamb kofta, couscous, vegetables, yogurt", calories: 680, protein: 58, carbs: 62, fat: 22 },
      dinner: { name: "Chicken & Lentil Feast", description: "Chicken breast, red lentils, spinach, rice", calories: 720, protein: 72, carbs: 68, fat: 16 }
    }
  },
  "plant-based": {
    monday: {
      breakfast: { name: "Tofu Scramble", description: "Tofu, nutritional yeast, vegetables, whole grain toast", calories: 420, protein: 28, carbs: 48, fat: 16 },
      lunch: { name: "Lentil Buddha Bowl", description: "Lentils, quinoa, tahini, roasted vegetables", calories: 580, protein: 32, carbs: 78, fat: 18 },
      dinner: { name: "Chickpea Curry", description: "Chickpeas, coconut milk, spinach, brown rice", calories: 620, protein: 28, carbs: 88, fat: 20 }
    },
    tuesday: {
      breakfast: { name: "Chia Protein Bowl", description: "Chia pudding, plant protein powder, berries, almonds", calories: 440, protein: 32, carbs: 52, fat: 16 },
      lunch: { name: "Black Bean Burrito Bowl", description: "Black beans, rice, avocado, salsa, corn", calories: 600, protein: 26, carbs: 92, fat: 18 },
      dinner: { name: "Tempeh Stir Fry", description: "Tempeh, mixed vegetables, cashews, brown rice", calories: 640, protein: 34, carbs: 82, fat: 20 }
    },
    wednesday: {
      breakfast: { name: "Peanut Butter Oatmeal", description: "Oats, peanut butter, banana, hemp seeds", calories: 460, protein: 22, carbs: 68, fat: 16 },
      lunch: { name: "Falafel Plate", description: "Falafel, hummus, quinoa tabbouleh, vegetables", calories: 620, protein: 28, carbs: 84, fat: 22 },
      dinner: { name: "Seitan & Mushroom Stew", description: "Seitan, mushrooms, potatoes, vegetables", calories: 580, protein: 42, carbs: 72, fat: 14 }
    },
    thursday: {
      breakfast: { name: "Green Smoothie Bowl", description: "Spinach, banana, plant protein, granola, seeds", calories: 440, protein: 28, carbs: 62, fat: 14 },
      lunch: { name: "Quinoa Power Salad", description: "Quinoa, edamame, chickpeas, vegetables, tahini", calories: 600, protein: 32, carbs: 76, fat: 20 },
      dinner: { name: "Lentil Bolognese", description: "Red lentils, whole wheat pasta, tomato sauce", calories: 640, protein: 32, carbs: 98, fat: 16 }
    },
    friday: {
      breakfast: { name: "Almond Butter Toast", description: "Whole grain bread, almond butter, chia seeds, banana", calories: 420, protein: 18, carbs: 58, fat: 16 },
      lunch: { name: "Bean & Rice Bowl", description: "Mixed beans, brown rice, avocado, salsa", calories: 620, protein: 28, carbs: 92, fat: 18 },
      dinner: { name: "Tofu Pad Thai", description: "Tofu, rice noodles, peanuts, vegetables", calories: 660, protein: 32, carbs: 88, fat: 22 }
    },
    saturday: {
      breakfast: { name: "Protein Pancakes", description: "Plant protein pancakes, berries, maple syrup", calories: 480, protein: 28, carbs: 72, fat: 12 },
      lunch: { name: "Chickpea Salad Sandwich", description: "Mashed chickpeas, vegetables, whole grain bread", calories: 560, protein: 24, carbs: 82, fat: 18 },
      dinner: { name: "Mushroom Stroganoff", description: "Mushrooms, cashew cream, pasta, vegetables", calories: 640, protein: 28, carbs: 92, fat: 20 }
    },
    sunday: {
      breakfast: { name: "Açai Bowl", description: "Açai, plant protein, granola, fruits, coconut", calories: 460, protein: 24, carbs: 68, fat: 16 },
      lunch: { name: "Three Bean Chili", description: "Mixed beans, tomatoes, quinoa, avocado", calories: 600, protein: 32, carbs: 88, fat: 16 },
      dinner: { name: "Seitan Stir Fry", description: "Seitan, vegetables, peanut sauce, rice noodles", calories: 640, protein: 38, carbs: 82, fat: 18 }
    }
  },
  "low-fodmap": {
    monday: {
      breakfast: { name: "Rice Porridge Bowl", description: "Rice porridge, lactose-free yogurt, blueberries, walnuts", calories: 380, protein: 22, carbs: 52, fat: 14 },
      lunch: { name: "Grilled Chicken & Rice", description: "Chicken breast, white rice, carrots, green beans", calories: 580, protein: 48, carbs: 58, fat: 16 },
      dinner: { name: "Salmon with Potatoes", description: "Salmon, roasted potatoes, zucchini, olive oil", calories: 620, protein: 46, carbs: 52, fat: 24 }
    },
    tuesday: {
      breakfast: { name: "Scrambled Eggs & Toast", description: "Eggs, gluten-free toast, spinach, tomatoes", calories: 360, protein: 24, carbs: 38, fat: 16 },
      lunch: { name: "Turkey & Rice Bowl", description: "Turkey breast, brown rice, cucumber, carrots", calories: 560, protein: 42, carbs: 62, fat: 14 },
      dinner: { name: "Baked Cod", description: "Cod fillet, quinoa, green beans, lemon", calories: 540, protein: 48, carbs: 52, fat: 14 }
    },
    wednesday: {
      breakfast: { name: "Omelette with Veggies", description: "Eggs, spinach, bell peppers, lactose-free cheese", calories: 380, protein: 28, carbs: 18, fat: 22 },
      lunch: { name: "Chicken Noodle Bowl", description: "Chicken, rice noodles, bok choy, carrots", calories: 600, protein: 44, carbs: 68, fat: 16 },
      dinner: { name: "Beef & Vegetable Stir Fry", description: "Lean beef, carrots, peppers, rice", calories: 640, protein: 48, carbs: 62, fat: 20 }
    },
    thursday: {
      breakfast: { name: "Smoothie Bowl", description: "Banana, lactose-free protein powder, berries, seeds", calories: 420, protein: 32, carbs: 58, fat: 12 },
      lunch: { name: "Tuna Rice Salad", description: "Tuna, white rice, cucumber, carrots, olive oil", calories: 580, protein: 42, carbs: 62, fat: 18 },
      dinner: { name: "Chicken & Quinoa", description: "Grilled chicken, quinoa, zucchini, tomatoes", calories: 600, protein: 52, carbs: 54, fat: 16 }
    },
    friday: {
      breakfast: { name: "Gluten-Free Pancakes", description: "GF pancakes, maple syrup, blueberries", calories: 400, protein: 18, carbs: 68, fat: 10 },
      lunch: { name: "Salmon Sushi Bowl", description: "Salmon, sushi rice, cucumber, avocado", calories: 620, protein: 38, carbs: 72, fat: 20 },
      dinner: { name: "Turkey Meatballs", description: "Turkey meatballs, rice pasta, tomato sauce", calories: 640, protein: 46, carbs: 74, fat: 18 }
    },
    saturday: {
      breakfast: { name: "Eggs Benedict (Modified)", description: "Poached eggs, GF bread, spinach, lactose-free hollandaise", calories: 440, protein: 28, carbs: 42, fat: 20 },
      lunch: { name: "Chicken & Potato Salad", description: "Chicken, potatoes, green beans, olive oil dressing", calories: 600, protein: 44, carbs: 58, fat: 20 },
      dinner: { name: "Grilled Prawns", description: "Prawns, rice, carrots, bok choy", calories: 560, protein: 52, carbs: 62, fat: 14 }
    },
    sunday: {
      breakfast: { name: "Chia Seed Pudding", description: "Chia seeds, lactose-free milk, berries, almonds", calories: 380, protein: 20, carbs: 48, fat: 16 },
      lunch: { name: "Beef & Rice Bowl", description: "Lean beef, brown rice, carrots, green beans", calories: 640, protein: 46, carbs: 68, fat: 20 },
      dinner: { name: "Baked Chicken", description: "Herb chicken, roasted potatoes, zucchini", calories: 600, protein: 48, carbs: 58, fat: 18 }
    }
  }
};
