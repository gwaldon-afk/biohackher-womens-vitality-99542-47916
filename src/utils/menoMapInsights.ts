/**
 * MenoMap Insight Generation Engine
 * Provides value-add analysis beyond just restating symptoms
 */

export interface SymptomAnswers {
  stage?: string;
  hrt?: string;
  hot_flush?: number;
  sleep?: number;
  mood?: number;
  energy?: number;
  skin?: number;
}

export interface SymptomInterconnection {
  primary: string;
  secondary: string;
  mechanism: string;
  impact: string;
}

export interface BiologicalInsight {
  stage: string;
  mechanism: string;
  timeline: string;
  context: string;
}

export interface NextPhaseInsight {
  timeline: string;
  likelySymptoms: string[];
  preparation: string;
}

export interface ProtocolRecommendation {
  intervention: string;
  rationale: string;
  timing: string;
  evidenceLevel: string;
  researchLink?: string;
}

export interface DeficiencySignal {
  nutrient: string;
  confidence: string;
  indicators: string[];
  recommendation: string;
}

/**
 * Analyzes how symptoms interconnect and create feedback loops
 */
export function analyzeSymptomInterconnections(answers: SymptomAnswers): SymptomInterconnection[] {
  const interconnections: SymptomInterconnection[] = [];
  
  const sleep = answers.sleep || 5;
  const hotFlush = answers.hot_flush || 5;
  const energy = answers.energy || 5;
  const mood = answers.mood || 5;
  const skin = answers.skin || 5;

  // Sleep → Hot Flashes feedback loop (HIGH hot flush = frequent)
  if (sleep < 5 && hotFlush >= 6) {
    interconnections.push({
      primary: 'Sleep disruption',
      secondary: 'Hot flashes',
      mechanism: 'Poor sleep increases cortisol, which amplifies vasomotor instability',
      impact: 'Creates a reinforcing cycle where each worsens the other'
    });
  }

  // Hot Flashes → Energy cascade (HIGH hot flush = frequent)
  if (hotFlush >= 6 && energy < 5) {
    interconnections.push({
      primary: 'Frequent hot flashes',
      secondary: 'Low energy',
      mechanism: 'Night sweats fragment sleep architecture, reducing REM and deep sleep recovery',
      impact: 'Your body never fully recharges, leading to daytime exhaustion'
    });
  }

  // Sleep → Mood connection
  if (sleep < 4 && mood < 5) {
    interconnections.push({
      primary: 'Poor sleep quality',
      secondary: 'Mood instability',
      mechanism: 'Sleep deprivation reduces serotonin production and increases inflammatory markers',
      impact: 'Emotional regulation becomes harder, amplifying stress responses'
    });
  }

  // Energy → Skin aging link
  if (energy < 4 && skin < 5) {
    interconnections.push({
      primary: 'Low energy levels',
      secondary: 'Skin aging',
      mechanism: 'Chronic fatigue signals elevated cortisol, which breaks down collagen faster',
      impact: 'Accelerated visible aging and slower skin repair'
    });
  }

  // Mood → Multiple symptoms amplifier
  if (mood < 4) {
    interconnections.push({
      primary: 'Mood dysregulation',
      secondary: 'Overall symptom severity',
      mechanism: 'Stress and low mood increase systemic inflammation via cytokine activation',
      impact: 'All other symptoms feel more intense and harder to manage'
    });
  }

  return interconnections;
}

/**
 * Explains the biological mechanisms happening at this stage
 */
