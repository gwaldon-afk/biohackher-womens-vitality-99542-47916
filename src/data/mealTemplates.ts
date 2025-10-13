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
      breakfast: { name: "Radiant Morning Protein Oats", description: "Creamy oats, premium whey protein, rich almond butter, fresh banana", calories: 520, protein: 42, carbs: 58, fat: 16, ingredients: ["1 cup rolled oats", "1 scoop whey protein", "2 tbsp almond butter", "1 banana", "1 cup almond milk"], instructions: "Cook oats in almond milk, stir in protein powder, top with almond butter and sliced banana" },
      lunch: { name: "Goddess Glow Bowl", description: "Tender grilled chicken, creamy Greek yogurt, fluffy quinoa, protein-rich chickpeas", calories: 680, protein: 62, carbs: 64, fat: 18, ingredients: ["200g grilled chicken breast", "1 cup Greek yogurt", "1 cup cooked quinoa", "1 cup chickpeas", "Mixed greens", "Lemon dressing"], instructions: "Arrange quinoa as base, top with sliced chicken, add chickpeas and greens, dollop yogurt, drizzle lemon dressing" },
      dinner: { name: "Nourish & Strengthen Steak Dinner", description: "Succulent lean steak, caramelized sweet potato, tender broccoli florets", calories: 720, protein: 68, carbs: 62, fat: 20, ingredients: ["250g lean steak", "1 large sweet potato", "2 cups broccoli", "Olive oil", "Garlic", "Herbs"], instructions: "Season and grill steak to preference, roast cubed sweet potato with olive oil, steam broccoli with garlic" }
    },
    tuesday: {
      breakfast: { name: "Cloud-Light Egg White Scramble", description: "Fluffy egg whites, whole eggs, fresh spinach, savory turkey bacon", calories: 480, protein: 52, carbs: 12, fat: 22, ingredients: ["6 egg whites", "2 whole eggs", "2 cups spinach", "4 strips turkey bacon", "Salt & pepper"], instructions: "Whisk eggs with salt and pepper, cook turkey bacon until crisp, sauté spinach, scramble eggs until fluffy" },
      lunch: { name: "Ocean's Bounty Tuna Bowl", description: "Premium tuna steak, nutty brown rice, protein-packed edamame, crisp vegetables", calories: 640, protein: 58, carbs: 62, fat: 16, ingredients: ["200g tuna steak", "1 cup brown rice", "1 cup edamame", "Mixed vegetables", "Soy glaze"], instructions: "Cook rice, sear tuna for 2 min per side, steam edamame, arrange bowl and drizzle with soy glaze" },
      dinner: { name: "Herbed Garden Chicken", description: "Two tender chicken breasts, aromatic quinoa, grilled asparagus spears", calories: 700, protein: 72, carbs: 58, fat: 16, ingredients: ["2 chicken breasts (300g)", "1 cup quinoa", "1 bunch asparagus", "Fresh herbs", "Lemon"], instructions: "Season chicken with herbs and grill 6-7 min per side, cook quinoa in broth, grill asparagus with lemon" }
    },
    wednesday: {
      breakfast: { name: "Berry Bliss Cottage Bowl", description: "Rich cottage cheese, fresh mixed berries, crunchy almonds, golden honey drizzle", calories: 460, protein: 38, carbs: 48, fat: 14, ingredients: ["1.5 cups cottage cheese", "1 cup mixed berries", "1/4 cup sliced almonds", "2 tbsp honey", "Mint leaves"], instructions: "Layer cottage cheese in bowl, top with fresh berries, sprinkle almonds, drizzle honey, garnish mint" },
      lunch: { name: "Omega Glow Salmon Bowl", description: "Wild salmon, hearty lentils, nutrient-dense kale, creamy tahini", calories: 660, protein: 56, carbs: 58, fat: 24, ingredients: ["200g salmon fillet", "1 cup cooked lentils", "2 cups kale", "3 tbsp tahini", "Lemon juice"], instructions: "Bake salmon with herbs 12-15 min, massage kale with lemon, arrange lentils and kale, top with salmon and tahini drizzle" },
      dinner: { name: "Bella Italia Turkey Meatballs", description: "Lean turkey meatballs, whole wheat pasta, rich marinara sauce", calories: 680, protein: 62, carbs: 68, fat: 18, ingredients: ["500g ground turkey", "2 cups whole wheat pasta", "2 cups marinara", "Italian herbs", "Parmesan"], instructions: "Form turkey into meatballs with herbs, bake 20 min at 200°C, cook pasta al dente, simmer in marinara, serve topped with parmesan" }
    },
    thursday: {
      breakfast: { name: "Fluffy Dream Pancake Stack", description: "Light protein pancakes, tangy Greek yogurt, fresh berry medley", calories: 500, protein: 48, carbs: 52, fat: 12, ingredients: ["1 cup oat flour", "2 scoops protein powder", "2 eggs", "1 cup Greek yogurt", "1 cup berries", "Maple syrup"], instructions: "Mix flour, protein powder, and eggs into batter, cook pancakes on griddle until golden, stack and top with yogurt, berries, and syrup" },
      lunch: { name: "Vibrant Caesar Chicken Salad", description: "Generous grilled chicken, soft-boiled egg, aged parmesan, toasted croutons", calories: 620, protein: 68, carbs: 42, fat: 20, ingredients: ["300g chicken breast", "2 eggs", "Romaine lettuce", "1/2 cup parmesan", "Whole grain croutons", "Caesar dressing"], instructions: "Grill seasoned chicken and slice, boil eggs 7 min and halve, toss lettuce with dressing, top with chicken, eggs, parmesan, croutons" },
      dinner: { name: "Asian Harmony Stir Fry", description: "Tender beef strips, colorful mixed vegetables, aromatic brown rice", calories: 720, protein: 64, carbs: 72, fat: 18, ingredients: ["250g lean beef strips", "3 cups mixed vegetables", "1.5 cups brown rice", "Soy sauce", "Ginger", "Garlic"], instructions: "Cook rice, stir fry beef on high heat 2-3 min, add vegetables and cook until tender-crisp, season with soy, ginger, garlic, serve over rice" }
    },
    friday: {
      breakfast: { name: "Luxe Smoked Salmon Morning", description: "Premium smoked salmon, creamy scrambled eggs, ripe avocado, artisan toast", calories: 520, protein: 42, carbs: 38, fat: 22, ingredients: ["3 eggs", "100g smoked salmon", "1/2 avocado", "2 slices whole grain bread", "Chives", "Black pepper"], instructions: "Toast bread until golden, scramble eggs gently over low heat, top toast with sliced avocado, add eggs and salmon, garnish with chives" },
      lunch: { name: "Rainbow Wellness Bowl", description: "Marinated tempeh, grilled chicken, ancient grain quinoa, chickpeas, rainbow veggies", calories: 680, protein: 58, carbs: 64, fat: 20, ingredients: ["150g tempeh", "150g chicken", "1 cup quinoa", "1 cup chickpeas", "Mixed vegetables", "Tahini dressing"], instructions: "Marinate and pan-fry tempeh, grill chicken, cook quinoa, arrange all ingredients in bowl, drizzle with tahini dressing" },
      dinner: { name: "Elegant Garlic Shrimp", description: "Jumbo grilled prawns, nutty wild rice, tender zucchini ribbons", calories: 640, protein: 72, carbs: 58, fat: 14, ingredients: ["400g large prawns", "1.5 cups wild rice", "2 large zucchini", "Garlic butter", "Lemon", "Herbs"], instructions: "Cook wild rice, toss prawns in garlic butter and grill 2-3 min per side, spiralize zucchini and sauté lightly, serve with lemon wedges" }
    },
    saturday: {
      breakfast: { name: "Energize Breakfast Plate", description: "Farm-fresh eggs, savory turkey sausage, hearty beans, toasted multigrain", calories: 580, protein: 52, carbs: 52, fat: 20, ingredients: ["4 eggs", "3 turkey sausages", "1 cup baked beans", "2 slices multigrain bread", "Tomatoes"], instructions: "Grill sausages until browned, fry or scramble eggs, warm beans, toast bread, grill tomatoes, arrange on plate" },
      lunch: { name: "Spiced Wellness Chicken Curry", description: "Tender chicken pieces, protein-rich chickpeas, wilted spinach, fragrant rice", calories: 700, protein: 62, carbs: 68, fat: 20, ingredients: ["300g chicken breast", "1.5 cups chickpeas", "2 cups spinach", "1.5 cups brown rice", "Curry spices", "Coconut milk"], instructions: "Cook rice, sauté curry spices, add chicken and brown, stir in chickpeas and coconut milk, simmer 15 min, add spinach until wilted" },
      dinner: { name: "Seared Tuna Perfection", description: "Perfectly seared tuna, fluffy quinoa, crisp-tender green beans", calories: 660, protein: 68, carbs: 58, fat: 18, ingredients: ["250g tuna steak", "1.5 cups quinoa", "2 cups green beans", "Sesame seeds", "Soy glaze"], instructions: "Cook quinoa, sear tuna 1-2 min per side for rare, steam green beans, arrange plate and drizzle with soy glaze, sprinkle sesame" }
    },
    sunday: {
      breakfast: { name: "Beauty Boost Smoothie Bowl", description: "Premium protein blend, thick Greek yogurt, vibrant berries, crunchy granola, mixed nuts", calories: 540, protein: 48, carbs: 58, fat: 16, ingredients: ["2 scoops protein powder", "1 cup Greek yogurt", "1 cup frozen berries", "1/4 cup granola", "2 tbsp mixed nuts", "1 banana", "Almond milk"], instructions: "Blend protein powder, yogurt, berries, banana with almond milk until thick, pour into bowl, top with granola and nuts" },
      lunch: { name: "Mediterranean Kofta Delight", description: "Spiced lean lamb kofta, fluffy couscous, roasted vegetables, tangy yogurt", calories: 680, protein: 58, carbs: 62, fat: 22, ingredients: ["300g lean lamb mince", "1.5 cups couscous", "Mixed vegetables", "1/2 cup yogurt", "Middle Eastern spices", "Fresh herbs"], instructions: "Mix lamb with spices and form into kofta, grill or bake 12-15 min, prepare couscous, roast vegetables, serve with yogurt sauce" },
      dinner: { name: "Nourish & Thrive Lentil Bowl", description: "Succulent chicken breast, protein-packed red lentils, fresh spinach, aromatic rice", calories: 720, protein: 72, carbs: 68, fat: 16, ingredients: ["300g chicken breast", "1.5 cups red lentils", "3 cups spinach", "1.5 cups rice", "Garlic", "Spices"], instructions: "Cook rice and lentils separately, grill seasoned chicken and slice, sauté spinach with garlic, combine all in bowl with warming spices" }
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
