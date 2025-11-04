import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Brain, Heart, Activity, Sparkles, User, Calendar, Ruler, Scale, ArrowRight, Shield, Moon, TrendingUp, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface QuestionOption {
  text: string;
  score_value: number;
  ai_analysis: string;
  emoji?: string;
}

interface Question {
  question_id: string;
  pillar: string;
  text: string;
  type: 'radio' | 'slider';
  options: QuestionOption[];
}

const ASSESSMENT_QUESTIONS: Question[] = [
  // ==================== SLEEP PILLAR (3 questions) ====================
  {
    question_id: "Q1_SleepDuration",
    pillar: "sleep",
    type: "slider",
    text: "On average over the past week, how many hours of sleep did you get per night?",
    options: [
      {
        text: "A. Less than 5 hours or more than 10 hours",
        emoji: "😴",
        score_value: 0,
        ai_analysis: "Critical Risk. Extreme deviation from optimal sleep duration, associated with significantly elevated mortality risk and impaired biological repair."
      },
      {
        text: "B. 5.1–6.0 hours or 9.1–10.0 hours",
        emoji: "😪",
        score_value: 30,
        ai_analysis: "High Risk. Clear deviation from the narrow 7-8 hour optimal window, incurring a steep point reduction reflecting a measurable increase in risk."
      },
      {
        text: "C. 6.1–6.9 hours or 8.1–9.0 hours",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Near Optimal. While close, this is outside the tightest protective window, suggesting adequate repair but missing the point of lowest measured mortality risk."
      },
      {
        text: "D. 7.0–8.0 hours",
        emoji: "😌",
        score_value: 100,
        ai_analysis: "Optimal Range. This narrow window is consistently linked to the lowest all-cause mortality risk and efficient biological repair processes, maximizing the score."
      }
    ]
  },
  {
    question_id: "Q2_SleepQuality",
    pillar: "sleep",
    type: "slider",
    text: "How would you rate the restorative quality (depth, feeling of repair) of your sleep over the past week?",
    options: [
      {
        text: "A. Poor (Restless, unrefreshing)",
        emoji: "😫",
        score_value: 0,
        ai_analysis: "Critical. Poor sleep quality undermines all restorative processes regardless of duration."
      },
      {
        text: "B. Fair (Occasionally restless)",
        emoji: "😐",
        score_value: 30,
        ai_analysis: "Suboptimal. Frequent disruptions prevent deep restorative sleep phases."
      },
      {
        text: "C. Good (Generally refreshed)",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Protective. Sleep quality supports most biological repair processes effectively."
      },
      {
        text: "D. Excellent (Deeply restorative)",
        emoji: "🤩",
        score_value: 100,
        ai_analysis: "Optimal. Maximizes all restorative and repair processes during sleep."
      }
    ]
  },
  {
    question_id: "Q3_SleepConsistency",
    pillar: "sleep",
    type: "slider",
    text: "How consistent is your sleep schedule? (Going to bed and waking up at similar times)",
    options: [
      {
        text: "A. Very inconsistent (Varies by 3+ hours)",
        emoji: "🌙",
        score_value: 0,
        ai_analysis: "Critical. Irregular sleep patterns disrupt circadian rhythm and metabolic health."
      },
      {
        text: "B. Somewhat inconsistent (Varies by 1-3 hours)",
        emoji: "😴",
        score_value: 40,
        ai_analysis: "Suboptimal. Some circadian disruption affecting recovery quality."
      },
      {
        text: "C. Fairly consistent (Usually within 1 hour)",
        emoji: "😊",
        score_value: 75,
        ai_analysis: "Good. Supports healthy circadian rhythm and recovery."
      },
      {
        text: "D. Very consistent (Same time daily, ±30 min)",
        emoji: "⏰",
        score_value: 100,
        ai_analysis: "Optimal. Maximizes circadian alignment and recovery efficiency."
      }
    ]
  },

  // ==================== STRESS PILLAR (4 questions) ====================
  {
    question_id: "Q4_SubjectiveCalmness",
    pillar: "stress",
    type: "slider",
    text: "On a scale of 0 (Extremely Stressed) to 10 (Completely Recovered/Calm), how mentally recovered and calm do you feel this morning?",
    options: [
      {
        text: "A. 0–3 (Extremely stressed, anxious, or overwhelmed)",
        emoji: "😰",
        score_value: 0,
        ai_analysis: "Critical. Chronic high stress is a major driver of accelerated biological aging."
      },
      {
        text: "B. 4–5 (Moderately stressed, coping but not thriving)",
        emoji: "😟",
        score_value: 30,
        ai_analysis: "Elevated Risk. Persistent moderate stress undermines recovery and resilience."
      },
      {
        text: "C. 6–7 (Generally calm, occasional stress)",
        emoji: "😌",
        score_value: 70,
        ai_analysis: "Protective. Balanced stress management supports healthy aging trajectory."
      },
      {
        text: "D. 8–10 (Highly calm, recovered, and mentally clear)",
        emoji: "🧘",
        score_value: 100,
        ai_analysis: "Optimal. Reflects excellent autonomic balance and stress recovery capacity."
      }
    ]
  },
  {
    question_id: "Q5_SubjectiveAge",
    pillar: "stress",
    type: "slider",
    text: "Considering your energy, vitality, and mental clarity, how old do you genuinely feel compared to your chronological age?",
    options: [
      {
        text: "A. I feel more than 5 years older than my age.",
        emoji: "🧓",
        score_value: 0,
        ai_analysis: "Critical Risk. Large positive subjective age delta is a powerful predictor of mortality and biological aging acceleration."
      },
      {
        text: "B. I feel 1–4 years older than my age.",
        emoji: "😓",
        score_value: 40,
        ai_analysis: "Increased Risk. Positive subjective age delta, suggesting a perception of accelerating physical and mental decline, which is a known predictor of adverse outcomes."
      },
      {
        text: "C. I feel my age or slightly younger (0 to 4 years younger).",
        emoji: "😐",
        score_value: 80,
        ai_analysis: "Neutral/Protective. Reflects a stable self-assessment, establishing a strong baseline for mental health and resilience."
      },
      {
        text: "D. I feel ≥ 5 years younger than my age.",
        emoji: "✨",
        score_value: 100,
        ai_analysis: "Major Protective Factor. This negative delta correlates with a significant survival advantage, reflecting high vitality and optimal psychological health, which receives maximum score credit."
      }
    ]
  },
  {
    question_id: "Q6_StressManagement",
    pillar: "stress",
    type: "slider",
    text: "How effectively do you manage and recover from daily stressors?",
    options: [
      {
        text: "A. Poorly (Stress accumulates, little recovery)",
        emoji: "😣",
        score_value: 0,
        ai_analysis: "Critical. Inability to manage stress leads to chronic activation and accelerated aging."
      },
      {
        text: "B. Somewhat (I struggle but eventually cope)",
        emoji: "😐",
        score_value: 40,
        ai_analysis: "Suboptimal. Delayed recovery from stressors increases allostatic load."
      },
      {
        text: "C. Well (I have effective coping strategies)",
        emoji: "😊",
        score_value: 75,
        ai_analysis: "Protective. Good stress management supports resilience and longevity."
      },
      {
        text: "D. Excellently (Quick recovery, strong resilience)",
        emoji: "💪",
        score_value: 100,
        ai_analysis: "Optimal. Excellent stress adaptation is a key longevity marker."
      }
    ]
  },
  {
    question_id: "Q7_EmotionalResilience",
    pillar: "stress",
    type: "slider",
    text: "Which statement best describes your emotional outlook and resilience when facing unexpected challenges?",
    options: [
      {
        text: "A. I often feel overwhelmed and highly pessimistic about the future.",
        emoji: "😞",
        score_value: 0,
        ai_analysis: "Captures elements of anxiety and fatalism that are statistically significant contributors to mortality risk, requiring the highest penalty."
      },
      {
        text: "B. I sometimes struggle to cope and can become reactive to stress.",
        emoji: "😐",
        score_value: 30,
        ai_analysis: "Suggests moderate vulnerability to psychological distress, requiring focused interventions to build mental fortitude."
      },
      {
        text: "C. I am generally resilient and handle challenges with measured thought.",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Represents a healthy capacity for psychological self-regulation and coping, supporting sustained well-being."
      },
      {
        text: "D. I am highly resilient and maintain a strong, positive, and proactive outlook.",
        emoji: "💪",
        score_value: 100,
        ai_analysis: "Maximal score. Optimistic outlook is a statistically powerful contributor to a healthy survival profile."
      }
    ]
  },

  // ==================== ACTIVITY PILLAR (3 questions) ====================
  {
    question_id: "Q8_ActivityLevel",
    pillar: "activity",
    type: "slider",
    text: "On an average day, which of the following best describes your physical activity level (steps or active minutes)?",
    options: [
      {
        text: "A. Less than 2,000 steps or minimal movement",
        emoji: "🛋️",
        score_value: 0,
        ai_analysis: "Critical Risk. Sedentary behavior is strongly associated with accelerated biological aging and increased mortality risk."
      },
      {
        text: "B. 2,000–4,000 steps or less than 15 minutes of activity",
        emoji: "🚶",
        score_value: 30,
        ai_analysis: "High Risk. Below the minimum threshold for cardiovascular and metabolic health protection."
      },
      {
        text: "C. 4,000–7,999 steps or 15–29 minutes of moderate activity",
        emoji: "🏃",
        score_value: 70,
        ai_analysis: "Protective Threshold. Meets minimum activity requirements for health maintenance."
      },
      {
        text: "D. 8,000+ steps or ≥ 30 minutes of moderate exercise",
        emoji: "💪",
        score_value: 100,
        ai_analysis: "Maximal Benefit. This volume reaches the step-count saturation point for younger adults, and the 30-minute duration is associated with a 17% reduction in annual deaths, earning full credit."
      }
    ]
  },
  {
    question_id: "Q9_ExerciseIntensity",
    pillar: "activity",
    type: "slider",
    text: "How often do you engage in vigorous physical activity (running, HIIT, intense sports, heavy lifting)?",
    options: [
      {
        text: "A. Never or rarely",
        emoji: "🚶",
        score_value: 30,
        ai_analysis: "Minimal. Lacks intensity for optimal cardiovascular and metabolic adaptation."
      },
      {
        text: "B. 1-2 times per week",
        emoji: "🏃",
        score_value: 60,
        ai_analysis: "Moderate. Some intensity training provides benefits beyond moderate activity."
      },
      {
        text: "C. 3-4 times per week",
        emoji: "💪",
        score_value: 85,
        ai_analysis: "Optimal. Regular vigorous activity maximizes cardiovascular and metabolic health."
      },
      {
        text: "D. 5+ times per week",
        emoji: "🏋️",
        score_value: 100,
        ai_analysis: "Elite. High-frequency vigorous activity associated with exceptional longevity markers."
      }
    ]
  },
  {
    question_id: "Q10_MovementVariety",
    pillar: "activity",
    type: "slider",
    text: "Do you include strength training or resistance exercises in your routine?",
    options: [
      {
        text: "A. Never",
        emoji: "❌",
        score_value: 0,
        ai_analysis: "Critical Gap. Lack of resistance training accelerates muscle loss and metabolic decline."
      },
      {
        text: "B. Occasionally (less than once per week)",
        emoji: "🤷",
        score_value: 40,
        ai_analysis: "Insufficient. Inadequate frequency for muscle maintenance."
      },
      {
        text: "C. 1-2 times per week",
        emoji: "💪",
        score_value: 75,
        ai_analysis: "Good. Meets minimum frequency for muscle maintenance and metabolic health."
      },
      {
        text: "D. 3+ times per week",
        emoji: "🏋️",
        score_value: 100,
        ai_analysis: "Optimal. Sufficient volume for muscle growth, bone density, and metabolic optimization."
      }
    ]
  },

  // ==================== NUTRITION PILLAR (4 questions) ====================
  {
    question_id: "Q11_NutritionQuality",
    pillar: "nutrition",
    type: "slider",
    text: "What proportion of your daily food intake comes from whole, unprocessed sources (vegetables, fruits, lean protein, healthy fats)?",
    options: [
      {
        text: "A. Less than 30% whole foods (Mostly processed)",
        emoji: "🍔",
        score_value: 0,
        ai_analysis: "Critical Risk. Diet dominated by ultra-processed foods drives chronic inflammation and metabolic dysfunction."
      },
      {
        text: "B. 30–50% whole foods (Mixed intake, frequent nutrient-poor meals)",
        emoji: "🍕",
        score_value: 30,
        ai_analysis: "Insufficient Density. Indicates potential chronic metabolic stress and insufficient micronutrient supply for optimal cellular repair."
      },
      {
        text: "C. 50–70% whole foods (Balanced, occasional treats)",
        emoji: "🥗",
        score_value: 70,
        ai_analysis: "Protective Pattern. Adherence to a generally protective dietary pattern associated with slower biological aging and good general health."
      },
      {
        text: "D. > 70% whole foods (Strict adherence to balanced, dense nutrition)",
        emoji: "🥬",
        score_value: 100,
        ai_analysis: "Maximum credit for a diet designed to minimize systemic inflammation and optimally support metabolic and cellular health."
      }
    ]
  },
  {
    question_id: "Q12_ProteinIntake",
    pillar: "nutrition",
    type: "slider",
    text: "Do you consume adequate protein (0.8-1.2g per kg body weight) from quality sources daily?",
    options: [
      {
        text: "A. Rarely or inconsistent protein intake",
        emoji: "🤷",
        score_value: 0,
        ai_analysis: "Critical. Inadequate protein accelerates muscle loss and metabolic decline."
      },
      {
        text: "B. Sometimes, but below optimal levels",
        emoji: "🥚",
        score_value: 40,
        ai_analysis: "Suboptimal. Insufficient protein for muscle maintenance and repair."
      },
      {
        text: "C. Usually meet protein needs",
        emoji: "🍗",
        score_value: 75,
        ai_analysis: "Good. Adequate protein supports muscle maintenance and metabolic health."
      },
      {
        text: "D. Consistently meet or exceed protein goals with quality sources",
        emoji: "🥩",
        score_value: 100,
        ai_analysis: "Optimal. Excellent protein intake supports muscle, bone, and metabolic health."
      }
    ]
  },
  {
    question_id: "Q13_Hydration",
    pillar: "nutrition",
    type: "slider",
    text: "How well do you maintain adequate daily hydration (2-3 liters of water)?",
    options: [
      {
        text: "A. Rarely drink water, often dehydrated",
        emoji: "🏜️",
        score_value: 0,
        ai_analysis: "Critical. Chronic dehydration impairs cellular function and cognitive performance."
      },
      {
        text: "B. Inconsistent, sometimes dehydrated",
        emoji: "💧",
        score_value: 40,
        ai_analysis: "Suboptimal. Intermittent dehydration affects performance and recovery."
      },
      {
        text: "C. Usually well-hydrated",
        emoji: "🚰",
        score_value: 75,
        ai_analysis: "Good. Adequate hydration supports cellular function and performance."
      },
      {
        text: "D. Consistently well-hydrated throughout the day",
        emoji: "💦",
        score_value: 100,
        ai_analysis: "Optimal. Excellent hydration maximizes cellular function and cognitive performance."
      }
    ]
  },
  {
    question_id: "Q14_VegetableIntake",
    pillar: "nutrition",
    type: "slider",
    text: "How many servings of vegetables and fruits do you consume daily?",
    options: [
      {
        text: "A. 0-2 servings",
        emoji: "🚫",
        score_value: 0,
        ai_analysis: "Critical. Severe micronutrient and antioxidant deficiency."
      },
      {
        text: "B. 3-4 servings",
        emoji: "🥕",
        score_value: 40,
        ai_analysis: "Below optimal. Insufficient phytonutrient diversity."
      },
      {
        text: "C. 5-7 servings",
        emoji: "🥗",
        score_value: 80,
        ai_analysis: "Good. Meets general recommendations for health maintenance."
      },
      {
        text: "D. 8+ servings with high variety",
        emoji: "🌈",
        score_value: 100,
        ai_analysis: "Optimal. Maximizes antioxidant and phytonutrient intake for longevity."
      }
    ]
  },

  // ==================== SOCIAL PILLAR (3 questions) ====================
  {
    question_id: "Q15_SocialConnection",
    pillar: "social",
    type: "slider",
    text: "How often do you feel strongly connected and supported by your family, friends, or community?",
    options: [
      {
        text: "A. Rarely or Never (I often feel isolated)",
        emoji: "😔",
        score_value: 0,
        ai_analysis: "Critical Risk. Social isolation is as harmful as smoking 15 cigarettes per day in terms of mortality risk."
      },
      {
        text: "B. Sometimes (I experience periods of loneliness)",
        emoji: "🙂",
        score_value: 30,
        ai_analysis: "Moderate Risk. Intermittent lack of social support weakens the protective effect that strong social bonds offer against chronic stress."
      },
      {
        text: "C. Generally Supported (Connected most of the time)",
        emoji: "😊",
        score_value: 70,
        ai_analysis: "Protective Threshold. Meets the minimum requirement for utilizing social ties as an effective buffer against life stressors."
      },
      {
        text: "D. Highly Engaged (Feel consistently supported and connected)",
        emoji: "🤗",
        score_value: 100,
        ai_analysis: "Maximal Protection. This high level of social integration is linked to decelerated biological aging and maximal survival benefit, earning full credit."
      }
    ]
  },
  {
    question_id: "Q16_CommunityEngagement",
    pillar: "social",
    type: "slider",
    text: "How often do you participate in meaningful social activities or community engagement?",
    options: [
      {
        text: "A. Rarely (Less than once per month)",
        emoji: "🏠",
        score_value: 0,
        ai_analysis: "Critical. Lack of social engagement associated with faster cognitive decline."
      },
      {
        text: "B. Occasionally (1-2 times per month)",
        emoji: "👥",
        score_value: 40,
        ai_analysis: "Minimal. Insufficient social interaction frequency."
      },
      {
        text: "C. Regularly (Weekly)",
        emoji: "🎉",
        score_value: 75,
        ai_analysis: "Good. Regular social engagement supports cognitive and emotional health."
      },
      {
        text: "D. Frequently (Multiple times per week)",
        emoji: "🤝",
        score_value: 100,
        ai_analysis: "Optimal. High social engagement maximizes cognitive reserve and longevity."
      }
    ]
  },
  {
    question_id: "Q17_Purpose",
    pillar: "social",
    type: "slider",
    text: "Do you feel a strong sense of purpose or meaning in your daily life?",
    options: [
      {
        text: "A. No, I lack clear purpose or direction",
        emoji: "🤷",
        score_value: 0,
        ai_analysis: "Critical. Lack of purpose is strongly associated with mortality risk."
      },
      {
        text: "B. Sometimes, but it's inconsistent",
        emoji: "🤔",
        score_value: 40,
        ai_analysis: "Suboptimal. Inconsistent sense of purpose affects motivation and well-being."
      },
      {
        text: "C. Generally yes, I have meaningful goals",
        emoji: "🎯",
        score_value: 75,
        ai_analysis: "Good. Clear purpose supports motivation and psychological health."
      },
      {
        text: "D. Strong, clear purpose that drives my daily actions",
        emoji: "⭐",
        score_value: 100,
        ai_analysis: "Optimal. Strong sense of purpose is a powerful longevity factor."
      }
    ]
  },

  // ==================== COGNITIVE PILLAR (3 questions) ====================
  {
    question_id: "Q18_CognitiveEngagement",
    pillar: "cognitive",
    type: "slider",
    text: "On most days, how much time do you dedicate to focused cognitive tasks (learning, complex problem-solving, reading, etc.)?",
    options: [
      {
        text: "A. Less than 15 minutes",
        emoji: "📱",
        score_value: 20,
        ai_analysis: "Minimal Engagement. Even brief cognitive activity provides some protective benefit, but falls well short of optimal."
      },
      {
        text: "B. 15–30 minutes",
        emoji: "📖",
        score_value: 30,
        ai_analysis: "Minimal Engagement. Serves as a baseline level of mental activity, but falls short of optimal stimulation for brain health."
      },
      {
        text: "C. 30–60 minutes",
        emoji: "🧠",
        score_value: 70,
        ai_analysis: "Moderate Engagement. Sufficient time dedicated to maintaining and enhancing cognitive function."
      },
      {
        text: "D. ≥ 60 minutes of focused cognitive activity",
        emoji: "🎓",
        score_value: 100,
        ai_analysis: "Highest credit for sustained intellectual stimulation, which is a lifestyle factor associated with slower epigenetic aging."
      }
    ]
  },
  {
    question_id: "Q19_LearningNew",
    pillar: "cognitive",
    type: "slider",
    text: "How often do you actively learn new skills or engage in novel cognitive challenges?",
    options: [
      {
        text: "A. Rarely (Stuck in routine)",
        emoji: "🔄",
        score_value: 0,
        ai_analysis: "Critical. Lack of novelty accelerates cognitive decline."
      },
      {
        text: "B. Occasionally (Few times per year)",
        emoji: "📚",
        score_value: 40,
        ai_analysis: "Minimal. Insufficient novelty for cognitive reserve building."
      },
      {
        text: "C. Regularly (Monthly new learning)",
        emoji: "🎨",
        score_value: 75,
        ai_analysis: "Good. Regular novelty supports cognitive plasticity."
      },
      {
        text: "D. Consistently (Weekly new challenges)",
        emoji: "🚀",
        score_value: 100,
        ai_analysis: "Optimal. Frequent novel learning maximizes cognitive reserve and brain health."
      }
    ]
  },
  {
    question_id: "Q20_MeditationPractice",
    pillar: "cognitive",
    type: "radio",
    text: "In the past seven days, what was your average daily practice time for meditation, mindful breathing, or conscious relaxation?",
    options: [
      {
        text: "A. 0 minutes (None)",
        emoji: "🤷",
        score_value: 15,
        ai_analysis: "Minimal Credit. Not everyone has established meditation practice, but this still represents a missed opportunity for stress management."
      },
      {
        text: "B. 1–9 minutes (Inconsistent practice)",
        emoji: "🧘‍♀️",
        score_value: 25,
        ai_analysis: "Adherence credit only. Duration is below the minimum effective dose required to reliably support autonomic balance."
      },
      {
        text: "C. 10–19 minutes (Daily adherence)",
        emoji: "🧘",
        score_value: 70,
        ai_analysis: "Meets Minimum Effective Dose (MED). Daily adherence of 10+ minutes is linked to supporting autonomic regulation and stress management, earning high conditional credit."
      },
      {
        text: "D. ≥ 20 minutes (Consistent, deep practice)",
        emoji: "🕉️",
        score_value: 100,
        ai_analysis: "Maximal adherence. Sustained, deep practice is associated with measurable physiological and neurological changes over time, maximizing the score for this input."
      }
    ]
  },

  // ==================== SMOKING STATUS (Percentage Modifier) ====================
  {
    question_id: "Q21_SmokingStatus",
    pillar: "modifier",
    type: "radio",
    text: "What is your current smoking status? (This includes vaping nicotine products.)",
    options: [
      {
        text: "A. Current Smoker (Daily or occasional use)",
        emoji: "🚬",
        score_value: 0,
        ai_analysis: "Maximum Penalty Trigger. Current smoking is the single largest modifiable risk factor for accelerated epigenetic aging. Triggers a fixed -60% penalty."
      },
      {
        text: "B. Former Smoker (Quit less than 1 year ago)",
        emoji: "🚭",
        score_value: 30,
        ai_analysis: "High Penalty Trigger. Residual risk is still significant. Triggers a -5% penalty reflecting high cardiovascular sensitivity during the first year of cessation."
      },
      {
        text: "C. Former Smoker (Quit 1-5 years ago)",
        emoji: "✅",
        score_value: 95,
        ai_analysis: "Minimal Penalty. Risk significantly reduced after 1 year of cessation. 2% penalty reflects minor residual cardiovascular impact."
      },
      {
        text: "D. Former Smoker (Quit 5+ years ago) or Never Smoked",
        emoji: "🌟",
        score_value: 100,
        ai_analysis: "Zero Penalty. After 5 years of cessation, cardiovascular risk profile approaches that of never-smokers."
      }
    ]
  },

  // ==================== ACTIVITY LEVEL CLASSIFICATION (Activity Pillar) ====================
  {
    question_id: "Q22_ActivityLevelClassification",
    pillar: "activity",
    type: "slider",
    text: "Which best describes your overall lifestyle activity level?",
    options: [
      {
        text: "A. Sedentary (Mostly sitting, minimal physical activity)",
        emoji: "🪑",
        score_value: 0,
        ai_analysis: "Critical Risk. Sedentary lifestyle classification indicates minimal overall energy expenditure, significantly increasing mortality risk."
      },
      {
        text: "B. Lightly Active (Light exercise 1-3 days/week)",
        emoji: "🚶",
        score_value: 30,
        ai_analysis: "Suboptimal. Light activity provides some benefit but remains below optimal thresholds for longevity."
      },
      {
        text: "C. Moderately Active (Moderate exercise 3-5 days/week)",
        emoji: "🏃",
        score_value: 60,
        ai_analysis: "Good. Moderate activity level supports metabolic health and longevity."
      },
      {
        text: "D. Very Active (Hard exercise 6-7 days/week)",
        emoji: "💪",
        score_value: 85,
        ai_analysis: "Excellent. Very active lifestyle associated with strong longevity markers."
      },
      {
        text: "E. Extremely Active (Professional athlete or very intense daily training)",
        emoji: "🏋️",
        score_value: 100,
        ai_analysis: "Elite. Extremely active lifestyle maximizes metabolic health and longevity potential."
      }
    ]
  }
];

