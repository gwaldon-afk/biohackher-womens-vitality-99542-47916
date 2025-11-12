import { HORMONE_COMPASS_ASSESSMENT } from '@/data/hormoneCompassAssessment';

export interface ProtocolItem {
  name: string;
  description: string;
  category: 'immediate' | 'foundation' | 'optimization';
  relevance: string;
  productKeywords?: string[];
}

export interface DomainProtocol {
  immediate: ProtocolItem[];
  foundation: ProtocolItem[];
  optimization: ProtocolItem[];
}

// Map domain scores to personalized protocol recommendations
export function generateHormoneProtocol(
  answers: Record<string, number>,
  domainScores: Record<string, number>
): DomainProtocol {
  const protocol: DomainProtocol = {
    immediate: [],
    foundation: [],
    optimization: []
  };

  // Get the two lowest-scoring domains for targeted recommendations
  const sortedDomains = Object.entries(domainScores)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 2);

  sortedDomains.forEach(([domainId, score]) => {
    const domainProtocols = getDomainProtocol(domainId, score, answers);
    protocol.immediate.push(...domainProtocols.immediate);
    protocol.foundation.push(...domainProtocols.foundation);
    protocol.optimization.push(...domainProtocols.optimization);
  });

  return protocol;
}

function getDomainProtocol(
  domainId: string,
  score: number,
  answers: Record<string, number>
): DomainProtocol {
  const protocols: Record<string, DomainProtocol> = {
    'cycle-patterns': {
      immediate: [
        {
          name: 'Track Your Cycle Daily',
          description: 'Log symptoms, flow, and patterns in the app',
          category: 'immediate',
          relevance: 'Understanding your pattern is the first step to balance'
        },
        {
          name: 'Reduce Inflammatory Foods',
          description: 'Eliminate refined sugar and processed foods for 2 weeks',
          category: 'immediate',
          relevance: 'Inflammation directly affects hormone production and cycle regularity'
        }
      ],
      foundation: [
        {
          name: 'Magnesium Glycinate',
          description: '300-400mg before bed',
          category: 'foundation',
          relevance: 'Supports progesterone production and reduces cycle-related cramping',
          productKeywords: ['magnesium', 'cycle-support']
        },
        {
          name: 'Evening Primrose Oil',
          description: '1000mg daily with meals',
          category: 'foundation',
          relevance: 'GLA content helps regulate prostaglandins for healthier cycles',
          productKeywords: ['evening-primrose', 'cycle-regulation']
        },
        {
          name: 'Seed Cycling',
          description: 'Rotate flax/pumpkin (follicular) and sesame/sunflower (luteal)',
          category: 'foundation',
          relevance: 'Supports natural hormone balance throughout your cycle'
        }
      ],
      optimization: [
        {
          name: 'Vitex (Chasteberry)',
          description: '400mg daily, morning',
          category: 'optimization',
          relevance: 'Supports pituitary function and progesterone balance',
          productKeywords: ['vitex', 'chasteberry', 'hormone-balance']
        },
        {
          name: 'Inositol',
          description: '2-4g daily for PCOS-related irregularity',
          category: 'optimization',
          relevance: 'Improves insulin sensitivity and ovarian function',
          productKeywords: ['inositol', 'pcos-support']
        }
      ]
    },
    'sleep-thermo': {
      immediate: [
        {
          name: 'Blue Light Blocking',
          description: 'No screens 2 hours before bed, or use amber glasses',
          category: 'immediate',
          relevance: 'Blue light disrupts melatonin and worsens night sweats'
        },
        {
          name: 'Cool Room Temperature',
          description: 'Keep bedroom at 65-68°F with breathable bedding',
          category: 'immediate',
          relevance: 'Helps regulate body temperature and reduces hot flashes'
        }
      ],
      foundation: [
        {
          name: 'Magnesium Glycinate',
          description: '300mg 1 hour before bed',
          category: 'foundation',
          relevance: 'Promotes GABA activity for deeper sleep and muscle relaxation',
          productKeywords: ['magnesium', 'sleep-support']
        },
        {
          name: 'L-Theanine',
          description: '200mg before bed',
          category: 'foundation',
          relevance: 'Reduces racing thoughts and promotes calm without sedation',
          productKeywords: ['l-theanine', 'sleep', 'anxiety']
        },
        {
          name: 'Glycine',
          description: '3g before bed',
          category: 'foundation',
          relevance: 'Lowers core body temperature and improves sleep quality',
          productKeywords: ['glycine', 'sleep-quality']
        }
      ],
      optimization: [
        {
          name: 'Black Cohosh',
          description: '40-80mg daily for hot flash reduction',
          category: 'optimization',
          relevance: 'Clinically proven to reduce vasomotor symptoms',
          productKeywords: ['black-cohosh', 'hot-flashes', 'menopause']
        },
        {
          name: 'Sage Extract',
          description: '300mg daily',
          category: 'optimization',
          relevance: 'Reduces night sweats and improves thermoregulation',
          productKeywords: ['sage', 'night-sweats']
        }
      ]
    },
    'mood-focus': {
      immediate: [
        {
          name: '4-7-8 Breathing',
          description: 'Practice twice daily: 4sec inhale, 7sec hold, 8sec exhale',
          category: 'immediate',
          relevance: 'Activates parasympathetic nervous system to reduce anxiety'
        },
        {
          name: '10-Minute Morning Walk',
          description: 'Sunlight exposure within 1 hour of waking',
          category: 'immediate',
          relevance: 'Regulates cortisol and supports serotonin production'
        }
      ],
      foundation: [
        {
          name: 'Omega-3 (EPA/DHA)',
          description: '2000mg daily with meals',
          category: 'foundation',
          relevance: 'Supports brain cell membrane health and neurotransmitter function',
          productKeywords: ['omega-3', 'fish-oil', 'brain-health']
        },
        {
          name: 'B-Complex Vitamin',
          description: 'High-potency complex with breakfast',
          category: 'foundation',
          relevance: 'Essential cofactors for neurotransmitter synthesis',
          productKeywords: ['b-complex', 'mood-support']
        },
        {
          name: 'Rhodiola Rosea',
          description: '300-400mg morning',
          category: 'foundation',
          relevance: 'Adaptogen that reduces mental fatigue and improves focus',
          productKeywords: ['rhodiola', 'adaptogen', 'focus']
        }
      ],
      optimization: [
        {
          name: 'Saffron Extract',
          description: '30mg daily',
          category: 'optimization',
          relevance: 'Clinically shown to support mood as effectively as some medications',
          productKeywords: ['saffron', 'mood-support']
        },
        {
          name: 'Lion\'s Mane Mushroom',
          description: '500-1000mg daily',
          category: 'optimization',
          relevance: 'Supports neurogenesis and cognitive clarity',
          productKeywords: ['lions-mane', 'mushroom', 'cognitive']
        }
      ]
    },
    'energy-weight': {
      immediate: [
        {
          name: 'Protein at Every Meal',
          description: '25-30g per meal to stabilize blood sugar',
          category: 'immediate',
          relevance: 'Prevents energy crashes and supports metabolic health'
        },
        {
          name: 'Hydration Protocol',
          description: 'LOCALIZED:HYDRATION',
          category: 'immediate',
          relevance: 'Dehydration worsens fatigue and slows metabolism'
        }
      ],
      foundation: [
        {
          name: 'CoQ10',
          description: '100-200mg with breakfast',
          category: 'foundation',
          relevance: 'Essential for mitochondrial energy production',
          productKeywords: ['coq10', 'energy', 'mitochondria']
        },
        {
          name: 'Ashwagandha',
          description: '300-600mg daily',
          category: 'foundation',
          relevance: 'Reduces cortisol, supports thyroid, improves stress-related fatigue',
          productKeywords: ['ashwagandha', 'adaptogen', 'cortisol']
        },
        {
          name: 'Chromium Picolinate',
          description: '200-400mcg daily',
          category: 'foundation',
          relevance: 'Improves insulin sensitivity and reduces sugar cravings',
          productKeywords: ['chromium', 'blood-sugar', 'weight']
        }
      ],
      optimization: [
        {
          name: 'Berberine',
          description: '500mg 2-3x daily with meals',
          category: 'optimization',
          relevance: 'Activates AMPK for metabolic support and weight management',
          productKeywords: ['berberine', 'metabolism', 'blood-sugar']
        },
        {
          name: 'L-Carnitine',
          description: '500-2000mg daily',
          category: 'optimization',
          relevance: 'Transports fatty acids for energy, supports fat metabolism',
          productKeywords: ['l-carnitine', 'energy', 'fat-metabolism']
        }
      ]
    },
    'libido-sexual': {
      immediate: [
        {
          name: 'Prioritize Sleep',
          description: 'Target 7-9 hours nightly to restore sex hormone production',
          category: 'immediate',
          relevance: 'Poor sleep directly suppresses testosterone and estrogen'
        },
        {
          name: 'Reduce Stress',
          description: 'Daily stress management practice (meditation, yoga, breathwork)',
          category: 'immediate',
          relevance: 'High cortisol suppresses sex hormones and libido'
        }
      ],
      foundation: [
        {
          name: 'Maca Root',
          description: '1500-3000mg daily',
          category: 'foundation',
          relevance: 'Traditionally used to support libido and sexual function',
          productKeywords: ['maca', 'libido', 'sexual-health']
        },
        {
          name: 'Vitamin D3',
          description: '2000-5000 IU daily (test levels first)',
          category: 'foundation',
          relevance: 'Deficiency linked to low libido and vaginal dryness',
          productKeywords: ['vitamin-d', 'hormone-support']
        },
        {
          name: 'Omega-3 Fatty Acids',
          description: '2000mg EPA/DHA daily',
          category: 'foundation',
          relevance: 'Supports circulation and tissue health',
          productKeywords: ['omega-3', 'circulation']
        }
      ],
      optimization: [
        {
          name: 'DHEA',
          description: '10-25mg daily (consult provider)',
          category: 'optimization',
          relevance: 'Precursor to sex hormones, may improve libido and vaginal health',
          productKeywords: ['dhea', 'hormone-precursor']
        },
        {
          name: 'Hyaluronic Acid',
          description: 'Topical or oral for vaginal moisture',
          category: 'optimization',
          relevance: 'Improves tissue hydration and comfort',
          productKeywords: ['hyaluronic-acid', 'vaginal-health']
        }
      ]
    },
    'skin-hair-nails': {
      immediate: [
        {
          name: 'Increase Water Intake',
          description: 'Target 2-3L daily for skin hydration',
          category: 'immediate',
          relevance: 'Dehydration shows up first in skin, hair, and nail quality'
        },
        {
          name: 'Add Healthy Fats',
          description: 'Include avocado, nuts, olive oil, fatty fish daily',
          category: 'immediate',
          relevance: 'Essential fatty acids support skin barrier and hormone production'
        }
      ],
      foundation: [
        {
          name: 'Collagen Peptides',
          description: '10-20g daily in liquid',
          category: 'foundation',
          relevance: 'Supports skin elasticity, hair strength, and nail growth',
          productKeywords: ['collagen', 'skin-health', 'hair-nails']
        },
        {
          name: 'Biotin',
          description: '2500-5000mcg daily',
          category: 'foundation',
          relevance: 'Essential B vitamin for hair and nail health',
          productKeywords: ['biotin', 'hair-growth', 'nail-health']
        },
        {
          name: 'Omega-3 Fish Oil',
          description: '2000mg EPA/DHA daily',
          category: 'foundation',
          relevance: 'Reduces inflammation and supports skin moisture',
          productKeywords: ['omega-3', 'fish-oil', 'skin']
        }
      ],
      optimization: [
        {
          name: 'Silica',
          description: '10-20mg daily',
          category: 'optimization',
          relevance: 'Supports collagen formation and tissue strength',
          productKeywords: ['silica', 'collagen', 'hair-skin-nails']
        },
        {
          name: 'Vitamin C + Zinc',
          description: '1000mg C + 15mg Zinc daily',
          category: 'optimization',
          relevance: 'Antioxidants that support collagen synthesis and healing',
          productKeywords: ['vitamin-c', 'zinc', 'collagen-support']
        }
      ]
    }
  };

  return protocols[domainId] || {
    immediate: [],
    foundation: [],
    optimization: []
  };
}

