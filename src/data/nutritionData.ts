// Food database and nutrition-related data

export const foodDatabase = {
  proteins: {
    "Chicken Breast": { protein: 31, carbs: 0, fat: 3.6, calories: 165, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
    "Salmon": { protein: 25, carbs: 0, fat: 13, calories: 208, fiber: 0, serving: "100g", category: "protein", fodmap: "low" },
    "Eggs": { protein: 6, carbs: 0.6, fat: 5, calories: 72, fiber: 0, serving: "1 egg", category: "protein", fodmap: "low" },
    "Greek Yogurt": { protein: 10, carbs: 3.6, fat: 0.4, calories: 59, fiber: 0, serving: "100g", category: "protein", fodmap: "high" },
    "Tofu": { protein: 8, carbs: 1.9, fat: 4.8, calories: 76, fiber: 0.3, serving: "100g", category: "protein", fodmap: "low" },
    "Cottage Cheese": { protein: 11, carbs: 3.4, fat: 4.3, calories: 98, fiber: 0, serving: "100g", category: "protein", fodmap: "high" }
  },
  carbs: {
    "Brown Rice": { protein: 2.6, carbs: 23, fat: 0.9, calories: 111, fiber: 1.8, serving: "100g cooked", category: "carbs", fodmap: "low" },
    "Quinoa": { protein: 4.4, carbs: 21, fat: 1.9, calories: 120, fiber: 2.8, serving: "100g cooked", category: "carbs", fodmap: "low" },
    "Sweet Potato": { protein: 2, carbs: 20, fat: 0.2, calories: 90, fiber: 3, serving: "100g", category: "carbs", fodmap: "high" },
    "Oats": { protein: 13, carbs: 67, fat: 7, calories: 389, fiber: 10, serving: "100g", category: "carbs", fodmap: "high" }
  },
  vegetables: {
    "Broccoli": { protein: 2.8, carbs: 6.6, fat: 0.4, calories: 34, fiber: 2.6, serving: "100g", category: "vegetables", fodmap: "high" },
    "Spinach": { protein: 2.9, carbs: 3.6, fat: 0.4, calories: 23, fiber: 2.2, serving: "100g", category: "vegetables", fodmap: "low" },
    "Carrots": { protein: 0.9, carbs: 9.6, fat: 0.2, calories: 41, fiber: 2.8, serving: "100g", category: "vegetables", fodmap: "low" }
  },
  fats: {
    "Avocado": { protein: 2, carbs: 9, fat: 15, calories: 160, fiber: 7, serving: "100g", category: "fat", fodmap: "moderate" },
    "Almonds": { protein: 21, carbs: 22, fat: 50, calories: 579, fiber: 12, serving: "100g", category: "fat", fodmap: "high" },
    "Walnuts": { protein: 15, carbs: 14, fat: 65, calories: 654, fiber: 6.7, serving: "100g", category: "fat", fodmap: "moderate" },
    "Chia Seeds": { protein: 17, carbs: 42, fat: 31, calories: 486, fiber: 34, serving: "100g", category: "fat", fodmap: "low" },
    "Flax Seeds": { protein: 18, carbs: 29, fat: 42, calories: 534, fiber: 27, serving: "100g", category: "fat", fodmap: "low" },
    "Tahini": { protein: 17, carbs: 21, fat: 54, calories: 595, fiber: 9.3, serving: "100g", category: "fat", fodmap: "low" },
    "Olive Oil": { protein: 0, carbs: 0, fat: 14, calories: 119, fiber: 0, serving: "1 tbsp", category: "fat", fodmap: "low" },
    "Cashews": { protein: 18, carbs: 33, fat: 44, calories: 553, fiber: 3.3, serving: "100g", category: "fat", fodmap: "high" },
    "Peanut Butter": { protein: 25, carbs: 20, fat: 50, calories: 588, fiber: 6, serving: "100g", category: "fat", fodmap: "moderate" }
  }
};

export const foodLongevityBenefits = {
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

export const leucineRichFoods = [
  { name: "Chicken Breast (100g)", protein: 31, leucine: 2.5, score: "Excellent" },
  { name: "Salmon (100g)", protein: 25, leucine: 2.0, score: "Excellent" },
  { name: "Greek Yogurt (170g)", protein: 17, leucine: 1.8, score: "Good" },
  { name: "Eggs (2 large)", protein: 12, leucine: 1.6, score: "Good" },
  { name: "Cottage Cheese (100g)", protein: 11, leucine: 1.4, score: "Good" },
  { name: "Tofu (100g)", protein: 8, leucine: 0.7, score: "Fair" },
  { name: "Quinoa (100g cooked)", protein: 4.4, leucine: 0.3, score: "Fair" }
];

export const fodmapFoods = {
  low: [
    "Chicken, Fish, Eggs", "Lactose-free dairy", "Rice, Quinoa", 
    "Spinach, Carrots", "Strawberries, Oranges", "Almonds (small portions)"
  ],
  high: [
    "Wheat, Rye, Barley", "Regular dairy", "Beans, Lentils",
    "Onions, Garlic", "Apples, Pears", "Cashews, Pistachios"
  ]
};

export const recipeCategories = {
  simple: {
    name: "Simple & Quick",
    breakfast: [
      { name: "Scrambled Eggs & Toast", description: "Classic protein-rich breakfast with whole grain toast" },
      { name: "Greek Yogurt Bowl", description: "Creamy yogurt with berries and granola" },
      { name: "Protein Smoothie", description: "Quick blended breakfast with protein powder and fruit" }
    ],
    lunch: [
      { name: "Grilled Chicken Salad", description: "Mixed greens with seasoned chicken breast" },
      { name: "Tuna Rice Bowl", description: "Brown rice with tuna and vegetables" },
      { name: "Turkey Wrap", description: "Whole wheat wrap with turkey and veggies" }
    ],
    dinner: [
      { name: "Baked Salmon & Veg", description: "Oven-roasted salmon with seasonal vegetables" },
      { name: "Chicken Stir-Fry", description: "Quick stir-fry with chicken and mixed vegetables" },
      { name: "Beef & Broccoli", description: "Lean beef with steamed broccoli" }
    ]
  },
  mediterranean: {
    name: "Mediterranean",
    breakfast: [
      { name: "Greek Breakfast Bowl", description: "Feta, olives, tomatoes with whole grain bread" },
      { name: "Shakshuka", description: "Eggs poached in spiced tomato sauce" },
      { name: "Mediterranean Omelet", description: "Eggs with spinach, feta, and herbs" }
    ],
    lunch: [
      { name: "Greek Salad with Chicken", description: "Classic Greek salad topped with grilled chicken" },
      { name: "Falafel Bowl", description: "Crispy falafel with tahini and fresh vegetables" },
      { name: "Hummus Plate", description: "Hummus with grilled vegetables and pita" }
    ],
    dinner: [
      { name: "Mediterranean Fish", description: "White fish with tomatoes, olives, and herbs" },
      { name: "Greek Chicken", description: "Lemon-herb chicken with roasted vegetables" },
      { name: "Moussaka", description: "Layered eggplant and meat casserole" }
    ]
  },
  spicy: {
    name: "Spicy & Bold",
    breakfast: [
      { name: "Spicy Egg Scramble", description: "Eggs with jalapeños and hot sauce" },
      { name: "Mexican Breakfast Bowl", description: "Eggs, black beans, salsa, and avocado" },
      { name: "Sriracha Tofu Scramble", description: "Spiced tofu with vegetables" }
    ],
    lunch: [
      { name: "Buffalo Chicken Salad", description: "Spicy buffalo chicken over mixed greens" },
      { name: "Thai Basil Chicken", description: "Stir-fried chicken with Thai basil and chilies" },
      { name: "Spicy Tuna Poke Bowl", description: "Sushi-grade tuna with spicy mayo" }
    ],
    dinner: [
      { name: "Cajun Salmon", description: "Blackened salmon with Cajun spices" },
      { name: "Spicy Korean Beef", description: "Gochujang-marinated beef with vegetables" },
      { name: "Thai Red Curry", description: "Chicken or tofu in spicy coconut curry" }
    ]
  }
};