export function identifyBiologicalMechanisms(answers: SymptomAnswers, stage: string): BiologicalInsight {
  const stageInsights: Record<string, BiologicalInsight> = {
    'pre': {
      stage: 'Pre-Menopause',
      mechanism: 'Your ovaries are still producing consistent estrogen and progesterone. Any symptoms you\'re experiencing are likely lifestyle or stress-related rather than hormonal decline.',
      timeline: 'You may remain in this stage for many years, or begin transitioning in your 40s',
      context: 'This is the optimal window for establishing protective habits - what you do now significantly impacts your transition experience later'
    },
    'early-peri': {
      stage: 'Early Perimenopause',
      mechanism: 'Progesterone begins dropping first, reducing GABA (your brain\'s calming neurotransmitter) and making you more sensitive to stress. Estrogen still fluctuates high at times, creating erratic cycles.',
      timeline: 'Early perimenopause typically lasts 2-4 years before progressing',
      context: 'Your body is recalibrating, not failing. Supporting GABA production and stress resilience is key'
    },
    'mid-peri': {
      stage: 'Mid Perimenopause',
      mechanism: 'Estrogen now swings wildly - sometimes surging higher than ever, then crashing low. These dramatic fluctuations trigger vasomotor symptoms (hot flashes) and disrupt your hypothalamus\'s temperature control.',
      timeline: 'You\'re approximately 2-4 years from your final period',
      context: 'This is typically the most symptomatic phase, but it\'s temporary. Stabilizing these swings is the priority'
    },
    'late-peri': {
      stage: 'Late Perimenopause',
      mechanism: 'Estrogen is now consistently low with rare surges. Your body is adapting to produce estrogen from fat tissue and adrenal glands instead of ovaries. Progesterone is nearly absent.',
      timeline: 'You\'re 6-18 months from your final period',
      context: 'Supporting your adrenal glands and optimizing body composition helps your new estrogen production pathways'
    },
    'post': {
      stage: 'Post-Menopause',
      mechanism: 'Estrogen stabilizes at a lower baseline (about 10-20% of peak levels). Your body has adapted to produce estrogen through aromatase enzymes in fat and muscle tissue. Testosterone becomes relatively more influential.',
      timeline: 'This is your new permanent baseline',
      context: 'Focus shifts to long-term protective strategies: bone density, cardiovascular health, and metabolic optimization'
    }
  };

  return stageInsights[stage] || stageInsights['pre'];
}

/**
 * Predicts what's likely to happen next based on current pattern
 */
export function predictNextPhase(answers: SymptomAnswers, stage: string): NextPhaseInsight {
  const sleep = answers.sleep || 5;
  const hotFlush = answers.hot_flush || 5;
  const energy = answers.energy || 5;

  const predictions: Record<string, NextPhaseInsight> = {
    'pre': {
      timeline: 'Next 2-5 years',
      likelySymptoms: [
        'Subtle cycle irregularities (shorter or longer)',
        'Occasional night sweats or sleep disturbances',
        'Increased PMS intensity'
      ],
      preparation: 'Start tracking your cycles now to establish a baseline. When changes begin, you\'ll notice them immediately'
    },
    'early-peri': {
      timeline: 'Next 6-18 months',
      likelySymptoms: hotFlush < 3 
        ? ['Hot flashes may begin or intensify', 'Sleep disruption may worsen', 'Mood swings may become more pronounced']
        : ['Current symptoms may intensify before stabilizing', 'Cycle irregularity will increase', 'Brain fog may emerge'],
      preparation: sleep < 5 
        ? 'Prioritize sleep optimization NOW - it will help buffer against worsening symptoms'
        : 'Your good sleep is protective. Focus on maintaining it as symptoms progress'
    },
    'mid-peri': {
      timeline: 'Next 12-24 months',
      likelySymptoms: [
        'Symptoms typically peak in this phase before improving',
        'Periods may skip months then return',
        'Joint pain and muscle loss may become noticeable'
      ],
      preparation: 'Start strength training if you haven\'t - muscle mass declines rapidly in late peri and preserving it now is crucial'
    },
    'late-peri': {
      timeline: 'Next 6-12 months',
      likelySymptoms: [
        'Hot flashes often improve as estrogen stabilizes low',
        'Energy may initially worsen then gradually improve',
        'Cardiovascular and bone changes accelerate'
      ],
      preparation: 'This is the critical window for bone density testing and cardiovascular baseline markers'
    },
    'post': {
      timeline: 'Ongoing long-term',
      likelySymptoms: [
        'Symptoms gradually decrease over 2-5 years post-menopause',
        'Metabolic rate continues slowing',
        'Bone loss rates highest in first 5 years post-menopause'
      ],
      preparation: 'Focus on longevity optimization: maintain muscle mass, monitor bone density, optimize metabolic health'
    }
  };

  return predictions[stage] || predictions['pre'];
}

/**
 * Generates specific protocol preview based on symptom cluster
 */
