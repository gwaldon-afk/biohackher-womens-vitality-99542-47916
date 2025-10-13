export interface LongevityFoodInsight {
  category: string;
  foods: string[];
  keyCompounds: string[];
  longevityMechanisms: string[];
  researchEvidence: {
    study: string;
    finding: string;
    citation: string;
    year: number;
    sampleSize?: string;
  }[];
  recommendedIntake: string;
  practicalTips: string[];
  icon: string;
  evidenceLevel: "Strong" | "Moderate" | "Emerging";
}

export const longevityFoodInsights: LongevityFoodInsight[] = [
  {
    category: "Berries & Polyphenol-Rich Fruits",
    foods: ["Blueberries", "Strawberries", "Blackberries", "Pomegranate"],
    keyCompounds: ["Anthocyanins", "Ellagic acid", "Quercetin", "Resveratrol"],
    longevityMechanisms: [
      "Activates sirtuins (longevity genes)",
      "Reduces oxidative stress by 20-30%",
      "Improves mitochondrial function",
      "Supports telomere maintenance",
      "Reduces cellular senescence"
    ],
    researchEvidence: [
      {
        study: "Nurses' Health Study",
        finding: "Regular berry consumption associated with 2.5 year slower rate of cognitive aging",
        citation: "Devore et al., Annals of Neurology, 2012",
        year: 2012,
        sampleSize: "16,010 women over 6 years"
      },
      {
        study: "Finnish Cohort Study",
        finding: "High anthocyanin intake reduced cardiovascular mortality by 32%",
        citation: "Mink et al., American Journal of Clinical Nutrition, 2007",
        year: 2007,
        sampleSize: "34,489 postmenopausal women"
      },
      {
        study: "Harvard Study",
        finding: "3+ servings/week reduced heart attack risk by 32% in women",
        citation: "Cassidy et al., Circulation, 2013",
        year: 2013,
        sampleSize: "93,600 women aged 25-42"
      }
    ],
    recommendedIntake: "1-2 cups daily (fresh or frozen)",
    practicalTips: [
      "Frozen berries retain 90% of antioxidants",
      "Add to morning smoothies or yogurt",
      "Mix varieties for broader polyphenol spectrum"
    ],
    icon: "🫐",
    evidenceLevel: "Strong"
  },
  {
    category: "Leafy Greens & Cruciferous Vegetables",
    foods: ["Spinach", "Kale", "Broccoli", "Brussels Sprouts", "Arugula"],
    keyCompounds: ["Sulforaphane", "Nitrates", "Folate", "Vitamin K", "Lutein"],
    longevityMechanisms: [
      "Activates Nrf2 pathway (cellular detoxification)",
      "Improves endothelial function & blood flow",
      "Reduces DNA methylation age",
      "Supports NAD+ production",
      "Reduces systemic inflammation"
    ],
    researchEvidence: [
      {
        study: "Rush University Memory & Aging Project",
        finding: "1 serving/day slowed cognitive decline equivalent to 11 years of aging",
        citation: "Morris et al., Neurology, 2018",
        year: 2018,
        sampleSize: "960 participants over 5 years"
      },
      {
        study: "Sulforaphane Clinical Trial",
        finding: "Reduced markers of cellular aging and improved antioxidant gene expression",
        citation: "Bent et al., Journal of Nutritional Biochemistry, 2020",
        year: 2020,
        sampleSize: "29 healthy adults"
      },
      {
        study: "Nitrate Supplementation Study",
        finding: "Improved mitochondrial efficiency by 13% in older adults",
        citation: "Larsen et al., Cell Metabolism, 2011",
        year: 2011,
        sampleSize: "11 healthy men"
      }
    ],
    recommendedIntake: "2-3 cups daily (varied types)",
    practicalTips: [
      "Lightly steam broccoli to maximize sulforaphane",
      "Combine with fat for better nutrient absorption",
      "Rotate varieties throughout the week"
    ],
    icon: "🥬",
    evidenceLevel: "Strong"
  },
  {
    category: "Omega-3 Rich Fish",
    foods: ["Salmon", "Sardines", "Mackerel", "Anchovies"],
    keyCompounds: ["EPA", "DHA", "Astaxanthin", "Vitamin D"],
    longevityMechanisms: [
      "Lengthens telomeres by ~5 years",
      "Reduces systemic inflammation (IL-6, CRP)",
      "Protects cell membrane integrity",
      "Improves insulin sensitivity",
      "Supports brain-derived neurotrophic factor (BDNF)"
    ],
    researchEvidence: [
      {
        study: "Framingham Heart Study",
        finding: "Higher omega-3 levels associated with 2.2 years longer lifespan",
        citation: "Harris et al., American Journal of Clinical Nutrition, 2021",
        year: 2021,
        sampleSize: "2,240 participants over 11 years"
      },
      {
        study: "Telomere Length Study",
        finding: "Omega-3 supplementation slowed telomere shortening by 32%",
        citation: "Farzaneh-Far et al., JAMA, 2010",
        year: 2010,
        sampleSize: "608 patients with heart disease"
      },
      {
        study: "Cardiovascular Outcomes Study",
        finding: "Reduced risk of fatal heart disease by 35%",
        citation: "Mozaffarian & Wu, Journal of the American College of Cardiology, 2011",
        year: 2011,
        sampleSize: "Meta-analysis of 20 studies"
      }
    ],
    recommendedIntake: "3-4 servings per week (100-150g per serving)",
    practicalTips: [
      "Choose wild-caught for higher omega-3 content",
      "Sardines and anchovies = low mercury, high omega-3",
      "Pair with antioxidant-rich vegetables"
    ],
    icon: "🐟",
    evidenceLevel: "Strong"
  },
  {
    category: "Extra Virgin Olive Oil",
    foods: ["Cold-pressed EVOO", "High-polyphenol olive oil"],
    keyCompounds: ["Oleocanthal", "Oleuropein", "Hydroxytyrosol", "Oleic acid"],
    longevityMechanisms: [
      "Activates autophagy (cellular cleanup)",
      "Reduces oxidative damage to lipids",
      "Mimics anti-inflammatory effects of ibuprofen",
      "Improves endothelial function",
      "Modulates gene expression for longevity"
    ],
    researchEvidence: [
      {
        study: "PREDIMED Study",
        finding: "Mediterranean diet + EVOO reduced all-cause mortality by 26%",
        citation: "Guasch-Ferré et al., BMC Medicine, 2014",
        year: 2014,
        sampleSize: "7,216 participants at high cardiovascular risk"
      },
      {
        study: "Harvard Nurses' Health Study",
        finding: ">0.5 tbsp/day associated with 19% lower mortality risk",
        citation: "Guasch-Ferré et al., Journal of the American College of Cardiology, 2022",
        year: 2022,
        sampleSize: "92,383 participants over 28 years"
      },
      {
        study: "Oleocanthal Study",
        finding: "Cleared amyloid-beta plaques associated with Alzheimer's",
        citation: "Abuznait et al., ACS Chemical Neuroscience, 2013",
        year: 2013
      }
    ],
    recommendedIntake: "2-4 tablespoons daily",
    practicalTips: [
      "Look for harvest date (< 1 year old)",
      "High polyphenol = peppery throat sensation",
      "Use raw on salads to preserve polyphenols",
      "Store in dark bottle away from heat"
    ],
    icon: "🫒",
    evidenceLevel: "Strong"
  },
  {
    category: "Nuts & Seeds",
    foods: ["Walnuts", "Almonds", "Chia seeds", "Flaxseeds"],
    keyCompounds: ["Alpha-linolenic acid (ALA)", "Ellagitannins", "Magnesium", "Polyphenols"],
    longevityMechanisms: [
      "Improves gut microbiome diversity",
      "Produces urolithin A (mitophagy activator)",
      "Reduces LDL cholesterol by 10-15%",
      "Supports healthy blood sugar regulation",
      "Provides prebiotic fiber"
    ],
    researchEvidence: [
      {
        study: "Nurses' Health Study & Health Professionals Follow-up",
        finding: "Daily nut consumption associated with 20% lower mortality",
        citation: "Bao et al., New England Journal of Medicine, 2013",
        year: 2013,
        sampleSize: "118,962 participants over 30 years"
      },
      {
        study: "PREDIMED Study",
        finding: "30g nuts/day reduced cardiovascular events by 28%",
        citation: "Estruch et al., New England Journal of Medicine, 2013",
        year: 2013,
        sampleSize: "7,447 adults"
      },
      {
        study: "Walnut Aging Study",
        finding: "Improved cognitive performance and reduced brain inflammation markers",
        citation: "Poulose et al., Journal of Nutrition, 2015",
        year: 2015
      }
    ],
    recommendedIntake: "30g daily (1 handful)",
    practicalTips: [
      "Buy raw and store in fridge/freezer",
      "Soak overnight to reduce phytic acid",
      "Rotate varieties for diverse nutrients"
    ],
    icon: "🥜",
    evidenceLevel: "Strong"
  },
  {
    category: "Legumes",
    foods: ["Lentils", "Chickpeas", "Black beans", "Navy beans"],
    keyCompounds: ["Resistant starch", "Saponins", "Phytic acid", "Fiber"],
    longevityMechanisms: [
      "Feeds beneficial gut bacteria",
      "Stabilizes blood sugar and insulin",
      "Reduces IGF-1 (aging hormone)",
      "Provides complete proteins when combined",
      "Binds and removes toxins"
    ],
    researchEvidence: [
      {
        study: "Blue Zones Research",
        finding: "Common factor in all longevity hotspots - daily legume consumption",
        citation: "Buettner & Skemp, American Journal of Lifestyle Medicine, 2016",
        year: 2016,
        sampleSize: "Population studies across 5 regions"
      },
      {
        study: "Food Habits in Later Life Study",
        finding: "20g legumes/day associated with 7-8% reduction in mortality risk",
        citation: "Darmadi-Blackberry et al., Asia Pacific Journal of Clinical Nutrition, 2004",
        year: 2004,
        sampleSize: "785 elderly Australians, Japanese, and Greeks"
      },
      {
        study: "Gut Microbiome Study",
        finding: "Increased butyrate-producing bacteria by 40% (protective compound)",
        citation: "Heianza et al., Gut, 2019",
        year: 2019
      }
    ],
    recommendedIntake: "1-2 cups cooked daily",
    practicalTips: [
      "Soak overnight + rinse to reduce gas",
      "Pressure cooking preserves resistant starch",
      "Add to soups, salads, and grain bowls"
    ],
    icon: "🫘",
    evidenceLevel: "Strong"
  },
  {
    category: "Fermented Foods",
    foods: ["Kimchi", "Sauerkraut", "Kefir", "Yogurt", "Miso"],
    keyCompounds: ["Lactobacillus", "Bifidobacteria", "Postbiotics", "Vitamin K2"],
    longevityMechanisms: [
      "Restores gut barrier function",
      "Produces anti-inflammatory metabolites",
      "Modulates immune system (70% in gut)",
      "Increases nutrient bioavailability",
      "Reduces systemic inflammation"
    ],
    researchEvidence: [
      {
        study: "Stanford Fermented Food Study",
        finding: "10 weeks of fermented foods reduced 19 inflammatory markers",
        citation: "Wastyk et al., Cell, 2021",
        year: 2021,
        sampleSize: "36 healthy adults"
      },
      {
        study: "Korean Cancer Prevention Study",
        finding: "Kimchi consumption associated with 25% lower obesity risk",
        citation: "Kim et al., Nutrition Research, 2011",
        year: 2011,
        sampleSize: "22,643 adults"
      },
      {
        study: "Gut Microbiome Diversity Study",
        finding: "Fermented food eaters had 30% greater microbiome diversity",
        citation: "Lang et al., Environmental Microbiology, 2018",
        year: 2018
      }
    ],
    recommendedIntake: "1-2 servings daily",
    practicalTips: [
      "Choose unpasteurized for live cultures",
      "Start small and increase gradually",
      "Rotate different fermented foods"
    ],
    icon: "🥒",
    evidenceLevel: "Strong"
  },
  {
    category: "Green Tea",
    foods: ["Matcha", "Sencha", "Gyokuro"],
    keyCompounds: ["EGCG (Epigallocatechin gallate)", "L-theanine", "Catechins"],
    longevityMechanisms: [
      "Activates AMPK (metabolic regulator)",
      "Induces autophagy",
      "Protects against DNA damage",
      "Enhances fat oxidation",
      "Improves mitochondrial biogenesis"
    ],
    researchEvidence: [
      {
        study: "Ohsaki Cohort Study (Japan)",
        finding: "5+ cups/day reduced mortality by 16% (men), 23% (women)",
        citation: "Kuriyama et al., JAMA, 2006",
        year: 2006,
        sampleSize: "40,530 adults over 11 years"
      },
      {
        study: "China Health & Nutrition Survey",
        finding: "Regular tea drinkers had biological age 1.4 years younger",
        citation: "Liu et al., Nature Aging, 2023",
        year: 2023,
        sampleSize: "5,998 adults"
      },
      {
        study: "EGCG Clinical Trial",
        finding: "Improved markers of cellular senescence in 12 weeks",
        citation: "Patel et al., Clinical Nutrition, 2020",
        year: 2020
      }
    ],
    recommendedIntake: "3-5 cups daily (or 1-2 tsp matcha)",
    practicalTips: [
      "Brew at 160-180°F to preserve catechins",
      "Add lemon to increase EGCG absorption by 13x",
      "Matcha provides 137x more EGCG than regular green tea"
    ],
    icon: "🍵",
    evidenceLevel: "Strong"
  },
  {
    category: "Dark Chocolate (85%+ cacao)",
    foods: ["High-cacao dark chocolate", "Raw cacao"],
    keyCompounds: ["Flavanols", "Theobromine", "Magnesium", "Epicatechin"],
    longevityMechanisms: [
      "Improves endothelial function & blood flow",
      "Increases nitric oxide production",
      "Reduces blood pressure by 2-3 mmHg",
      "Mimics exercise benefits on mitochondria",
      "Protects against cognitive decline"
    ],
    researchEvidence: [
      {
        study: "Zutphen Elderly Study",
        finding: "Cocoa consumption reduced cardiovascular mortality by 50%",
        citation: "Buijsse et al., Archives of Internal Medicine, 2006",
        year: 2006,
        sampleSize: "470 elderly men over 15 years"
      },
      {
        study: "Mars Symbioscience Study",
        finding: "Epicatechin improved muscle strength and mitochondria in older adults",
        citation: "Gutierrez-Salmean et al., Clinical and Translational Science, 2014",
        year: 2014
      },
      {
        study: "Cognitive Function Study",
        finding: "Regular cocoa consumption improved processing speed and working memory",
        citation: "Desideri et al., Hypertension, 2012",
        year: 2012,
        sampleSize: "90 elderly with mild cognitive impairment"
      }
    ],
    recommendedIntake: "20-30g daily (85%+ cacao)",
    practicalTips: [
      "Choose 85%+ cacao for maximum flavanols",
      "Avoid Dutch-processed (destroys 90% of flavanols)",
      "Pair with berries for synergistic effects"
    ],
    icon: "🍫",
    evidenceLevel: "Moderate"
  },
  {
    category: "Mushrooms",
    foods: ["Shiitake", "Lion's Mane", "Reishi", "Maitake"],
    keyCompounds: ["Beta-glucans", "Ergothioneine", "Hericenones", "Polysaccharides"],
    longevityMechanisms: [
      "Modulates immune system function",
      "Powerful cellular antioxidant (ergothioneine)",
      "Supports nerve growth factor (NGF)",
      "Reduces chronic inflammation",
      "Improves gut microbiome"
    ],
    researchEvidence: [
      {
        study: "Penn State Mushroom Study",
        finding: "Mushroom consumption associated with 16% lower cancer risk",
        citation: "Ba et al., Advances in Nutrition, 2021",
        year: 2021,
        sampleSize: "Meta-analysis of 17 studies"
      },
      {
        study: "Singapore Chinese Health Study",
        finding: ">2 servings/week reduced cognitive impairment risk by 43%",
        citation: "Feng et al., Journal of Alzheimer's Disease, 2019",
        year: 2019,
        sampleSize: "663 adults over 6 years"
      },
      {
        study: "Lion's Mane Clinical Trial",
        finding: "Improved cognitive function scores by 15-20% in 16 weeks",
        citation: "Mori et al., Phytotherapy Research, 2009",
        year: 2009,
        sampleSize: "50-80 year olds with mild cognitive impairment"
      }
    ],
    recommendedIntake: "1-2 servings (100-150g) weekly",
    practicalTips: [
      "Cook mushrooms to increase nutrient bioavailability",
      "Expose to sunlight to boost vitamin D",
      "Combine varieties for broader benefits"
    ],
    icon: "🍄",
    evidenceLevel: "Moderate"
  }
];

export const longevityEatingPrinciples = [
  {
    principle: "Caloric Restriction with Optimal Nutrition",
    description: "Eating 10-20% fewer calories while maintaining nutrient density activates longevity pathways",
    mechanism: "Activates sirtuins, AMPK, and autophagy while reducing IGF-1 and mTOR",
    evidence: "Associated with 20-30% lifespan extension in animal models; human studies show improved biomarkers"
  },
  {
    principle: "Time-Restricted Eating",
    description: "Eating within an 8-12 hour window daily",
    mechanism: "Allows extended periods of autophagy and cellular repair",
    evidence: "Improves insulin sensitivity, reduces inflammation, and may extend healthspan"
  },
  {
    principle: "Protein Cycling",
    description: "Varying protein intake (higher on exercise days, lower on rest days)",
    mechanism: "Balances mTOR activation (growth) with autophagy (repair)",
    evidence: "May optimize muscle maintenance while promoting cellular cleanup"
  },
  {
    principle: "Phytonutrient Diversity",
    description: "Consuming 30+ plant species weekly",
    mechanism: "Activates xenohormesis - beneficial stress response from plant compounds",
    evidence: "Greater microbiome diversity correlates with better health outcomes"
  }
];
