export interface LongevityFood {
  id: string;
  name: string;
  category: string;
  longevityRating: number; // 1-5 scale
  evidenceLevel: "Strong" | "Moderate" | "Emerging";
  keyBenefits: string[];
  mechanisms: string[];
  researchCitations: {
    study: string;
    finding: string;
    citation: string;
    year: number;
  }[];
  leucineContent?: number; // grams per 100g
  leucineScore?: number; // 1-5 scale
  isFODMAPFriendly: boolean;
  commonServingSize: string;
  icon: string;
}

export const longevityFoodDatabase: LongevityFood[] = [
  // Berries
  {
    id: "blueberries",
    name: "Blueberries",
    category: "Berries & Fruits",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Cognitive protection", "Reduced oxidative stress", "Telomere maintenance"],
    mechanisms: ["Activates sirtuins", "Reduces oxidative stress by 20-30%", "Improves mitochondrial function"],
    researchCitations: [
      {
        study: "Nurses' Health Study",
        finding: "Regular berry consumption associated with 2.5 year slower rate of cognitive aging",
        citation: "Devore et al., Annals of Neurology, 2012",
        year: 2012
      }
    ],
    isFODMAPFriendly: true,
    commonServingSize: "1 cup (150g)",
    icon: "🫐"
  },
  {
    id: "strawberries",
    name: "Strawberries",
    category: "Berries & Fruits",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Heart health", "Anti-inflammatory", "Antioxidant"],
    mechanisms: ["High anthocyanin content", "Supports cardiovascular function"],
    researchCitations: [
      {
        study: "Harvard Study",
        finding: "3+ servings/week reduced heart attack risk by 32% in women",
        citation: "Cassidy et al., Circulation, 2013",
        year: 2013
      }
    ],
    isFODMAPFriendly: true,
    commonServingSize: "1 cup (150g)",
    icon: "🍓"
  },
  {
    id: "blackberries",
    name: "Blackberries",
    category: "Berries & Fruits",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["High fiber", "Antioxidant", "Cognitive support"],
    mechanisms: ["Rich in ellagic acid", "Supports gut microbiome"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "1 cup (150g)",
    icon: "🫐"
  },
  {
    id: "pomegranate",
    name: "Pomegranate",
    category: "Berries & Fruits",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Cardiovascular health", "Anti-aging", "Anti-inflammatory"],
    mechanisms: ["High in punicalagins", "Supports arterial health"],
    researchCitations: [],
    isFODMAPFriendly: false,
    commonServingSize: "1/2 cup seeds (80g)",
    icon: "🫐"
  },

  // Leafy Greens
  {
    id: "spinach",
    name: "Spinach",
    category: "Leafy Greens",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Cognitive protection", "Bone health", "Eye health"],
    mechanisms: ["High in nitrates", "Rich in folate and vitamin K", "Contains lutein"],
    researchCitations: [
      {
        study: "Rush University Memory & Aging Project",
        finding: "1 serving/day slowed cognitive decline equivalent to 11 years of aging",
        citation: "Morris et al., Neurology, 2018",
        year: 2018
      }
    ],
    isFODMAPFriendly: true,
    commonServingSize: "2 cups raw (60g)",
    icon: "🥬"
  },
  {
    id: "kale",
    name: "Kale",
    category: "Leafy Greens",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Detoxification", "Anti-inflammatory", "Nutrient dense"],
    mechanisms: ["Activates Nrf2 pathway", "High in vitamins A, C, K"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "2 cups raw (70g)",
    icon: "🥬"
  },
  {
    id: "arugula",
    name: "Arugula",
    category: "Leafy Greens",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Digestive health", "Bone health", "Antioxidant"],
    mechanisms: ["Contains glucosinolates", "High in calcium"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "2 cups (40g)",
    icon: "🥬"
  },

  // Cruciferous Vegetables
  {
    id: "broccoli",
    name: "Broccoli",
    category: "Cruciferous Vegetables",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Cellular detoxification", "Cancer prevention", "Anti-aging"],
    mechanisms: ["Rich in sulforaphane", "Activates Nrf2 pathway", "Supports DNA repair"],
    researchCitations: [
      {
        study: "Sulforaphane Clinical Trial",
        finding: "Reduced markers of cellular aging and improved antioxidant gene expression",
        citation: "Bent et al., Journal of Nutritional Biochemistry, 2020",
        year: 2020
      }
    ],
    isFODMAPFriendly: false,
    commonServingSize: "1 cup cooked (150g)",
    icon: "🥦"
  },
  {
    id: "brussels-sprouts",
    name: "Brussels Sprouts",
    category: "Cruciferous Vegetables",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Detoxification", "Anti-inflammatory", "Nutrient dense"],
    mechanisms: ["High in sulforaphane", "Rich in vitamin K"],
    researchCitations: [],
    isFODMAPFriendly: false,
    commonServingSize: "1 cup cooked (150g)",
    icon: "🥬"
  },
  {
    id: "cauliflower",
    name: "Cauliflower",
    category: "Cruciferous Vegetables",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Digestive health", "Anti-inflammatory", "Low calorie"],
    mechanisms: ["Contains glucosinolates", "High in fiber"],
    researchCitations: [],
    isFODMAPFriendly: false,
    commonServingSize: "1 cup cooked (125g)",
    icon: "🥦"
  },

  // Fatty Fish
  {
    id: "salmon",
    name: "Salmon",
    category: "Fatty Fish",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Heart health", "Brain function", "Anti-inflammatory"],
    mechanisms: ["Lengthens telomeres by ~5 years", "High in EPA/DHA", "Supports BDNF"],
    researchCitations: [
      {
        study: "Framingham Heart Study",
        finding: "Higher omega-3 levels associated with 2.2 years longer lifespan",
        citation: "Harris et al., American Journal of Clinical Nutrition, 2021",
        year: 2021
      }
    ],
    leucineContent: 1.6,
    leucineScore: 3,
    isFODMAPFriendly: true,
    commonServingSize: "6 oz (170g)",
    icon: "🐟"
  },
  {
    id: "sardines",
    name: "Sardines",
    category: "Fatty Fish",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Bone health", "Heart health", "Low mercury"],
    mechanisms: ["High omega-3", "Rich in calcium and vitamin D"],
    researchCitations: [],
    leucineContent: 1.8,
    leucineScore: 4,
    isFODMAPFriendly: true,
    commonServingSize: "3 oz (85g)",
    icon: "🐟"
  },
  {
    id: "mackerel",
    name: "Mackerel",
    category: "Fatty Fish",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Heart health", "Brain health", "Vitamin D"],
    mechanisms: ["Extremely high in omega-3", "Anti-inflammatory"],
    researchCitations: [],
    leucineContent: 1.7,
    leucineScore: 3,
    isFODMAPFriendly: true,
    commonServingSize: "3 oz (85g)",
    icon: "🐟"
  },

  // Nuts & Seeds
  {
    id: "walnuts",
    name: "Walnuts",
    category: "Nuts & Seeds",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Brain health", "Heart health", "Anti-inflammatory"],
    mechanisms: ["High in ALA omega-3", "Produces urolithin A", "Supports microbiome"],
    researchCitations: [
      {
        study: "Nurses' Health Study",
        finding: "Daily nut consumption associated with 20% lower mortality",
        citation: "Bao et al., New England Journal of Medicine, 2013",
        year: 2013
      }
    ],
    leucineContent: 1.2,
    leucineScore: 2,
    isFODMAPFriendly: false,
    commonServingSize: "1 oz (28g)",
    icon: "🥜"
  },
  {
    id: "almonds",
    name: "Almonds",
    category: "Nuts & Seeds",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Heart health", "Blood sugar control", "Vitamin E"],
    mechanisms: ["Reduces LDL cholesterol", "High in magnesium"],
    researchCitations: [],
    leucineContent: 1.5,
    leucineScore: 3,
    isFODMAPFriendly: false,
    commonServingSize: "1 oz (23 nuts)",
    icon: "🥜"
  },
  {
    id: "chia-seeds",
    name: "Chia Seeds",
    category: "Nuts & Seeds",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Fiber", "Omega-3", "Blood sugar control"],
    mechanisms: ["High in ALA", "Prebiotic fiber"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "2 tbsp (28g)",
    icon: "🌾"
  },
  {
    id: "flaxseeds",
    name: "Flaxseeds",
    category: "Nuts & Seeds",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Hormone balance", "Digestive health", "Omega-3"],
    mechanisms: ["High in lignans", "Rich in ALA"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "2 tbsp ground (20g)",
    icon: "🌾"
  },

  // Legumes
  {
    id: "lentils",
    name: "Lentils",
    category: "Legumes",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Blood sugar control", "Gut health", "Plant protein"],
    mechanisms: ["High in resistant starch", "Feeds beneficial bacteria", "Reduces IGF-1"],
    researchCitations: [
      {
        study: "Blue Zones Research",
        finding: "Common factor in all longevity hotspots - daily legume consumption",
        citation: "Buettner & Skemp, American Journal of Lifestyle Medicine, 2016",
        year: 2016
      }
    ],
    leucineContent: 1.8,
    leucineScore: 4,
    isFODMAPFriendly: false,
    commonServingSize: "1 cup cooked (200g)",
    icon: "🫘"
  },
  {
    id: "chickpeas",
    name: "Chickpeas",
    category: "Legumes",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Satiety", "Gut health", "Stable energy"],
    mechanisms: ["High in fiber and protein", "Low glycemic index"],
    researchCitations: [],
    leucineContent: 1.4,
    leucineScore: 3,
    isFODMAPFriendly: false,
    commonServingSize: "1 cup cooked (164g)",
    icon: "🫘"
  },
  {
    id: "black-beans",
    name: "Black Beans",
    category: "Legumes",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Antioxidants", "Protein", "Fiber"],
    mechanisms: ["High in anthocyanins", "Supports gut microbiome"],
    researchCitations: [],
    leucineContent: 1.5,
    leucineScore: 3,
    isFODMAPFriendly: false,
    commonServingSize: "1 cup cooked (172g)",
    icon: "🫘"
  },

  // Fermented Foods
  {
    id: "kimchi",
    name: "Kimchi",
    category: "Fermented Foods",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Gut health", "Immune support", "Anti-inflammatory"],
    mechanisms: ["Restores gut barrier", "Produces anti-inflammatory metabolites"],
    researchCitations: [
      {
        study: "Stanford Fermented Food Study",
        finding: "10 weeks of fermented foods reduced 19 inflammatory markers",
        citation: "Wastyk et al., Cell, 2021",
        year: 2021
      }
    ],
    isFODMAPFriendly: false,
    commonServingSize: "1/2 cup (75g)",
    icon: "🥒"
  },
  {
    id: "sauerkraut",
    name: "Sauerkraut",
    category: "Fermented Foods",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Digestive health", "Probiotics", "Vitamin C"],
    mechanisms: ["High in lactobacillus", "Low calorie, high nutrient"],
    researchCitations: [],
    isFODMAPFriendly: false,
    commonServingSize: "1/2 cup (75g)",
    icon: "🥒"
  },
  {
    id: "kefir",
    name: "Kefir",
    category: "Fermented Foods",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Gut health", "Bone health", "Digestion"],
    mechanisms: ["Multiple probiotic strains", "High in calcium"],
    researchCitations: [],
    isFODMAPFriendly: false,
    commonServingSize: "1 cup (240ml)",
    icon: "🥛"
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    category: "Fermented Foods",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Protein", "Probiotics", "Calcium"],
    mechanisms: ["Live cultures", "High protein content"],
    researchCitations: [],
    leucineContent: 2.0,
    leucineScore: 4,
    isFODMAPFriendly: true,
    commonServingSize: "1 cup (200g)",
    icon: "🥛"
  },

  // Extra Virgin Olive Oil
  {
    id: "evoo",
    name: "Extra Virgin Olive Oil",
    category: "Healthy Fats",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Heart health", "Anti-inflammatory", "Brain health"],
    mechanisms: ["Activates autophagy", "Mimics anti-inflammatory effects of ibuprofen", "High in oleocanthal"],
    researchCitations: [
      {
        study: "PREDIMED Study",
        finding: "Mediterranean diet + EVOO reduced all-cause mortality by 26%",
        citation: "Guasch-Ferré et al., BMC Medicine, 2014",
        year: 2014
      }
    ],
    isFODMAPFriendly: true,
    commonServingSize: "2-4 tbsp (30-60ml)",
    icon: "🫒"
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Healthy Fats",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Heart health", "Fiber", "Nutrient absorption"],
    mechanisms: ["Rich in monounsaturated fats", "High in potassium"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "1/2 avocado (100g)",
    icon: "🥑"
  },

  // Green Tea
  {
    id: "green-tea",
    name: "Green Tea",
    category: "Beverages",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Longevity", "Brain health", "Fat oxidation"],
    mechanisms: ["Activates AMPK", "Induces autophagy", "High in EGCG"],
    researchCitations: [
      {
        study: "Ohsaki Cohort Study",
        finding: "5+ cups/day reduced mortality by 16% (men), 23% (women)",
        citation: "Kuriyama et al., JAMA, 2006",
        year: 2006
      }
    ],
    isFODMAPFriendly: true,
    commonServingSize: "3-5 cups daily",
    icon: "🍵"
  },
  {
    id: "matcha",
    name: "Matcha",
    category: "Beverages",
    longevityRating: 5,
    evidenceLevel: "Strong",
    keyBenefits: ["Antioxidants", "Focus", "Energy"],
    mechanisms: ["137x more EGCG than regular green tea", "L-theanine for calm focus"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "1-2 tsp powder",
    icon: "🍵"
  },

  // Dark Chocolate
  {
    id: "dark-chocolate",
    name: "Dark Chocolate (85%+)",
    category: "Treats",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Heart health", "Cognitive function", "Mood"],
    mechanisms: ["Improves endothelial function", "Mimics exercise benefits", "High in flavanols"],
    researchCitations: [
      {
        study: "Zutphen Elderly Study",
        finding: "Cocoa consumption reduced cardiovascular mortality by 50%",
        citation: "Buijsse et al., Archives of Internal Medicine, 2006",
        year: 2006
      }
    ],
    isFODMAPFriendly: true,
    commonServingSize: "20-30g daily",
    icon: "🍫"
  },

  // Mushrooms
  {
    id: "shiitake",
    name: "Shiitake Mushrooms",
    category: "Mushrooms",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Immune support", "Antioxidant", "Vitamin D"],
    mechanisms: ["Beta-glucans", "Ergothioneine"],
    researchCitations: [
      {
        study: "Penn State Mushroom Study",
        finding: "Mushroom consumption associated with 16% lower cancer risk",
        citation: "Ba et al., Advances in Nutrition, 2021",
        year: 2021
      }
    ],
    leucineContent: 0.8,
    leucineScore: 1,
    isFODMAPFriendly: true,
    commonServingSize: "1 cup cooked (145g)",
    icon: "🍄"
  },
  {
    id: "lions-mane",
    name: "Lion's Mane Mushrooms",
    category: "Mushrooms",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Brain health", "Nerve regeneration", "Cognitive function"],
    mechanisms: ["Supports nerve growth factor", "Neuroprotective"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "1 cup cooked (100g)",
    icon: "🍄"
  },

  // Additional High Protein Foods
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "Lean Protein",
    longevityRating: 3,
    evidenceLevel: "Moderate",
    keyBenefits: ["High protein", "Lean", "Versatile"],
    mechanisms: ["Complete protein source", "Low in saturated fat"],
    researchCitations: [],
    leucineContent: 1.9,
    leucineScore: 4,
    isFODMAPFriendly: true,
    commonServingSize: "6 oz (170g)",
    icon: "🍗"
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "Protein",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Complete protein", "Choline", "Vitamin B12"],
    mechanisms: ["All essential amino acids", "Brain health support"],
    researchCitations: [],
    leucineContent: 1.1,
    leucineScore: 2,
    isFODMAPFriendly: true,
    commonServingSize: "2 large eggs",
    icon: "🥚"
  },
  {
    id: "tofu",
    name: "Tofu",
    category: "Plant Protein",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Plant protein", "Isoflavones", "Calcium"],
    mechanisms: ["Complete plant protein", "Hormone balance"],
    researchCitations: [],
    leucineContent: 1.3,
    leucineScore: 3,
    isFODMAPFriendly: true,
    commonServingSize: "1/2 cup (126g)",
    icon: "🥡"
  },
  {
    id: "cottage-cheese",
    name: "Cottage Cheese",
    category: "Dairy",
    longevityRating: 3,
    evidenceLevel: "Moderate",
    keyBenefits: ["High protein", "Calcium", "Slow-digesting"],
    mechanisms: ["Casein protein", "Supports muscle maintenance"],
    researchCitations: [],
    leucineContent: 2.6,
    leucineScore: 5,
    isFODMAPFriendly: true,
    commonServingSize: "1 cup (226g)",
    icon: "🧀"
  },
  {
    id: "quinoa",
    name: "Quinoa",
    category: "Whole Grains",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Complete protein", "Fiber", "Minerals"],
    mechanisms: ["All 9 essential amino acids", "High in magnesium"],
    researchCitations: [],
    leucineContent: 0.8,
    leucineScore: 1,
    isFODMAPFriendly: true,
    commonServingSize: "1 cup cooked (185g)",
    icon: "🌾"
  },

  // Sweet Potato
  {
    id: "sweet-potato",
    name: "Sweet Potato",
    category: "Starchy Vegetables",
    longevityRating: 4,
    evidenceLevel: "Moderate",
    keyBenefits: ["Vitamin A", "Fiber", "Blood sugar friendly"],
    mechanisms: ["High in beta-carotene", "Resistant starch"],
    researchCitations: [],
    isFODMAPFriendly: true,
    commonServingSize: "1 medium (150g)",
    icon: "🍠"
  }
];

export const foodCategories = [
  "All",
  "Berries & Fruits",
  "Leafy Greens",
  "Cruciferous Vegetables",
  "Fatty Fish",
  "Nuts & Seeds",
  "Legumes",
  "Fermented Foods",
  "Healthy Fats",
  "Beverages",
  "Mushrooms",
  "Lean Protein",
  "Protein",
  "Plant Protein",
  "Dairy",
  "Whole Grains",
  "Starchy Vegetables",
  "Treats"
];

export const mechanismCategories = [
  "All",
  "Autophagy",
  "Anti-inflammatory",
  "Antioxidant",
  "Gut health",
  "Brain health",
  "Heart health",
  "Telomere support",
  "Mitochondrial function"
];