export function generatePersonalizedProtocolPreview(answers: SymptomAnswers): ProtocolRecommendation[] {
  const recommendations: ProtocolRecommendation[] = [];
  
  // Hot flash interventions - Multiple modalities (HIGH score = frequent hot flashes)
  if (answers.hot_flush && answers.hot_flush >= 6) {
    recommendations.push({
      intervention: 'Cold Exposure Protocol',
      rationale: 'Cold showers or ice packs on wrists/neck trigger norepinephrine release, which helps regulate your thermostat and reduce hot flash frequency by 40-60%.',
      timing: 'Morning cold shower (2-3 min) or ice pack when hot flash begins',
      evidenceLevel: 'Moderate evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/27806211/'
    });
    
    // Only suggest EPO if NOT on HRT
    if (answers.hrt !== 'Yes') {
      recommendations.push({
        intervention: 'Evening Primrose Oil + Vitamin E',
        rationale: 'Your hot flash pattern suggests omega-6 fatty acid deficiency. EPO contains GLA which supports prostaglandin balance, while vitamin E stabilizes cell membranes.',
        timing: 'Take with dinner for overnight support',
        evidenceLevel: 'Strong clinical evidence',
        researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23695307/'
      });
    }
  }
  
  // Sleep interventions - Behavioral + Supplement (LOW score = poor sleep)
  if (answers.sleep && answers.sleep <= 5) {
    recommendations.push({
      intervention: 'Sleep Compression Protocol',
      rationale: 'Your sleep disruption suggests sleep drive mismatch. Restricting bed time to 6 hours initially rebuilds sleep pressure and consolidates sleep architecture.',
      timing: 'Bed at 11pm, wake at 5am for 2 weeks, then gradually expand',
      evidenceLevel: 'Strong clinical evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/22550013/'
    });
    recommendations.push({
      intervention: 'Magnesium Glycinate 400mg',
      rationale: 'Supports GABA production and regulates cortisol rhythm to prevent early morning waking.',
      timing: '9pm (before cortisol spike window)',
      evidenceLevel: 'Strong clinical evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23853635/'
    });
  }
  
  // Mood interventions - Mind-body + Adaptogen (LOW score = poor mood)
  if (answers.mood && answers.mood <= 5) {
    recommendations.push({
      intervention: 'Heart Rate Variability Breathing',
      rationale: '5-6 breaths per minute activates vagal tone and shifts autonomic balance from sympathetic to parasympathetic, reducing anxiety by 50% in 8 weeks.',
      timing: '10 minutes upon waking and before bed',
      evidenceLevel: 'Strong clinical evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/28906496/'
    });
    
    // Only suggest Ashwagandha if NOT on HRT
    if (answers.hrt !== 'Yes') {
      recommendations.push({
        intervention: 'Ashwagandha KSM-66',
        rationale: 'Modulates HPA axis and supports GABA receptor sensitivity to counter cortisol-progesterone interference.',
        timing: 'Morning and 4pm (cortisol regulation windows)',
        evidenceLevel: 'Strong clinical evidence',
        researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23439798/'
      });
    }
  }
  
  // Energy interventions - Movement + Mitochondrial support (LOW score = low energy)
  if (answers.energy && answers.energy <= 5) {
    recommendations.push({
      intervention: 'Zone 2 Cardio Protocol',
      rationale: 'Your energy levels suggest mitochondrial support could help. 30-45min at conversational pace 3x/week increases mitochondrial density by 40% in 8 weeks.',
      timing: 'Morning or early afternoon (before 3pm)',
      evidenceLevel: 'Strong clinical evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/24149627/'
    });
    recommendations.push({
      intervention: 'CoQ10 + B-Complex',
      rationale: 'Supports mitochondrial ATP production and methylation pathways for hormone metabolism.',
      timing: 'With breakfast for sustained energy',
      evidenceLevel: 'Moderate clinical evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23970941/'
    });
  }
  
  // Skin interventions - Lifestyle + Supplement (LOW score = skin concerns)
  if (answers.skin && answers.skin <= 5) {
    recommendations.push({
      intervention: 'Red Light Therapy (660nm + 850nm)',
      rationale: 'Stimulates collagen synthesis via mitochondrial photobiomodulation, increasing dermal thickness by 15-20% in 12 weeks.',
      timing: '10-15 minutes daily, morning or evening',
      evidenceLevel: 'Emerging evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/31633300/'
    });
    recommendations.push({
      intervention: 'Marine Collagen + Hyaluronic Acid',
      rationale: 'Type I marine collagen provides bioavailable peptides while HA supports dermal hydration as estrogen declines.',
      timing: 'Morning on empty stomach for optimal absorption',
      evidenceLevel: 'Moderate evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/26362110/'
    });
  }
  
  // Always include foundational recommendations for hormonal health
  if (recommendations.length < 3) {
    recommendations.push({
      intervention: 'Resistance Training 3x/week',
      rationale: 'Essential for perimenopause: preserves muscle mass (declining 3-8%/year), supports bone density, improves insulin sensitivity, and reduces inflammation.',
      timing: 'Any consistent schedule - intensity matters more than duration',
      evidenceLevel: 'Strong clinical evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/24149627/'
    });
    
    if (answers.hrt !== 'Yes') {
      recommendations.push({
        intervention: 'Phytoestrogen-Rich Foods',
        rationale: 'Ground flaxseed, soy, chickpeas provide plant compounds that support hormonal balance during transition.',
        timing: 'Daily intake - 1-2 tbsp ground flax or 1 serving soy',
        evidenceLevel: 'Moderate evidence',
        researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23695307/'
      });
    }
    
    recommendations.push({
      intervention: 'Mediterranean-Style Eating',
      rationale: 'Anti-inflammatory diet pattern shown to reduce menopausal symptoms by 30% and support cardiovascular health.',
      timing: 'Focus on vegetables, fatty fish, olive oil, whole grains',
      evidenceLevel: 'Strong clinical evidence',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/28906496/'
    });
  }
  
  return recommendations.slice(0, 6);
}

