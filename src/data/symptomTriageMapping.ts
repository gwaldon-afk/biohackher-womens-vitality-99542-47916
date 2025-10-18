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
    cta: 'MenoMap™ Quiz',
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
