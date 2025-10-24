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
  category: 'supplement' | 'therapy' | 'lifestyle' | 'exercise' | 'testing';
  addressesInsight: string;
  howItHelps: string;
  rationale: string;
  timing: string;
  evidenceLevel: string;
  researchLink?: string;
}

export interface HealthInsight {
  title: string;
  category: 'Hormonal' | 'Metabolic' | 'Cardiovascular' | 'Bone Health' | 'Nutritional' | 'Sleep & Circadian' | 'Cognitive & Mental' | 'Gut Health';
  severity: 'low' | 'moderate' | 'high' | 'critical';
  description: string;
  physiologyExplanation: string;
  systemImpact: string[];
  cascadeEffect?: string;
  whyThisMatters: string;
  indicators: string[];
  testingSuggested?: string;
  urgency: 'routine' | 'soon' | 'priority';
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
  
  // BASELINE SUPPLEMENTS
  recommendations.push({
    intervention: 'Vitamin D3 (2000-4000 IU) + K2 (100mcg)',
    category: 'supplement',
    addressesInsight: 'Bone Density Preservation',
    howItHelps: 'Vitamin D supports calcium absorption and bone mineralization. K2 directs calcium to bones rather than soft tissues, preventing arterial calcification while supporting skeletal health.',
    rationale: 'Foundational for bone health, immune function, and mood regulation during hormonal transition.',
    timing: 'Morning with fats for absorption',
    evidenceLevel: 'Strong',
    researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23853635/'
  });
  
  recommendations.push({
    intervention: 'Omega-3 Fish Oil (EPA/DHA 2000mg)',
    category: 'supplement',
    addressesInsight: 'Cardiovascular Protection Priority',
    howItHelps: 'EPA and DHA reduce inflammatory cytokines, improve endothelial function, and support membrane fluidity in brain cells—directly addressing the loss of estrogen\'s anti-inflammatory effects.',
    rationale: 'Anti-inflammatory baseline support for cardiovascular health, brain function, and reducing overall menopausal symptom severity.',
    timing: 'With largest meal of the day',
    evidenceLevel: 'Strong',
    researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23695307/'
  });
  
  recommendations.push({
    intervention: 'Magnesium Glycinate (300-400mg)',
    category: 'supplement',
    addressesInsight: 'Estrogen-Progesterone Imbalance Pattern',
    howItHelps: 'Magnesium enhances GABA-A receptor sensitivity, compensating for reduced receptor activity caused by progesterone decline. Also acts as a cofactor in over 300 enzymatic reactions including hormone synthesis.',
    rationale: 'Supports sleep, muscle function, bone health, and stress response.',
    timing: 'Evening, 1-2 hours before bed',
    evidenceLevel: 'Strong',
    researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23853635/'
  });
  
  // SYMPTOM-SPECIFIC ADDITIONS
  
  // Hot flash interventions
  if (answers.hot_flush && answers.hot_flush >= 6) {
    recommendations.push({
      intervention: 'Cold Exposure Protocol',
      category: 'therapy',
      addressesInsight: 'Thermoregulation Disruption',
      howItHelps: 'Cold exposure triggers norepinephrine release and resets the hypothalamic thermostat that has become hypersensitive due to estrogen decline.',
      rationale: 'Reduces hot flash frequency by 40-60% through hypothalamic temperature recalibration.',
      timing: 'Morning cold shower (2-3 min) or ice pack when hot flash begins',
      evidenceLevel: 'Moderate',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/27806211/'
    });
    
    if (answers.hrt !== 'Yes') {
      recommendations.push({
        intervention: 'Evening Primrose Oil (1300mg) + Vitamin E (400 IU)',
        category: 'supplement',
        addressesInsight: 'Thermoregulation Disruption',
        howItHelps: 'GLA from evening primrose oil supports prostaglandin balance, while vitamin E stabilizes cell membranes to reduce vasomotor instability.',
        rationale: 'Targeted for hot flashes through prostaglandin modulation.',
        timing: 'With dinner for overnight support',
        evidenceLevel: 'Strong',
        researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23695307/'
      });
    }
  }
  