const PILLAR_ICONS = {
  sleep: Moon,
  stress: Heart,
  activity: Activity,
  nutrition: TrendingUp,
  social: Users,
  cognitive: Brain,
  modifier: Sparkles
};

interface BaselineData {
  dateOfBirth: string;
  heightCm: string;
  weightKg: string;
}

export default function GuestLISAssessment() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { user } = useAuth();
  const [showBaseline, setShowBaseline] = useState(true);
  const [baselineData, setBaselineData] = useState<BaselineData>({
    dateOfBirth: '',
    heightCm: '',
    weightKg: ''
  });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionOption>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateBMI = (): number => {
    const height = parseFloat(baselineData.heightCm);
    const weight = parseFloat(baselineData.weightKg);
    if (height && weight) {
      return parseFloat((weight / Math.pow(height / 100, 2)).toFixed(1));
    }
    return 0;
  };

  const calculateAgeFromDOB = (dob: string): number => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleBaselineSubmit = () => {
    if (!baselineData.dateOfBirth || !baselineData.heightCm || !baselineData.weightKg) {
      toast.error('Please fill in all baseline information');
      return;
    }

    const age = calculateAgeFromDOB(baselineData.dateOfBirth);
    if (age < 18 || age > 120) {
      toast.error('Please enter a valid date of birth (age 18-120 years)');
      return;
    }

    if (parseFloat(baselineData.heightCm) < 100 || parseFloat(baselineData.heightCm) > 250) {
      toast.error('Please enter a valid height (100-250 cm)');
      return;
    }

    if (parseFloat(baselineData.weightKg) < 30 || parseFloat(baselineData.weightKg) > 300) {
      toast.error('Please enter a valid weight (30-300 kg)');
      return;
    }

    setShowBaseline(false);
  };

  const progress = showBaseline ? 0 : ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
  const question = !showBaseline ? ASSESSMENT_QUESTIONS[currentQuestion] : null;
  const PillarIcon = question ? PILLAR_ICONS[question.pillar as keyof typeof PILLAR_ICONS] || Activity : Activity;

  const handleAnswerSelect = (option: QuestionOption) => {
    if (!question) return;
    setAnswers(prev => ({
      ...prev,
      [question.question_id]: option
    }));
  };

  const handleNext = () => {
    if (!question || !answers[question.question_id]) {
      toast.error('Please select an answer to continue');
      return;
    }

    if (currentQuestion < ASSESSMENT_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let smokingPenaltyPercent = 0;

    Object.entries(answers).forEach(([questionId, option]) => {
      totalScore += option.score_value;

      // Apply smoking penalties as percentage reductions (research-aligned)
      if (questionId === 'Q21_SmokingStatus') {
        if (option.text.includes('Current Smoker')) {
          smokingPenaltyPercent = 0.60; // 60% - Maximum impact
        } else if (option.text.includes('less than 1 year')) {
          smokingPenaltyPercent = 0.05; // 5% - Significant recovery at 12 months
        } else if (option.text.includes('1-5 years')) {
          smokingPenaltyPercent = 0.02; // 2% - Minimal residual impact
        } else if (option.text.includes('5+ years')) {
          smokingPenaltyPercent = 0.00; // 0% - Risk approaches never-smoker
        }
      }
    });

    // Calculate pillar scores first
    const pillarScores = calculatePillarScores();
    
    // Final score is the average of pillar scores
    const pillarValues = Object.values(pillarScores);
    const averagePillarScore = pillarValues.length > 0 
      ? pillarValues.reduce((sum, score) => sum + score, 0) / pillarValues.length 
      : 0;
    
    // Apply smoking penalty as percentage reduction
    const scoreAfterPenalty = averagePillarScore * (1 - smokingPenaltyPercent);
    const finalScore = Math.max(0, Math.round(scoreAfterPenalty));
    
    // Calculate absolute penalty amount for display
    const smokingPenalty = Math.round(averagePillarScore * smokingPenaltyPercent);

    return {
      finalScore,
      rawScore: totalScore,
      smokingPenalty,
      pillarScores
    };
  };

  const calculatePillarScores = () => {
    const pillarScores: Record<string, { score: number; count: number }> = {
      sleep: { score: 0, count: 0 },
      stress: { score: 0, count: 0 },
      activity: { score: 0, count: 0 },
      nutrition: { score: 0, count: 0 },
      social: { score: 0, count: 0 },
      cognitive: { score: 0, count: 0 }
    };

    Object.entries(answers).forEach(([questionId, option]) => {
      const q = ASSESSMENT_QUESTIONS.find(q => q.question_id === questionId);
      if (q) {
        const pillar = q.pillar;
        // SKIP modifier questions - they don't contribute to pillar scores
        if (pillarScores[pillar] && pillar !== 'modifier') {
          pillarScores[pillar].score += option.score_value;
          pillarScores[pillar].count += 1;
        }
      }
    });

    // Calculate averages
    const result: Record<string, number> = {};
    Object.entries(pillarScores).forEach(([pillar, data]) => {
      result[pillar] = data.count > 0 ? Math.round(data.score / data.count) : 0;
    });

    return result;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const scoreData = calculateScore();

      // Prepare assessment data
      const assessmentData = {
        baselineData: {
          dateOfBirth: baselineData.dateOfBirth,
          age: calculateAgeFromDOB(baselineData.dateOfBirth),
          heightCm: parseFloat(baselineData.heightCm),
          weightKg: parseFloat(baselineData.weightKg),
          bmi: calculateBMI()
        },
        answers: Object.entries(answers).map(([questionId, option]) => ({
          questionId,
          answer: option.text,
          score: option.score_value,
          analysis: option.ai_analysis
        })),
        timestamp: new Date().toISOString()
      };

      const briefResults = {
        finalScore: scoreData.finalScore,
        pillarScores: scoreData.pillarScores,
        smokingPenalty: scoreData.smokingPenalty
      };

      // Handle authenticated users differently
      if (user) {
        const age = calculateAgeFromDOB(baselineData.dateOfBirth);

        // Extract activity level from Q22 answer
        const activityAnswer = answers['Q22_ActivityLevelClassification'];
        let activityLevel = 'sedentary';
        if (activityAnswer) {
          if (activityAnswer.text.includes('Lightly Active')) {
            activityLevel = 'lightly_active';
          } else if (activityAnswer.text.includes('Moderately Active')) {
            activityLevel = 'moderately_active';
          } else if (activityAnswer.text.includes('Very Active')) {
            activityLevel = 'very_active';
          } else if (activityAnswer.text.includes('Extremely Active')) {
            activityLevel = 'extremely_active';
          }
        }

        // 1. Create/update health profile
        const { error: profileError } = await supabase
          .from('user_health_profile')
          .upsert({
            user_id: user.id,
            date_of_birth: baselineData.dateOfBirth,
            height_cm: parseFloat(baselineData.heightCm),
            weight_kg: parseFloat(baselineData.weightKg),
            current_bmi: calculateBMI(),
            activity_level: activityLevel,
          }, {
            onConflict: 'user_id'
          });

        if (profileError) {
          console.error('Error saving health profile:', profileError);
          toast.error('Failed to save health profile. Please try again.');
          return;
        }

        // 2. Create baseline daily_score (upsert to handle duplicates)
        const { error: scoreError } = await supabase
          .from('daily_scores')
          .upsert({
            user_id: user.id,
            date: new Date().toISOString().split('T')[0],
            longevity_impact_score: scoreData.finalScore,
            biological_age_impact: scoreData.finalScore,
            is_baseline: true,
            assessment_type: 'lifestyle_baseline',
            user_chronological_age: age,
            lis_version: 'LIS 2.0',
            source_type: 'manual_entry',
            sleep_score: scoreData.pillarScores.sleep || 0,
            stress_score: scoreData.pillarScores.stress || 0,
            physical_activity_score: scoreData.pillarScores.activity || 0,
            nutrition_score: scoreData.pillarScores.nutrition || 0,
            social_connections_score: scoreData.pillarScores.social || 0,
            cognitive_engagement_score: scoreData.pillarScores.cognitive || 0,
            color_code: scoreData.finalScore >= 75 ? 'green' : scoreData.finalScore >= 50 ? 'yellow' : 'red'
          }, {
            onConflict: 'user_id,date'
          });

        if (scoreError) {
          console.error('Error saving daily score:', scoreError);
          // Don't block the flow for duplicate entries
        }

        // 3. Create synthetic assessment_completions for protocol generation
        const syntheticAssessments = [
          { assessment_id: 'sleep-quality', pillar: 'sleep', score: scoreData.pillarScores.sleep || 0 },
          { assessment_id: 'stress-management', pillar: 'stress', score: scoreData.pillarScores.stress || 0 },
          { assessment_id: 'cognitive-function', pillar: 'cognitive', score: scoreData.pillarScores.cognitive || 0 },
          { assessment_id: 'physical-activity', pillar: 'activity', score: scoreData.pillarScores.activity || 0 },
          { assessment_id: 'nutrition-quality', pillar: 'nutrition', score: scoreData.pillarScores.nutrition || 0 },
          { assessment_id: 'social-connection', pillar: 'social', score: scoreData.pillarScores.social || 0 },
        ];

        for (const assessment of syntheticAssessments) {
          await supabase.from('user_assessment_completions').insert({
            user_id: user.id,
            assessment_id: assessment.assessment_id,
            pillar: assessment.pillar,
            score: assessment.score,
            completed_at: new Date().toISOString()
          });
        }

        // 4. Generate protocol automatically
        toast.promise(
          supabase.functions.invoke('generate-protocol-from-assessments', { body: {} }),
          {
            loading: 'Generating your personalized protocol...',
            success: (result) => {
              const data = result.data;
              return `Protocol created with ${data?.items_count || 0} personalized recommendations!`;
            },
            error: 'Protocol generation will complete in the background'
          }
        );

        // 5. Mark onboarding as complete
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('user_id', user.id);

        // Navigate to results page with score data
        setTimeout(() => {
          if (returnTo) {
            navigate(decodeURIComponent(returnTo));
          } else {
            navigate(`/lis-results?score=${scoreData.finalScore}&pillarScores=${encodeURIComponent(JSON.stringify(scoreData.pillarScores))}&isNewBaseline=true`);
          }
        }, 2000);

      } else {
        // Guest user - save to guest table
        const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Save sessionId to localStorage for later retrieval
        localStorage.setItem('lis_guest_session_id', sessionId);

        const { error } = await supabase
          .from('guest_lis_assessments')
          .insert({
            session_id: sessionId,
            assessment_data: assessmentData,
            brief_results: briefResults
          });

        if (error) {
          console.error('Error saving guest assessment:', error);
          toast.error('Failed to save assessment. Please try again.');
          return;
        }

        // Navigate to results page for guests
        navigate(`/lis-results?score=${scoreData.finalScore}&pillarScores=${encodeURIComponent(JSON.stringify(scoreData.pillarScores))}&isNewBaseline=true&isGuest=true`);
      }
    } catch (error) {
      console.error('Error submitting assessment:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedAnswer = question ? answers[question.question_id] : undefined;
  const bmi = calculateBMI();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            LIS 2.0 Longevity Assessment
          </h1>
          <p className="text-muted-foreground">
            Discover your science-backed Longevity Impact Score
          </p>
        </div>

        {/* Progress Bar */}
        {!showBaseline && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
              </span>
              <span className="text-sm font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Baseline Data Collection or Question Card */}
        {showBaseline ? (
          <Card className="border-primary/20">
            <div className="p-8">
              {/* Centered Header */}
              <div className="text-center mb-8">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-3">Before We Begin</h2>
                <p className="text-muted-foreground text-base max-w-2xl mx-auto">
                  We need a few baseline metrics to calculate your personalized Longevity Impact Score based on peer-reviewed research
                </p>
              </div>

              <div className="space-y-6 max-w-xl mx-auto">
                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dob" className="text-base font-medium flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    Date of Birth
                  </Label>
                  <Input
                    id="dob"
                    type="date"
                    value={baselineData.dateOfBirth}
                    onChange={(e) => setBaselineData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    max={new Date().toISOString().split('T')[0]}
                    className="h-12 text-base"
                  />
                  {baselineData.dateOfBirth && (
                    <p className="text-sm text-muted-foreground">
                      Age: {calculateAgeFromDOB(baselineData.dateOfBirth)} years
                    </p>
                  )}
                </div>

                {/* Height */}
                <div className="space-y-2">
                  <Label htmlFor="height" className="text-base font-medium flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-primary" />
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="e.g., 165"
                    value={baselineData.heightCm}
                    onChange={(e) => setBaselineData(prev => ({ ...prev, heightCm: e.target.value }))}
                    min="100"
                    max="250"
                    className="h-12 text-base"
                  />
                  {baselineData.heightCm && parseFloat(baselineData.heightCm) > 0 && (
                    <p className="text-sm text-muted-foreground">
                      About {Math.floor(parseFloat(baselineData.heightCm) / 30.48 / 12)}'{Math.round((parseFloat(baselineData.heightCm) / 30.48) % 12)}" in feet
                    </p>
                  )}
                </div>

                {/* Weight */}
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-base font-medium flex items-center gap-2">
                    <Scale className="w-4 h-4 text-primary" />
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    placeholder="e.g., 65"
                    value={baselineData.weightKg}
                    onChange={(e) => setBaselineData(prev => ({ ...prev, weightKg: e.target.value }))}
                    min="30"
                    max="300"
                    step="0.1"
                    className="h-12 text-base"
                  />
                  {baselineData.weightKg && parseFloat(baselineData.weightKg) > 0 && (
                    <p className="text-sm text-muted-foreground">
                      About {Math.round(parseFloat(baselineData.weightKg) * 2.20462)} lbs
                    </p>
                  )}
                </div>

                {/* BMI Display */}
                {bmi > 0 && (
                  <div className="p-5 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Your BMI</p>
                        <p className="text-4xl font-bold text-primary">{bmi}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : 'Obese'}
                        </p>
                      </div>
                      <Activity className="w-12 h-12 text-primary/20" />
                    </div>
                  </div>
                )}

                {/* Privacy Notice */}
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border">
                  <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium mb-1">Your data is private and secure</p>
                    <p className="text-xs text-muted-foreground">
                      We use these metrics solely to personalize your assessment results
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ) : (
          <Card className="p-8 mb-6 border-2">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-full bg-primary/10">
                <PillarIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-primary mb-2">
                  {question?.pillar === 'modifier' 
                    ? 'Risk Modifier' 
                    : `${question?.pillar.charAt(0).toUpperCase() + question?.pillar.slice(1)} Pillar`}
                </div>
                <h2 className="text-xl font-semibold leading-relaxed">
                  {question?.text}
                </h2>
              </div>
            </div>

            <RadioGroup
              key={question?.question_id || currentQuestion}
              value={selectedAnswer?.text || ''}
              onValueChange={(value) => {
                const option = question?.options.find(opt => opt.text === value);
                if (option) handleAnswerSelect(option);
              }}
              className="space-y-3"
            >
              {question?.options.map((option, index) => (
                <div
                  key={index}
                  className={`relative flex items-start space-x-3 p-4 rounded-lg border-2 transition-all cursor-pointer hover:border-primary/50 ${
                    selectedAnswer?.text === option.text
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <RadioGroupItem value={option.text} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer leading-relaxed"
                  >
                    {option.emoji && <span className="mr-2 text-xl">{option.emoji}</span>}
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          {showBaseline ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBaselineSubmit}
                disabled={!baselineData.dateOfBirth || !baselineData.heightCm || !baselineData.weightKg}
                size="lg"
                className="min-w-48"
              >
                Start Assessment
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentQuestion === 0}
              >
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!selectedAnswer || isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  'Calculating...'
                ) : currentQuestion === ASSESSMENT_QUESTIONS.length - 1 ? (
                  'Get My Score'
                ) : (
                  'Next'
                )}
              </Button>
            </>
          )}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          This assessment takes approximately 3 minutes to complete
        </p>
      </div>
    </div>
  );
}