// Calculate domain scores from answers
export function calculateDomainScores(answers: Record<string, number>): Record<string, number> {
  const domainScores: Record<string, number> = {};
  
  HORMONE_COMPASS_ASSESSMENT.domains.forEach(domain => {
    const domainQuestions = domain.questions.map(q => q.id);
    const domainAnswers = domainQuestions
      .map(qId => answers[qId])
      .filter(val => val !== undefined);
    
    if (domainAnswers.length > 0) {
      const avgScore = domainAnswers.reduce((sum, val) => sum + val, 0) / domainAnswers.length;
      domainScores[domain.id] = avgScore;
    }
  });
  
  return domainScores;
}

// Generate symptom pattern insights
export function generateSymptomPatternAnalysis(
  answers: Record<string, number>,
  domainScores: Record<string, number>,
  userAge?: number
): string[] {
  const insights: string[] = [];
  
  // Sleep + thermoregulation pattern
  if (domainScores['sleep-thermo'] && domainScores['sleep-thermo'] < 2.5) {
    const nightSweats = answers['night_sweats'] || 3;
    const tempReg = answers['temperature_regulation'] || 3;
    if (nightSweats < 3 && tempReg < 3) {
      insights.push("Here's what stands out: Your combination of night sweats and temperature swings could point to vasomotor symptoms affecting your sleep quality—this is really common during hormonal transitions and very treatable.");
    }
  }
  
  // Mood + energy pattern
  if (domainScores['mood-focus'] && domainScores['energy-weight'] && 
      domainScores['mood-focus'] < 3 && domainScores['energy-weight'] < 3) {
    insights.push("What's interesting: The pattern of mood instability paired with fatigue and energy crashes suggests your stress response may be affecting hormone balance—essentially, cortisol dysregulation could be at play here.");
  }
  
  // Cycle + mood pattern
  if (domainScores['cycle-patterns'] && domainScores['mood-focus'] &&
      domainScores['cycle-patterns'] < 3 && domainScores['mood-focus'] < 3) {
    insights.push("Based on your responses: Your irregular cycles combined with mood symptoms indicate a strong cycle-mood connection. This suggests estrogen or progesterone fluctuation might be the root cause, which is highly responsive to targeted support.");
  }
  
  // Multiple low scores
  const lowScoreDomains = Object.entries(domainScores).filter(([, score]) => score < 2.5);
  if (lowScoreDomains.length >= 3) {
    insights.push("You're experiencing symptoms across multiple domains, which actually suggests systemic hormone imbalance rather than isolated issues. The good news? A comprehensive approach addressing the root cause will be most effective.");
  }
  
  // Age-specific insights
  if (userAge) {
    if (userAge >= 45 && userAge <= 55 && domainScores['sleep-thermo'] < 3) {
      insights.push(`At age ${userAge}, sleep and temperature symptoms are classic perimenopause indicators—and most women see significant improvement with targeted support. This is very treatable.`);
    }
    if (userAge >= 25 && userAge <= 35 && domainScores['cycle-patterns'] < 2.5) {
      insights.push(`Cycle irregularities at your age often indicate PCOS, thyroid issues, or stress-related hormone disruption. Root cause investigation is recommended—but knowing what's happening is the first step to getting it under control.`);
    }
  }
  
  return insights;
}