  // Sleep-specific additions
  if (answers.sleep && answers.sleep <= 5) {
    recommendations.push({
      intervention: 'Sleep Compression Protocol',
      category: 'lifestyle',
      addressesInsight: 'Sleep Architecture Disruption',
      howItHelps: 'Restricting bed time rebuilds sleep drive by increasing adenosine pressure, then gradually expanding allows consolidation of sleep phases disrupted by hormonal fluctuations.',
      rationale: 'Addresses sleep fragmentation through homeostatic sleep pressure recalibration.',
      timing: 'Bed at 11pm, wake at 5am for 2 weeks, then gradually expand',
      evidenceLevel: 'Strong',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/22550013/'
    });
    
    recommendations.push({
      intervention: 'L-Theanine (200mg) + GABA (500mg)',
      category: 'supplement',
      addressesInsight: 'Estrogen-Progesterone Imbalance Pattern',
      howItHelps: 'L-theanine increases alpha brain waves for relaxation while GABA directly supplements the neurotransmitter depleted by low progesterone.',
      rationale: 'Promotes relaxation without sedation and supports deep sleep phases.',
      timing: '30 minutes before bed',
      evidenceLevel: 'Moderate',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23853635/'
    });
  }
  
  // Mood-specific additions
  if (answers.mood && answers.mood <= 5) {
    recommendations.push({
      intervention: 'Heart Rate Variability Breathing',
      category: 'lifestyle',
      addressesInsight: 'Stress Response System Overload',
      howItHelps: 'Resonant frequency breathing at 5-6 breaths/minute maximizes heart rate variability, activating vagal tone to calm the overactive stress response triggered by hormonal instability.',
      rationale: 'Reduces anxiety by 50% in 8 weeks through HPA axis modulation.',
      timing: '10 minutes upon waking and before bed',
      evidenceLevel: 'Strong',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/28906496/'
    });
    
    if (answers.hrt !== 'Yes') {
      recommendations.push({
        intervention: 'Ashwagandha KSM-66 (600mg)',
        category: 'supplement',
        addressesInsight: 'Cortisol Dysregulation Pattern',
        howItHelps: 'Ashwagandha modulates cortisol output and supports GABA receptor sensitivity, addressing both the HPA axis overactivity and neurotransmitter disruption from hormonal changes.',
        rationale: 'Adaptogen that modulates HPA axis and supports GABA receptor sensitivity.',
        timing: 'Split dose: 300mg morning, 300mg at 4pm',
        evidenceLevel: 'Strong',
        researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23439798/'
      });
    }
  }
  
  // Energy-specific additions
  if (answers.energy && answers.energy <= 5) {
    recommendations.push({
      intervention: 'Zone 2 Cardio Protocol',
      category: 'exercise',
      addressesInsight: 'Metabolic Health Optimization',
      howItHelps: 'Zone 2 training (conversational pace) specifically targets mitochondrial biogenesis, increasing the number and efficiency of energy-producing mitochondria to counter the metabolic slowdown from estrogen decline.',
      rationale: 'Increases energy capacity by 40% through mitochondrial optimization.',
      timing: 'Morning or early afternoon (before 3pm)',
      evidenceLevel: 'Strong',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/24149627/'
    });
    
    recommendations.push({
      intervention: 'CoQ10 (200mg) + B-Complex',
      category: 'supplement',
      addressesInsight: 'Metabolic Health Optimization',
      howItHelps: 'CoQ10 supports the electron transport chain in mitochondria for ATP production. B-vitamins serve as cofactors in energy metabolism and support methylation needed for hormone processing.',
      rationale: 'Mitochondrial and energy support beyond baseline.',
      timing: 'With breakfast',
      evidenceLevel: 'Moderate',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23970941/'
    });
    
    recommendations.push({
      intervention: 'Iron Panel Testing',
      category: 'testing',
      addressesInsight: 'Iron Status Assessment',
      howItHelps: 'Validates whether fatigue stems from iron depletion (common from heavy periods) before supplementation, as excess iron can be harmful.',
      rationale: 'Test ferritin, TIBC, serum iron before supplementing.',
      timing: 'Fasting morning blood draw',
      evidenceLevel: 'Standard Practice',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/23970941/'
    });
  }
  
