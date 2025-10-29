import { Brain, Activity, Heart, Sparkles, Settings, LucideIcon } from "lucide-react";

export interface TriageTheme {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  pillar: string;
  imagePath: string;
  symptomIds: string[];
  protocolHighlights: string[];
  cta: string;
  estimatedTime: string;
}

export const TRIAGE_THEMES: Record<string, TriageTheme> = {
  brain: {
    id: 'brain',
    title: 'Brain',
    subtitle: 'Cognitive clarity, focus & mental resilience',
    description: 'Optimize your cognitive function, mental clarity, mood regulation, and stress resilience through evidence-based interventions.',
    icon: Brain,
    pillar: 'brain',
    imagePath: '/src/assets/brain-pillar.png',
    symptomIds: ['brain-fog', 'mood', 'anxiety', 'headaches', 'memory-issues', 'cognitive-performance', 'sleep'],
    protocolHighlights: [
      'Nootropic supplementation',
      'Cognitive behavioral techniques',
      'Sleep optimization protocols',
      'Stress resilience training',
      'Neurotransmitter support'
    ],
    cta: 'Explore Brain Assessments',
    estimatedTime: '25-35 min'
  },
  body: {
    id: 'body',
    title: 'Body',
    subtitle: 'Energy, strength & physical vitality',
    description: "Build sustainable energy, optimize metabolic function, and support your body's natural resilience through targeted interventions.",
    icon: Activity,
    pillar: 'body',
    imagePath: '/src/assets/body-pillar.png',
    symptomIds: ['energy-levels', 'joint-pain', 'bloating', 'gut', 'weight-changes', 'sleep'],
    protocolHighlights: [
      'Mitochondrial support protocols',
      'Anti-inflammatory interventions',
      'Gut microbiome optimization',
      'Movement and recovery strategies',
      'Metabolic enhancement'
    ],
    cta: 'Explore Body Assessments',
    estimatedTime: '20-30 min'
  },
  balance: {
    id: 'balance',
    title: 'Balance',
    subtitle: 'Hormonal harmony & emotional equilibrium',
    description: 'Navigate hormonal transitions, regulate stress response, and cultivate emotional balance through science-backed protocols.',
    icon: Heart,
    pillar: 'balance',
    imagePath: '/src/assets/balance-pillar.png',
    symptomIds: ['hot-flashes', 'night-sweats', 'irregular-periods', 'mood', 'anxiety', 'weight-changes', 'sexual-function', 'menopause-brain-health'],
    protocolHighlights: [
      'Hormone balancing protocols',
      'Stress adaptation techniques',
      'Temperature regulation strategies',
      'Circadian rhythm optimization',
      'Emotional resilience building'
    ],
    cta: 'Explore Balance Assessments',
    estimatedTime: '30-40 min'
  },
  beauty: {
    id: 'beauty',
    title: 'Beauty',
    subtitle: 'Cellular health & radiant vitality',
    description: 'Enhance your natural radiance from within through cellular optimization, collagen support, and longevity-focused interventions.',
    icon: Sparkles,
    pillar: 'beauty',
    imagePath: '/src/assets/beauty-pillar.png',
    symptomIds: ['skin-health', 'hair-thinning', 'appearance-concerns', 'sleep'],
    protocolHighlights: [
      'Collagen synthesis support',
      'Cellular rejuvenation protocols',
      'Nutrient optimization for skin & hair',
      'Antioxidant protection strategies',
      'Beauty-from-within interventions'
    ],
    cta: 'Explore Beauty Assessments',
    estimatedTime: '15-25 min'
  }
};

export const TRIAGE_OPTION_OTHER = {
  id: 'multiple-concerns',
  title: "Not sure / Multiple concerns",
  subtitle: "Browse all symptoms to find what fits",
  icon: Settings,
  action: 'browse-all'
};

export const ASSESSMENT_OUTCOMES: Record<string, string> = {
  // Energy & Sleep theme
  "energy-levels": "Identify energy patterns, discover root causes, get personalized energy protocols",
  "sleep": "Track sleep quality, understand disruptions, receive targeted sleep solutions",
  
  // Brain & Cognitive theme
  "brain-fog": "Assess cognitive clarity, identify triggers, get brain-boosting interventions",
  "mood": "Track mood patterns, discover emotional triggers, receive mood-balancing protocols",
  "anxiety": "Measure anxiety levels, identify stressors, get evidence-based calming strategies",
  "headaches": "Map headache patterns, identify causes, receive prevention protocols",
  "memory-issues": "Evaluate memory function, discover gaps, get cognitive enhancement strategies",
  "cognitive-performance": "Assess mental sharpness, track performance metrics, optimize brain function",
  
  // Hormones & Menopause theme
  "hot-flashes": "Track intensity patterns, identify triggers, get cooling protocols",
  "night-sweats": "Monitor frequency, understand causes, receive temperature regulation strategies",
  "irregular-periods": "Map cycle patterns, identify irregularities, get hormone-balancing protocols",
  "weight-changes": "Track metabolic shifts, understand hormonal impact, receive weight optimization plans",
  "sexual-function": "Assess intimacy challenges, identify factors, get personalized solutions",
  "menopause-brain-health": "Evaluate cognitive changes, track menopause impact, optimize brain health",
  
  // Beauty & Aging theme
  "hair-thinning": "Assess hair health, identify deficiencies, get hair restoration protocols",
  "skin-changes": "Evaluate skin health, understand aging factors, receive rejuvenation strategies",
  "skin-health": "Evaluate skin vitality, identify aging factors, receive cellular rejuvenation strategies",
  "appearance-concerns": "Assess aging markers, understand skin science, get beauty-from-within protocols",
  
  // Stress & Resilience theme
  "stress-levels": "Measure stress load, identify sources, get resilience-building protocols",
  "burnout": "Assess exhaustion levels, identify causes, receive recovery strategies",
  
  // Gut & Digestion
  "gut": "Map digestive health, identify issues, get gut-healing protocols",
  "bloating": "Track bloating patterns, identify food triggers, receive digestive optimization plans",
  
  // Body & Physical
  "joint-pain": "Assess pain levels, identify inflammation, get joint-supporting protocols",
};
