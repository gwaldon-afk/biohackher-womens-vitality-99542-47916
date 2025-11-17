// Generate nutrition-specific pillar analysis for BODY, BRAIN, BALANCE, BEAUTY

interface NutritionAnalysis {
  impactStatement: string;
  recommendations: string[];
  quickWins: string[];
}

export function generateNutritionPillarAnalysis(
  pillarName: string,
  assessmentData: any,
  pillarScore: number
): NutritionAnalysis {
  
  const scoreBand = pillarScore >= 4 ? 'excellent' :
                    pillarScore >= 3 ? 'good' :
                    pillarScore >= 2 ? 'fair' : 'poor';

  const analyses: Record<string, Record<string, NutritionAnalysis>> = {
    BODY: {
      excellent: {
        impactStatement: 'Your protein intake is excellent and actively supporting muscle maintenance, metabolic health, and longevity. You\'re providing your body with the building blocks it needs to thrive.',
        recommendations: [
          'Maintain protein distribution across meals (25-40g per meal) for optimal muscle protein synthesis',
          'Include variety of protein sources: animal proteins for complete amino acids, plant proteins for fiber',
          'Time largest protein serving post-workout or in the morning for metabolic benefit',
        ],
        quickWins: [
          'Track protein intake for 3 days to ensure consistency',
          'Add collagen peptides to morning coffee for skin and joint support',
        ],
      },
      good: {
        impactStatement: 'Your protein intake provides a solid foundation, but increasing to optimal levels could enhance muscle retention, metabolism, and healthy aging by 15-20%.',
        recommendations: [
          'Increase daily protein target to 1.6-2.0g per kg body weight',
          'Prioritize protein at breakfast to reduce cravings and stabilize blood sugar',
          'Add protein-rich snacks between meals: Greek yogurt, nuts, protein smoothie',
        ],
        quickWins: [
          'Start day with 30g protein within 1 hour of waking',
          'Keep hard-boiled eggs or protein bars as emergency snacks',
        ],
      },
      fair: {
        impactStatement: 'Insufficient protein intake is compromising muscle mass, slowing metabolism, and accelerating aging. Women over 40 need MORE protein, not less, to maintain vitality.',
        recommendations: [
          'Set minimum protein target: 100g daily for most women, 120g+ if active',
          'Plan protein sources for each meal before preparing food',
          'Consider protein powder supplement if struggling to meet targets through food',
          'Address underlying barriers: cost, convenience, taste preferences',
        ],
        quickWins: [
          'Add 2 eggs to breakfast starting tomorrow',
          'Keep pre-cooked rotisserie chicken in fridge for quick protein',
          'Download protein tracking app to increase awareness',
        ],
      },
      poor: {
        impactStatement: 'CRITICAL: Severe protein deficiency is causing muscle loss, metabolic decline, and accelerated aging. This is undermining every other health effort you make.',
        recommendations: [
          'PRIORITY: Increase protein intake immediately to minimum 80-100g daily',
          'Spread protein across 3-4 meals to maximize absorption',
          'Add protein powder to smoothies for easy 20-30g boost',
          'Consider working with nutritionist to create sustainable protein plan',
          'Address barriers: budget, access, cooking skills, taste aversions',
        ],
        quickWins: [
          'Buy protein powder TODAY and have shake for breakfast',
          'Set phone reminders for protein at each meal',
          'Start with easiest sources: Greek yogurt, cottage cheese, deli turkey',
        ],
      },
    },
    BRAIN: {
      excellent: {
        impactStatement: 'Your anti-inflammatory eating pattern is protecting cognitive function, reducing dementia risk, and supporting optimal brain aging.',
        recommendations: [
          'Continue emphasizing omega-3 rich foods (fatty fish 2-3x/week)',
          'Maintain colorful plant diversity for polyphenols and antioxidants',
          'Keep refined sugar and processed foods minimal',
        ],
        quickWins: [
          'Add turmeric with black pepper to one meal daily',
          'Include berries 5+ days per week for brain-protective anthocyanins',
        ],
      },
      good: {
        impactStatement: 'Your nutrition supports brain health, but reducing inflammatory foods could significantly improve cognitive performance and long-term brain aging.',
        recommendations: [
          'Reduce added sugar to <25g daily (women)',
          'Increase omega-3 intake: fatty fish, walnuts, flaxseed, or supplement',
          'Minimize processed foods with inflammatory seed oils',
          'Add brain-supportive foods: leafy greens, berries, dark chocolate 85%+',
        ],
        quickWins: [
          'Replace one sugary snack daily with handful of walnuts or berries',
          'Add 1 cup leafy greens to one meal daily',
        ],
      },
      fair: {
        impactStatement: 'Dietary inflammation is accelerating cognitive decline and increasing dementia risk. Your current eating pattern may be aging your brain 5-10 years faster.',
        recommendations: [
          'Eliminate obvious inflammatory foods: soda, candy, pastries, fried foods',
          'Start Mediterranean-style eating: fish, olive oil, vegetables, whole grains',
          'Begin omega-3 supplementation (1000-2000mg EPA/DHA daily)',
          'Reduce or eliminate processed meats and refined carbohydrates',
        ],
        quickWins: [
          'Swap cooking oils to extra virgin olive oil only',
          'Start omega-3 supplement immediately',
          'Eliminate sugary beverages completely',
        ],
      },
      poor: {
        impactStatement: 'CRITICAL: Severe dietary inflammation is actively damaging brain cells, accelerating cognitive decline, and dramatically increasing dementia risk.',
        recommendations: [
          'PRIORITY: Implement anti-inflammatory protocol immediately',
          'Eliminate all processed foods, added sugars, and inflammatory oils',
          'Adopt Mediterranean diet framework as baseline',
          'Begin high-dose omega-3: 2000-3000mg EPA/DHA daily',
          'Consider working with functional nutritionist for personalized plan',
        ],
        quickWins: [
          'Clear kitchen of inflammatory foods TODAY',
          'Order omega-3 supplement and start immediately',
          'Plan 3 anti-inflammatory meals for this week',
        ],
      },
    },
    BALANCE: {
      excellent: {
        impactStatement: 'Your gut health and eating patterns support optimal hormone balance, metabolic function, and emotional well-being. This is a cornerstone of longevity.',
        recommendations: [
          'Continue fiber-rich eating (30g+ daily) for microbiome diversity',
          'Maintain consistent meal timing to support circadian rhythm',
          'Keep stress-eating patterns minimal through other coping strategies',
        ],
        quickWins: [
          'Add fermented foods 3-4x/week (kimchi, sauerkraut, kefir)',
          'Track meals in food journal to identify any emerging patterns',
        ],
      },
      good: {
        impactStatement: 'Your gut health provides a foundation, but optimizing fiber intake and meal timing could enhance hormone balance, mood stability, and metabolic health.',
        recommendations: [
          'Increase fiber gradually to 30-35g daily (add 5g per week)',
          'Establish consistent meal timing (within 1-hour window daily)',
          'Address stress-eating triggers with non-food coping strategies',
          'Include prebiotic foods: garlic, onions, asparagus, oats',
        ],
        quickWins: [
          'Add 1 tablespoon ground flaxseed to breakfast',
          'Set consistent breakfast and dinner times starting tomorrow',
        ],
      },
      fair: {
        impactStatement: 'Gut symptoms and erratic eating patterns are disrupting hormone balance, mood regulation, and metabolic function. This creates a cascade affecting multiple health systems.',
        recommendations: [
          'Start gut-healing protocol: eliminate common triggers (gluten, dairy) for 3 weeks',
          'Gradually increase fiber to reduce gut symptoms',
          'Establish strict meal schedule to stabilize blood sugar and hormones',
          'Consider digestive enzymes with meals',
          'Address stress-eating patterns through therapy or coaching',
        ],
        quickWins: [
          'Start probiotic supplement (50+ billion CFU)',
          'Set 3 meal times and stick to schedule for 1 week',
          'Identify #1 stress-eating trigger and create alternative response',
        ],
      },
      poor: {
        impactStatement: 'CRITICAL: Severe gut dysfunction and chaotic eating patterns are creating systemic inflammation, hormone disruption, and metabolic chaos.',
        recommendations: [
          'PRIORITY: Consult gastroenterologist to rule out serious conditions',
          'Implement strict elimination diet under professional guidance',
          'Begin gut-healing supplements: L-glutamine, zinc carnosine, probiotics',
          'Establish rigid meal schedule to create metabolic stability',
          'Address psychological relationship with food through therapy',
        ],
        quickWins: [
          'Schedule doctor appointment THIS WEEK',
          'Start food and symptom diary immediately',
          'Begin probiotic and L-glutamine supplementation',
        ],
      },
    },
    BEAUTY: {
      excellent: {
        impactStatement: 'Your hydration, plant diversity, and nutrient-dense eating are supporting radiant skin, cellular health, and visible vitality from the inside out.',
        recommendations: [
          'Maintain 30+ plant varieties weekly for polyphenol diversity',
          'Continue adequate hydration (half body weight in lbs = oz of water)',
          'Keep skin-supportive nutrients high: vitamin C, zinc, omega-3',
        ],
        quickWins: [
          'Track plant variety weekly to ensure diversity',
          'Add vitamin C-rich food to every meal (peppers, citrus, berries)',
        ],
      },
      good: {
        impactStatement: 'Your nutrition supports beauty from within, but optimizing hydration and plant diversity could enhance skin health, hair quality, and cellular vitality.',
        recommendations: [
          'Increase water intake to minimum 8 cups daily',
          'Add 10 new plant varieties to your weekly rotation',
          'Increase skin-supportive foods: fatty fish, avocado, nuts, colorful vegetables',
          'Consider collagen supplementation for skin elasticity',
        ],
        quickWins: [
          'Drink 16oz water immediately upon waking',
          'Add 1 new vegetable to grocery list each week',
        ],
      },
      fair: {
        impactStatement: 'Inadequate hydration and limited plant diversity are compromising skin health, cellular function, and visible signs of aging.',
        recommendations: [
          'Set hydration target: body weight (lbs) / 2 = oz of water daily',
          'Add 5 new plant foods weekly to increase variety',
          'Increase foods rich in beauty nutrients: vitamin C, E, zinc, biotin',
          'Begin collagen peptides supplementation (10g daily)',
        ],
        quickWins: [
          'Buy reusable water bottle and carry everywhere',
          'Set hourly hydration reminders on phone',
          'Add "rainbow challenge": eat 5 colors of plants daily',
        ],
      },
      poor: {
        impactStatement: 'CRITICAL: Severe dehydration and nutrient deficiency are accelerating visible aging, compromising skin barrier function, and reducing cellular vitality.',
        recommendations: [
          'PRIORITY: Address chronic dehydration immediately',
          'Begin aggressive hydration protocol: 8-10 cups daily minimum',
          'Dramatically increase plant diversity from current baseline',
          'Consider IV hydration therapy if chronic dehydration persists',
          'Begin beauty supplementation: collagen, biotin, omega-3, vitamin C',
        ],
        quickWins: [
          'Drink 32oz water before 10am starting tomorrow',
          'Set timer for hydration every hour',
          'Add 3 different colored vegetables to dinner tonight',
        ],
      },
    },
  };

  return analyses[pillarName]?.[scoreBand] || {
    impactStatement: 'Your nutrition in this area requires attention for optimal longevity.',
    recommendations: ['Focus on whole foods', 'Stay hydrated', 'Prioritize consistency'],
    quickWins: ['Start small', 'Track progress'],
  };
}