  // Skin-specific additions
  if (answers.skin && answers.skin <= 5) {
    recommendations.push({
      intervention: 'Red Light Therapy (660nm + 850nm)',
      category: 'therapy',
      addressesInsight: 'Skin Aging Acceleration',
      howItHelps: 'Red and near-infrared light stimulates mitochondria in skin cells (photobiomodulation), increasing collagen synthesis and dermal thickness to counter estrogen\'s declining collagen support.',
      rationale: 'Increases dermal thickness by 15-20% in 12 weeks.',
      timing: '10-15 minutes daily, face and neck',
      evidenceLevel: 'Emerging',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/31633300/'
    });
    
    recommendations.push({
      intervention: 'Marine Collagen (10g) + Hyaluronic Acid (200mg)',
      category: 'supplement',
      addressesInsight: 'Skin Aging Acceleration',
      howItHelps: 'Type I marine collagen provides bioavailable peptides that serve as building blocks for dermal collagen synthesis. Hyaluronic acid supports hydration and dermal volume.',
      rationale: 'Targeted skin support with bioavailable peptides.',
      timing: 'Morning on empty stomach for optimal absorption',
      evidenceLevel: 'Moderate',
      researchLink: 'https://pubmed.ncbi.nlm.nih.gov/26362110/'
    });
  }
  
  // FOUNDATIONAL EXERCISE
  recommendations.push({
    intervention: 'Resistance Training (3x/week, 20-30min)',
    category: 'exercise',
    addressesInsight: 'Metabolic Health Optimization',
    howItHelps: 'Muscle contraction activates GLUT4 transporters independent of insulin, directly improving glucose uptake. Also preserves muscle mass that naturally declines with estrogen loss, maintaining metabolic rate.',
    rationale: 'Non-negotiable for hormonal health. Preserves muscle mass, supports bone density, improves insulin sensitivity.',
    timing: 'Any consistent schedule - intensity matters more than duration',
    evidenceLevel: 'Strong',
    researchLink: 'https://pubmed.ncbi.nlm.nih.gov/24149627/'
  });
  
  return recommendations;
}

/**
 * Comprehensive health insights - PHYSIOLOGY-FOCUSED (no recommendations)
 */