/**
 * Identifies nutrient deficiency patterns from symptom clusters
 */
export function calculateDeficiencySignals(answers: SymptomAnswers): DeficiencySignal[] {
  const signals: DeficiencySignal[] = [];
  
  const sleep = answers.sleep || 5;
  const hotFlush = answers.hot_flush || 5;
  const energy = answers.energy || 5;
  const skin = answers.skin || 5;
  const mood = answers.mood || 5;

  // Magnesium (sleep + mood)
  if (sleep < 5 && mood < 5) {
    signals.push({
      nutrient: 'Magnesium',
      confidence: 'High',
      indicators: ['Poor sleep', 'Mood instability', 'Muscle tension'],
      recommendation: 'Magnesium glycinate 400-600mg daily. Avoid oxide form (poorly absorbed)'
    });
  }

  // Omega-3 (hot flashes + mood) - HIGH hot flush score = frequent
  if (hotFlush >= 6 || (mood < 5 && energy < 5)) {
    signals.push({
      nutrient: 'Omega-3 fatty acids',
      confidence: 'Moderate-High',
      indicators: ['Vasomotor symptoms', 'Inflammation markers', 'Mood dysregulation'],
      recommendation: 'EPA/DHA 2000-3000mg from quality fish oil. Look for IFOS certification'
    });
  }

  // Vitamin D (energy + mood + bone)
  if (energy < 5 && mood < 5) {
    signals.push({
      nutrient: 'Vitamin D',
      confidence: 'Moderate',
      indicators: ['Fatigue', 'Low mood', 'Age-related bone concerns'],
      recommendation: 'Test levels first (optimal: 50-80 ng/mL). Supplement 2000-4000 IU daily with K2'
    });
  }

  // B vitamins (energy + brain fog)
  if (energy < 4) {
    signals.push({
      nutrient: 'B-complex vitamins',
      confidence: 'Moderate',
      indicators: ['Persistent fatigue', 'Potential cognitive impacts'],
      recommendation: 'Activated B-complex with methylated folate. Supports energy production and hormone metabolism'
    });
  }

  // Vitamin E + phytoestrogens (hot flashes + skin) - HIGH hot flush = frequent
  if (hotFlush >= 7 && skin < 5) {
    signals.push({
      nutrient: 'Vitamin E + Phytoestrogens',
      confidence: 'Moderate',
      indicators: ['Severe hot flashes', 'Skin changes', 'Estrogen fluctuation'],
      recommendation: 'Mixed tocopherols 400 IU + dietary phytoestrogens (flax, soy, chickpeas)'
    });
  }

  return signals;
}

/**
 * Generates comparative context based on research data
 */
export function generateComparativeContext(answers: SymptomAnswers, stage: string): {
  statistics: string[];
  timeline: string;
} {
  const hotFlush = answers.hot_flush || 5;
  const sleep = answers.sleep || 5;

  const stats: string[] = [];

  if (stage === 'mid-peri' && hotFlush >= 6) {
    stats.push('75% of women with your symptom profile experience hot flashes in this phase');
    stats.push('Average duration: 7-10 years, but intensity typically peaks in years 1-3');
  }

  if (sleep < 4) {
    stats.push('Sleep disruption affects 40-60% of women in perimenopause');
    stats.push('Women who address sleep early show 50% better symptom outcomes overall');
  }

  if (stage === 'late-peri') {
    stats.push('Late perimenopause lasts 6-24 months for most women');
    stats.push('Bone loss accelerates 2-5x in the 2 years before final period');
  }

  return {
    statistics: stats,
    timeline: getTypicalTimeline(stage)
  };
}

function getTypicalTimeline(stage: string): string {
  const timelines: Record<string, string> = {
    'pre': 'Pre-menopause can last until your 40s or early 50s',
    'early-peri': 'Early perimenopause typically lasts 2-4 years',
    'mid-peri': 'Mid perimenopause lasts 1-3 years on average, with highest symptom intensity',
    'late-peri': 'Late perimenopause: 6-24 months until final period',
    'post': 'Post-menopause is permanent. Most symptoms improve within 2-5 years'
  };
  return timelines[stage] || '';
}
