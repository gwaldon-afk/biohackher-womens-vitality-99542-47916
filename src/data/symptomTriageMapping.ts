import { Battery, Brain, Heart, Sparkles, Activity, Settings, LucideIcon } from "lucide-react";

export interface TriageTheme {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  pillar: string;
  symptomIds: string[];
  cta: string;
  estimatedTime: string;
}

export const TRIAGE_THEMES: Record<string, TriageTheme> = {
  energy: {
    id: 'tired-all-time',
    title: 'Tired All the Time?',
    subtitle: "It's not you — it's your mitochondria",
    icon: Battery,
    pillar: 'body',
    symptomIds: ['energy-levels', 'sleep', 'bloating', 'gut', 'joint-pain'],
    cta: 'Energy Reboot Series',
    estimatedTime: '15-20 min'
  },
  brain: {
    id: 'brain-fog-mood',
    title: 'Brain Fog & Mood Swings',
    subtitle: "Your brain's Wi-Fi dropped — let's reconnect",
    icon: Brain,
    pillar: 'brain',
    symptomIds: ['brain-fog', 'mood', 'anxiety', 'headaches', 'memory-issues', 'cognitive-performance'],
    cta: 'Defog Your Brain',
    estimatedTime: '12-18 min'
  },
  hormones: {
    id: 'perimenopause-puzzle',
    title: 'The Perimenopause Puzzle',
    subtitle: "You're not broken — you're bio-shifting",
    icon: Heart,
    pillar: 'balance',
    symptomIds: ['hot-flashes', 'night-sweats', 'irregular-periods', 'weight-changes', 'sexual-function', 'menopause-brain-health'],
    cta: 'HormoneCompass™ Quiz',
    estimatedTime: '10-15 min'
  },
  beauty: {
    id: 'glow-within',
    title: 'Glow From Within',
    subtitle: 'Your glow is your longevity signal',
    icon: Sparkles,
    pillar: 'beauty',
    symptomIds: ['skin-health', 'hair-thinning', 'appearance-concerns'],
    cta: 'Cellular Beauty Plan',
    estimatedTime: '8-12 min'
  },
  stress: {
    id: 'stress-superpower',
    title: 'Stress Is Your Superpower',
    subtitle: 'Learn to bend, not break',
    icon: Activity,
    pillar: 'brain',
    symptomIds: ['anxiety', 'mood', 'sleep', 'headaches'],
    cta: 'Stress Reset Program',
    estimatedTime: '10-15 min'
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