export function calculateHealthInsights(answers: SymptomAnswers): HealthInsight[] {
  const insights: HealthInsight[] = [];
  
  const sleep = answers.sleep || 5;
  const hotFlush = answers.hot_flush || 5;
  const energy = answers.energy || 5;
  const skin = answers.skin || 5;
  const mood = answers.mood || 5;
  const stage = answers.stage || 'pre';

  // === HORMONAL PATTERNS ===
  
  // Estrogen-Progesterone Imbalance
  if (stage === 'early-peri' && mood < 5 && sleep < 5) {
    insights.push({
      title: 'Estrogen-Progesterone Imbalance Pattern',
      category: 'Hormonal',
      severity: 'moderate',
      description: 'Your progesterone levels are declining faster than estrogen, creating an imbalance.',
      physiologyExplanation: 'During early perimenopause, progesterone drops 80-90% while estrogen remains relatively high. This creates a hormonal imbalance that disrupts GABA receptor sensitivity in your brain\'s limbic system. GABA is your primary calming neurotransmitter, so reduced receptor sensitivity leads to heightened anxiety, racing thoughts, and fragmented sleep—especially in the second half of your menstrual cycle when progesterone should be highest.',
      systemImpact: [
        'Sleep Architecture: Reduced deep sleep (Stage 3) and frequent awakenings',
        'Mood Regulation: Decreased GABA activity increases anxiety and irritability',
        'HPA Axis: Progesterone normally buffers cortisol; without it, stress response amplifies',
        'Thermoregulation: Loss of progesterone\'s cooling effect contributes to night sweats'
      ],
      cascadeEffect: 'Low progesterone → Poor sleep → Elevated morning cortisol → Cortisol blocks progesterone receptors → Progesterone becomes less effective → Cycle worsens',
      whyThisMatters: 'This explains why your anxiety, sleep issues, and mood swings often cluster together and worsen with stress. It\'s not multiple separate problems—it\'s one hormonal cascade.',
      indicators: ['Mood instability', 'Sleep disruption', 'Early perimenopause stage'],
      testingSuggested: 'Day 21 progesterone (if still cycling) or DUTCH test for metabolites',
      urgency: 'soon'
    });
  }

  // Cortisol Dysregulation
  if (energy < 4 && mood < 4 && sleep < 4) {
    insights.push({
      title: 'Cortisol Dysregulation Pattern',
      category: 'Hormonal',
      severity: 'high',
      description: 'Your HPA axis (stress response system) is showing signs of dysregulation.',
      physiologyExplanation: 'Declining estrogen and progesterone destabilize the HPA axis—your body\'s stress control center. Normally, estrogen modulates cortisol receptors and progesterone buffers cortisol\'s effects. Without this hormonal cushion, your HPA axis becomes hyperreactive, producing excess cortisol in response to even minor stressors. Chronic elevated cortisol then disrupts sleep (blocks melatonin), depletes serotonin (worsens mood), and impairs mitochondrial function (reduces energy).',
      systemImpact: [
        'Energy Production: Elevated cortisol impairs mitochondrial efficiency, causing "tired but wired" feeling',
        'Sleep Regulation: High evening cortisol blocks melatonin release, preventing deep sleep onset',
        'Mood & Cognition: Excess cortisol reduces hippocampal neurogenesis and serotonin availability',
        'Immune Function: Chronic cortisol elevation suppresses immune response',
        'Body Composition: Cortisol promotes visceral fat storage and muscle breakdown'
      ],
      cascadeEffect: 'Hormonal decline → HPA hyperreactivity → Elevated cortisol → Poor sleep → More stress sensitivity → Further HPA dysregulation',
      whyThisMatters: 'This is why you might feel exhausted yet unable to sleep, anxious without clear cause, and reactive to stressors that didn\'t bother you before. Your stress system has lost its hormonal buffers.',
      indicators: ['Persistent fatigue', 'Mood dysregulation', 'Sleep disruption', 'Multiple system impact'],
      testingSuggested: '4-point salivary cortisol test',
      urgency: 'priority'
    });
  }

  // Thermoregulation Disruption
  if (hotFlush >= 6) {
    insights.push({
      title: 'Thermoregulation Disruption',
      category: 'Hormonal',
      severity: 'moderate',
      description: 'Your hypothalamic thermostat has become hypersensitive due to estrogen fluctuations.',
      physiologyExplanation: 'Estrogen normally keeps your hypothalamic thermoneutral zone (the temperature range your body considers "normal") stable and wide. As estrogen fluctuates wildly or drops, this zone narrows dramatically—from about 4°C down to 0.1°C. Even tiny temperature changes now trigger emergency cooling responses (vasodilation, sweating). Your body isn\'t malfunctioning; it\'s overreacting to normal temperature variations because its internal thermostat has been recalibrated by unstable estrogen.',
      systemImpact: [
        'Vasomotor Control: Sudden vasodilation causes skin flushing and heat waves',
        'Sleep Architecture: Night sweats fragment sleep, reducing REM and deep sleep recovery',
        'Autonomic Balance: Frequent hot flashes indicate sympathetic nervous system dominance',
        'Quality of Life: Unpredictable episodes cause anticipatory anxiety and social disruption'
      ],
      cascadeEffect: 'Estrogen fluctuation → Narrow thermoneutral zone → Hot flash triggered → Sleep disrupted → Elevated cortisol → More hot flashes',
      whyThisMatters: 'Hot flashes aren\'t just discomfort—they signal your hypothalamus struggling to maintain temperature homeostasis without stable estrogen. Addressing them improves not just comfort but sleep quality and stress resilience.',
      indicators: ['Frequent hot flashes', 'Night sweats', stage],
      testingSuggested: 'Symptom diary to identify triggers (stress, alcohol, spicy food)',
      urgency: 'soon'
    });
  }

  // === METABOLIC PATTERNS ===
  
  // Insulin Sensitivity Shift
  if (stage !== 'pre' && energy < 5) {
    const bmiStr = localStorage.getItem('menomap_bmi');
    const bmi = bmiStr ? parseFloat(bmiStr) : null;
    
    if (bmi && bmi > 27) {
      insights.push({
        title: 'Insulin Sensitivity Shift',
        category: 'Metabolic',
        severity: 'moderate',
        description: 'Estrogen decline is affecting your glucose metabolism and energy production.',
        physiologyExplanation: 'Estrogen acts as an insulin sensitizer—it helps your cells respond efficiently to insulin\'s signal to take up glucose. As estrogen declines, your cells become more resistant to insulin, requiring your pancreas to produce 2-3x more insulin to maintain blood sugar control. This hyperinsulinemia promotes fat storage (especially visceral abdominal fat), increases inflammation (via IL-6 and TNF-α), and can drive cravings for quick-energy foods as your cells struggle to access their fuel efficiently.',
        systemImpact: [
          'Energy Production: Cells struggle to use glucose efficiently, leading to fatigue despite adequate food intake',
          'Body Composition: Insulin resistance promotes visceral fat accumulation and muscle loss',
          'Inflammation: Elevated insulin triggers inflammatory cascade affecting all systems',
          'Appetite Regulation: Disrupted leptin signaling increases hunger and cravings',
          'Cardiovascular Risk: Insulin resistance drives lipid abnormalities and blood pressure elevation'
        ],
        cascadeEffect: 'Estrogen decline → Insulin resistance → Hyperinsulinemia → Visceral fat gain → More inflammation → Worsened insulin resistance',
        whyThisMatters: 'This is why weight management becomes harder during perimenopause even without diet changes. Your cells are literally processing energy differently. Early intervention can prevent progression to prediabetes.',
        indicators: ['Weight gain', 'Energy changes', 'BMI >27', stage],
        testingSuggested: 'Fasting insulin, HbA1c, fasting glucose (metabolic panel)',
        urgency: 'soon'
      });
    }
  }

  // === CARDIOVASCULAR ===
  
  // Loss of Estrogen Cardioprotection
  if (stage === 'post' || stage === 'late-peri') {
    insights.push({
      title: 'Cardiovascular Protection Priority',
      category: 'Cardiovascular',
      severity: 'moderate',
      description: 'You\'ve lost estrogen\'s protective effects on your cardiovascular system.',
      physiologyExplanation: 'Estrogen is a powerful cardiovascular protector. It enhances nitric oxide production in blood vessel walls (improving vasodilation), reduces LDL oxidation, increases HDL, and has direct anti-inflammatory effects on the vascular endothelium. Post-menopause, without this protection, LDL cholesterol typically increases 10-15%, blood pressure rises, and arterial stiffness increases. Cardiovascular disease risk accelerates sharply in the first 10 years after menopause.',
      systemImpact: [
        'Vascular Function: Reduced nitric oxide leads to less flexible blood vessels and higher blood pressure',
        'Lipid Metabolism: LDL increases, HDL may decrease, triglycerides often rise',
        'Inflammation: Loss of estrogen\'s anti-inflammatory effects on vessel walls',
        'Plaque Formation: Accelerated atherosclerosis development',
        'Arrhythmia Risk: Changes in cardiac electrophysiology without estrogen modulation'
      ],
      whyThisMatters: 'Heart disease becomes the #1 health risk for women post-menopause, surpassing breast cancer. The first 10 years post-menopause are critical for establishing cardiovascular health practices.',
      indicators: ['Post-menopausal stage', 'Loss of estrogen cardioprotection'],
      testingSuggested: 'Lipid panel (including ApoB), hs-CRP, blood pressure monitoring, consider coronary calcium score',
      urgency: 'priority'
    });
  }

  // === BONE HEALTH ===
  
  // Accelerated Bone Remodeling
  if (stage === 'late-peri' || stage === 'post') {
    const bmiStr = localStorage.getItem('menomap_bmi');
    const bmi = bmiStr ? parseFloat(bmiStr) : null;
    const lowBMI = bmi && bmi < 20;
    
    insights.push({
      title: 'Bone Density Preservation',
      category: 'Bone Health',
      severity: lowBMI ? 'high' : 'moderate',
      description: 'You\'re in the critical window for bone loss acceleration.',
      physiologyExplanation: 'Estrogen normally inhibits osteoclasts (cells that break down bone) while supporting osteoblasts (cells that build bone). As estrogen drops, osteoclast activity surges while osteoblast function remains stable—tipping the balance heavily toward bone breakdown. Bone loss accelerates from the normal 0.5-1% per year to 2-5% per year in the first 5-7 years post-menopause. This is when most lifetime bone loss occurs—up to 20% of total bone density can be lost in this window.',
      systemImpact: [
        'Skeletal Strength: Rapid loss of trabecular (spongy) bone in spine and hips',
        'Fracture Risk: 10-20% of lifetime bone density lost in first 5-7 years post-menopause',
        'Calcium Homeostasis: Increased bone turnover markers visible in blood tests',
        'Recovery Capacity: Bone lost during this window is difficult to fully rebuild later'
      ],
      cascadeEffect: 'Estrogen decline → Osteoclast activation → Accelerated bone resorption → Declining bone density → Increased fracture risk',
      whyThisMatters: 'This is your critical intervention window. Bone density preservation efforts now prevent osteoporosis decades later. What you do in the next 5 years determines your skeletal health for life.',
      indicators: ['Late perimenopause/post-menopause', 'Rapid bone loss window', lowBMI ? 'Low BMI increases risk' : 'Standard risk profile'],
      testingSuggested: 'DEXA scan for bone density baseline, then every 2 years',
      urgency: lowBMI ? 'priority' : 'soon'
    });
  }

  // === SLEEP & CIRCADIAN ===
  
  // Sleep Architecture Disruption
  if (sleep < 4) {
    insights.push({
      title: 'Sleep Architecture Disruption',
      category: 'Sleep & Circadian',
      severity: 'high',
      description: 'Your sleep structure is significantly disrupted, impacting all other systems.',
      physiologyExplanation: 'Estrogen and progesterone normally regulate sleep architecture. Estrogen supports REM sleep (memory consolidation, emotional processing), while progesterone enhances deep sleep (physical restoration) through its metabolite allopregnanolone, which acts on GABA receptors. As these hormones decline, you experience more frequent awakenings, reduced time in deep and REM stages, and earlier morning wake times. Your body never completes full sleep cycles, preventing proper physical and cognitive restoration.',
      systemImpact: [
        'Cognitive Function: Reduced REM sleep impairs memory consolidation and emotional regulation',
        'Physical Restoration: Decreased deep sleep prevents muscle repair and growth hormone release',
        'Metabolic Health: Poor sleep worsens insulin resistance and increases hunger hormones',
        'Immune Function: Inadequate sleep reduces natural killer cell activity',
        'Mood Regulation: Sleep deprivation amplifies anxiety and depression'
      ],
      cascadeEffect: 'Hormone decline → Fragmented sleep → Elevated cortisol → More sleep disruption → All systems deteriorate',
      whyThisMatters: 'Sleep disruption isn\'t just a symptom—it\'s an amplifier that makes every other menopause symptom worse. Improving sleep quality can reduce overall symptom burden by 50%.',
      indicators: ['Severely disrupted sleep', 'Impacts all other systems'],
      testingSuggested: 'Sleep study if snoring/breathing issues present; otherwise focus on sleep hygiene optimization',
      urgency: 'priority'
    });
  }

  // === COGNITIVE & STRESS ===
  
  // Stress Response System Overload
  if (mood < 4 && (energy < 4 || sleep < 4)) {
    insights.push({
      title: 'Stress Response System Overload',
      category: 'Cognitive & Mental',
      severity: 'high',
      description: 'Your HPA axis and neurotransmitter systems are under significant strain.',
      physiologyExplanation: 'Estrogen normally enhances serotonin receptor density and modulates the HPA axis to keep stress responses proportional. Progesterone supports GABA production for calming effects. Without these hormonal buffers, your brain\'s stress response becomes hyperreactive—minor stressors trigger major responses. Simultaneously, serotonin and GABA levels decline, reducing your natural resilience. This creates a state of being "wired and tired"—anxious and reactive despite exhaustion.',
      systemImpact: [
        'Emotional Regulation: Reduced serotonin and GABA make mood swings more dramatic',
        'Stress Sensitivity: HPA axis overreacts to minor triggers without hormonal dampening',
        'Cognitive Function: Chronic stress impairs executive function and memory',
        'Physical Health: Elevated stress hormones drive inflammation and immune dysfunction',
        'Sleep Quality: Hyperarousal state prevents relaxation needed for sleep onset'
      ],
      whyThisMatters: 'Your stress response has lost its hormonal shock absorbers. What used to roll off your back now feels overwhelming. This isn\'t weakness—it\'s neurobiology adapting to a new hormonal environment.',
      indicators: ['Mood dysregulation', 'Energy/sleep impacts', 'HPA axis strain'],
      testingSuggested: '4-point cortisol test, consider neurotransmitter testing',
      urgency: 'priority'
    });
  }

  // === GUT-HORMONE AXIS ===
  
  // Estrogen Metabolism & Microbiome
  if (stage !== 'pre' && (mood < 5 || skin < 5)) {
    insights.push({
      title: 'Gut-Hormone Axis Optimization',
      category: 'Gut Health',
      severity: 'moderate',
      description: 'Your gut microbiome plays a crucial role in estrogen metabolism and overall hormonal balance.',
      physiologyExplanation: 'Your gut microbiome contains the "estrobolome"—bacteria that produce beta-glucuronidase enzyme, which regulates estrogen recirculation. These bacteria deconjugate estrogen in the gut, allowing reabsorption into circulation. Dysbiosis (microbial imbalance) can lead to either too much or too little estrogen recirculation. Additionally, gut bacteria produce short-chain fatty acids that modulate inflammation and influence the HPA axis. A healthy, diverse microbiome helps metabolize hormones efficiently and reduces systemic inflammation.',
      systemImpact: [
        'Hormone Recirculation: Gut bacteria regulate how much estrogen is reabsorbed vs. excreted',
        'Inflammation Control: Healthy microbiome produces anti-inflammatory compounds',
        'Mood Regulation: Gut bacteria produce neurotransmitter precursors (serotonin, GABA)',
        'Immune Function: 70% of immune system is gut-associated',
        'Nutrient Absorption: Microbiome health affects vitamin and mineral bioavailability'
      ],
      whyThisMatters: 'Your gut is a major player in hormone metabolism. Supporting gut health can improve how your body processes and maintains optimal hormone levels even during decline.',
      indicators: ['Hormonal transition', 'Gut metabolizes estrogen'],
      testingSuggested: 'Comprehensive stool test if digestive symptoms present',
      urgency: 'routine'
    });
  }

  // === SKIN & AGING ===
  
  // Skin Aging Acceleration
  if (skin < 5) {
    insights.push({
      title: 'Skin Aging Acceleration',
      category: 'Metabolic',
      severity: 'moderate',
      description: 'Declining estrogen is accelerating collagen breakdown in your skin.',
      physiologyExplanation: 'Estrogen stimulates fibroblasts in the dermis to produce collagen and elastin while inhibiting collagenase (the enzyme that breaks them down). As estrogen declines, collagen production drops 30% in the first 5 years post-menopause, while collagenase activity increases. Skin becomes thinner, less elastic, and more prone to wrinkles. Additionally, reduced estrogen means less hyaluronic acid production, decreasing dermal hydration and volume. This isn\'t just cosmetic—skin health reflects overall tissue health throughout your body.',
      systemImpact: [
        'Dermal Structure: 30% collagen loss in first 5 years post-menopause',
        'Hydration: Reduced hyaluronic acid production decreases skin moisture',
        'Barrier Function: Thinner epidermis compromises protective barrier',
        'Wound Healing: Slower skin repair and recovery from injury',
        'Overall Connective Tissue: Skin changes mirror collagen loss in joints, ligaments'
      ],
      whyThisMatters: 'While skin aging is visible, it reflects systemic collagen changes throughout your body—including joints, blood vessels, and bones. Supporting skin health supports overall connective tissue integrity.',
      indicators: ['Skin changes', 'Collagen decline', stage],
      testingSuggested: 'Skin changes are clinical; focus on interventions rather than testing',
      urgency: 'routine'
    });
  }

  // Sort by urgency and severity
  const urgencyOrder = { priority: 0, soon: 1, routine: 2 };
  const severityOrder = { critical: 0, high: 1, moderate: 2, low: 3 };
  
  insights.sort((a, b) => {
    const urgencyA = urgencyOrder[a.urgency || 'routine'];
    const urgencyB = urgencyOrder[b.urgency || 'routine'];
    if (urgencyA !== urgencyB) return urgencyA - urgencyB;
    
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return insights;
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
