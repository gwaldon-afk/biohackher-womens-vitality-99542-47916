import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Calendar, CheckCircle2, PlayCircle, Timer, Utensils, Activity, Brain, Heart, Sparkles, Pill } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";

interface DayPlan {
  day: number;
  dayName: string;
  focus: string;
  activities: Activity[];
  nutrition?: NutritionPlan;
  supplements?: string[];
  notes: string;
  completed?: boolean;
}

interface Activity {
  id: string;
  name: string;
  duration: string;
  description: string;
  type: 'exercise' | 'meditation' | 'nutrition' | 'beauty' | 'recovery';
  difficulty: 'easy' | 'medium' | 'hard';
  completed?: boolean;
}

interface NutritionPlan {
  breakfast: string;
  lunch: string;
  dinner: string;
  snacks: string[];
}

const SevenDayPlan = () => {
  const { pillar } = useParams<{ pillar: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentDay, setCurrentDay] = useState(1);
  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

  const pillarInfo = {
    brain: {
      title: "Brain Optimization",
      description: "7-day cognitive enhancement program",
      icon: Brain,
      color: "from-purple-500 to-indigo-600"
    },
    body: {
      title: "Body Transformation", 
      description: "7-day physical wellness program",
      icon: Activity,
      color: "from-green-500 to-emerald-600"
    },
    balance: {
      title: "Balance Restoration",
      description: "7-day stress management program", 
      icon: Heart,
      color: "from-rose-500 to-pink-600"
    },
    beauty: {
      title: "Beauty Enhancement",
      description: "7-day skin & appearance program",
      icon: Sparkles,
      color: "from-amber-500 to-orange-600"
    }
  };

  const generateSevenDayPlan = (pillarType: string): DayPlan[] => {
    const planTemplates = {
      brain: [
        {
          day: 1,
          dayName: "Monday",
          focus: "Foundation & Assessment",
          activities: [
            {
              id: "brain-1-1",
              name: "Morning Sunlight Exposure Protocol",
              duration: "15 mins",
              description: "Get outside within 30-60 minutes of waking. Face east, no sunglasses. Regulates circadian rhythm and supports cognitive function.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-1-2",
              name: "Meditation & Mindfulness Practice",
              duration: "12 mins",
              description: "Start with guided meditation using Headspace or Insight Timer. Focus on breath awareness - consistency matters more than duration.",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-1-3",
              name: "Zone 2 Cardio for BDNF",
              duration: "30 mins",
              description: "Exercise at 60-70% max heart rate where you can still hold a conversation. Boosts brain-derived neurotrophic factor.",
              type: "exercise" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Lion's Mane mushroom extract (1000mg)", "Omega-3 fish oil (1-3g EPA/DHA)", "B-complex vitamins"],
          notes: "Establish foundational habits that support brain health. Focus on circadian rhythm regulation and neuroplasticity enhancement."
        },
        {
          day: 2,
          dayName: "Tuesday",
          focus: "Cognitive Training & Memory",
          activities: [
            {
              id: "brain-2-1",
              name: "Dual N-back Cognitive Training",
              duration: "20 mins",
              description: "Use Brain Workshop or online dual n-back games. Start with 2-back level. Train working memory with 20 minutes, targeting cognitive enhancement.",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "brain-2-2",
              name: "Memory Palace Technique",
              duration: "25 mins",
              description: "Create vivid mental maps of familiar places and associate information with specific locations. Start with your home layout and practice placing 5-10 items.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-2-3",
              name: "Breathwork Training (4-7-8 Breathing)",
              duration: "10 mins",
              description: "Inhale for 4, hold for 7, exhale for 8. Practice 5-10 rounds for stress reduction and focus enhancement.",
              type: "meditation" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Bacopa Monnieri (300-600mg)", "Phosphatidylserine (100mg)", "Rhodiola Rosea (200-400mg)"],
          notes: "Focus on active memory training and cognitive skill development. These exercises directly improve working memory capacity."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Learning & Neuroplasticity",
          activities: [
            {
              id: "brain-3-1",
              name: "Language Learning Session",
              duration: "30 mins",
              description: "Use Duolingo or Babbel for 30 minutes. Learning new languages increases neuroplasticity by 30%. Focus on consistent daily practice.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-3-2",
              name: "Musical Instrument Practice",
              duration: "25 mins",
              description: "Practice piano, guitar, or any instrument. Focus on learning new pieces rather than repeating familiar ones to maximize cognitive benefits.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-3-3",
              name: "Cold Exposure Training",
              duration: "2 mins",
              description: "Start with 30-second cold shower, work up to 2 minutes. End hot shower with cold exposure. Boosts norepinephrine and focus.",
              type: "recovery" as const,
              difficulty: "hard" as const
            }
          ],
          supplements: ["Alpha-GPC (300-600mg)", "Lion's Mane (1000mg)", "Modafinil alternative (if needed)"],
          notes: "Neuroplasticity peaks with novel learning experiences. Both language and music learning create new neural pathways."
        },
        {
          day: 4,
          dayName: "Thursday",
          focus: "Processing Speed & Focus",
          activities: [
            {
              id: "brain-4-1",
              name: "Speed Reading Practice",
              duration: "20 mins",
              description: "Use Spreeder or 7 Speed Reading apps. Practice chunking, reduce subvocalization, use peripheral vision training to double reading efficiency.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-4-2",
              name: "Box Breathing for Focus",
              duration: "15 mins",
              description: "4-4-4-4 pattern breathing. Practice before mental work sessions to enhance focus and manage stress response.",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-4-3",
              name: "Social Engagement Session",
              duration: "45 mins",
              description: "Prioritize face-to-face interactions, practice active listening. Social engagement enhances cognitive resilience and emotional intelligence.",
              type: "exercise" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["L-theanine (200mg)", "Caffeine (100mg)", "Ginkgo Biloba (120-240mg)"],
          notes: "Focus on processing speed and sustained attention. Social engagement is crucial for cognitive health and emotional regulation."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Executive Function & Planning",
          activities: [
            {
              id: "brain-5-1",
              name: "Fiction Reading Session",
              duration: "30 mins",
              description: "Read diverse fiction genres. Focus on character-driven narratives to improve empathy and cognitive flexibility.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-5-2",
              name: "Strategic Planning Exercise",
              duration: "25 mins",
              description: "Plan next week's goals, break down complex tasks, practice decision-making frameworks. Enhances executive function.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-5-3",
              name: "Intermittent Fasting Protocol",
              duration: "16 hours",
              description: "14-16 hour fasting window. Example: eat between 12pm-8pm, fast from 8pm-12pm next day. Supports neuroplasticity and focus.",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["NAD+ precursors", "Resveratrol (250-500mg)", "Curcumin (500mg)"],
          notes: "Executive functions like planning and decision-making improve with practice. Intermittent fasting supports brain health."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Integration & Flow States",
          activities: [
            {
              id: "brain-6-1",
              name: "Flow State Training",
              duration: "60 mins",
              description: "Engage in challenging but achievable tasks. Combine learning elements from the week into complex problem-solving scenarios.",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "brain-6-2",
              name: "Nature Therapy Session",
              duration: "30 mins",
              description: "Forest bathing - mindful time in nature without devices. Engage all senses, breathe deeply, reduces stress and enhances creativity.",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-6-3",
              name: "Weekly Progress Review",
              duration: "20 mins",
              description: "Journal about cognitive improvements, identify what's working, plan adjustments for next week. Metacognition enhances learning.",
              type: "exercise" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Full spectrum B-complex", "Magnesium glycinate (200-400mg)", "Ashwagandha (300-600mg)"],
          notes: "Integration day - combine all elements learned this week. Flow states represent peak cognitive performance."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Recovery & Sleep Optimization",
          activities: [
            {
              id: "brain-7-1",
              name: "Sleep Optimization Protocol",
              duration: "60 mins",
              description: "Quality sleep optimisation: consistent schedule, cool room (18-20°C), no screens 1 hour before bed, blackout curtains. Critical for memory consolidation.",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-7-2",
              name: "Gentle Movement Recovery",
              duration: "30 mins",
              description: "Yoga, walking, or gentle stretching. Active recovery supports brain health without adding stress.",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-7-3",
              name: "Meal Prep for Brain Health",
              duration: "45 mins",
              description: "Prepare omega-3 rich meals, antioxidant-rich foods, and brain-supporting nutrients for the upcoming week.",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Melatonin (0.5-3mg)", "Magnesium", "L-theanine for sleep"],
          notes: "Recovery is when the brain consolidates learning. Quality sleep is non-negotiable for cognitive enhancement."
        }
      ],
      body: [
        {
          day: 1,
          dayName: "Monday",
          focus: "Strength Foundation Assessment",
          activities: [
            {
              id: "body-1-1",
              name: "Movement Quality Assessment",
              duration: "20 mins",
              description: "Video record basic movements: squat, lunge, push-up, overhead reach. Address imbalances and compensations before they become problems.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-1-2",
              name: "Compound Movement Training",
              duration: "45 mins",
              description: "Focus on squats, deadlifts, push-ups, rows. 3-4 sets of 6-12 reps at 70-85% effort. Progressive overload is key - track your workouts.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-1-3",
              name: "Post-Workout Protein Protocol",
              duration: "5 mins",
              description: "Consume 20-40g whey or plant protein within 30 minutes. Supports muscle protein synthesis and recovery.",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Whey or plant protein (20-40g post-workout)", "Creatine monohydrate (3-5g daily)", "Vitamin D3 + K2 (2000-4000 IU D3)"],
          notes: "Establish movement baselines and introduce fundamental compound movements. Quality over quantity in all exercises."
        },
        {
          day: 2,
          dayName: "Tuesday",
          focus: "Cardiovascular & Metabolic Health",
          activities: [
            {
              id: "body-2-1",
              name: "Zone 2 Cardio Training",
              duration: "45 mins",
              description: "Target heart rate: 180 minus your age. Exercise where you can still hold a conversation. Builds aerobic base and mitochondrial function.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-2-2",
              name: "Walking Protocol",
              duration: "30 mins",
              description: "Aim for 8,000-10,000 steps daily. Take stairs, park farther away, have walking meetings. Break into manageable chunks throughout the day.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-2-3",
              name: "Hydration & Electrolyte Protocol",
              duration: "All day",
              description: "Monitor hydration status, replace electrolytes (sodium, potassium) especially after sweating. Proper hydration supports performance and recovery.",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Electrolyte replacement (sodium, potassium)", "CoQ10 (100-200mg)", "Omega-3 fish oil (1-3g EPA/DHA)"],
          notes: "Zone 2 cardio is the foundation of metabolic health. Builds the aerobic system that supports all other training."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Mobility & Recovery",
          activities: [
            {
              id: "body-3-1",
              name: "Mobility Work & Dynamic Stretching",
              duration: "15 mins",
              description: "Hip circles, leg swings, arm circles, full-body movements. Focus on major joints and movement patterns for daily activities.",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-3-2",
              name: "Sauna Heat Therapy",
              duration: "20 mins",
              description: "Sauna at 174-212°F for 20 minutes, 4x/week. Supports cardiovascular health, heat shock proteins, and recovery.",
              type: "recovery" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-3-3",
              name: "Cold Plunge Recovery",
              duration: "3 mins",
              description: "Cold water therapy at 50-59°F for 2-11 minutes. Reduces inflammation, improves recovery, and mental resilience.",
              type: "recovery" as const,
              difficulty: "hard" as const
            }
          ],
          supplements: ["Collagen peptides (10-20g for joints)", "Magnesium (glycinate or citrate, 200-400mg)", "Anti-inflammatory compounds"],
          notes: "Recovery is when adaptation happens. Heat and cold therapy are powerful tools for enhanced recovery and resilience."
        },
        {
          day: 4,
          dayName: "Thursday",
          focus: "High-Intensity & Power",
          activities: [
            {
              id: "body-4-1",
              name: "HIIT Training Session",
              duration: "25 mins",
              description: "Alternate high-intensity bursts (85-95% max effort) with recovery. Example: 30 seconds work, 90 seconds rest, repeat 8-15 rounds.",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "body-4-2",
              name: "Plyometric Power Development",
              duration: "20 mins",
              description: "Jump squats, box jumps, burpees, medicine ball throws. 2-3 sets of 5-10 explosive reps with full recovery. Focus on landing mechanics.",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "body-4-3",
              name: "Performance Breathing Protocol",
              duration: "10 mins",
              description: "Practice rhythmic breathing during exercise. Nasal breathing during low intensity, mouth breathing during high intensity.",
              type: "exercise" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Pre-workout (if needed)", "Beta-alanine (2-5g)", "Post-workout recovery drink"],
          notes: "HIIT and plyometrics develop power and metabolic flexibility. Limit to 2-3 sessions per week to avoid overtraining."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Functional Movement & Skills",
          activities: [
            {
              id: "body-5-1",
              name: "Functional Movement Training",
              duration: "40 mins",
              description: "Practice squatting, lunging, pushing, pulling, rotating movements. Use bodyweight or light resistance. Quality before load.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-5-2",
              name: "Balance & Proprioception Training",
              duration: "15 mins",
              description: "Single-leg stands, BOSU ball exercises, eyes-closed balance challenges. Start with 30 seconds, progress to 2 minutes per exercise.",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-5-3",
              name: "Sport-Specific Skill Development",
              duration: "30 mins",
              description: "Practice skills relevant to your chosen activities. Focus on technique before intensity. Break complex movements into components.",
              type: "exercise" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Joint support complex", "Vitamin C for connective tissue", "Adaptogenic herbs"],
          notes: "Functional movement prepares you for real-world activities. Balance and coordination decline with age but respond well to training."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Integration & Assessment",
          activities: [
            {
              id: "body-6-1",
              name: "Full-Body Integration Workout",
              duration: "50 mins",
              description: "Combine all movement patterns learned this week. Progressive overload resistance training with compound movements.",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "body-6-2",
              name: "Morning Movement Routine",
              duration: "10 mins",
              description: "Gentle stretches, joint mobility, light activation exercises. Focus on spine, hips, and shoulders. Sets intention for active day.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-6-3",
              name: "Performance & Recovery Assessment",
              duration: "20 mins",
              description: "Compare measurements and performance to Day 1. Track progress in strength, endurance, and movement quality.",
              type: "exercise" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Complete recovery stack", "Anti-inflammatory nutrients", "Protein for muscle synthesis"],
          notes: "Integration day tests all systems together. Track progress to ensure training is driving positive adaptations."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Active Recovery & Planning",
          activities: [
            {
              id: "body-7-1",
              name: "Active Recovery Session",
              duration: "45 mins",
              description: "Yoga flows, easy swimming, gentle cycling, or walking. Promotes blood flow without adding training stress.",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-7-2",
              name: "Deep Tissue Recovery",
              duration: "30 mins",
              description: "Self-massage, foam rolling, or myofascial release. Address any tight spots or areas of tension from the week's training.",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-7-3",
              name: "Nutrition Planning & Prep",
              duration: "60 mins",
              description: "Plan and prepare performance-supporting meals for the upcoming week. Focus on protein, complex carbs, and anti-inflammatory foods.",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Recovery complex", "Sleep optimization stack", "Muscle repair nutrients"],
          notes: "Active recovery maintains movement while allowing adaptation. Plan nutrition to support next week's training goals."
        }
      ],
      balance: [
        {
          day: 1,
          dayName: "Monday",
          focus: "Stress Assessment & Circadian Rhythm",
          activities: [
            {
              id: "balance-1-1",
              name: "Morning Sunlight Exposure",
              duration: "20 mins",
              description: "Get outside within 30-60 minutes of waking, no sunglasses. Helps set healthy cortisol rhythm and circadian timing for better stress management.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-1-2",
              name: "Stress Response Assessment",
              duration: "15 mins",
              description: "Learn to recognise early stress signals in your body. Practice identifying physical sensations, emotions, and thought patterns during stress.",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-1-3",
              name: "Sleep Hygiene Protocol Setup",
              duration: "30 mins",
              description: "Establish consistent sleep schedule, cool dark room, no caffeine after 2pm, no screens 1 hour before bed. Sleep affects all hormones.",
              type: "recovery" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Ashwagandha (300-600mg for cortisol regulation)", "Magnesium glycinate (200-400mg)", "B-complex for neurotransmitter support"],
          notes: "Foundation day establishes circadian rhythm and stress awareness. Consistent sleep schedule is crucial for hormonal balance."
        },
        {
          day: 2,
          dayName: "Tuesday",
          focus: "Breathwork & Nervous System Regulation",
          activities: [
            {
              id: "balance-2-1",
              name: "4-7-8 Breathing for Stress",
              duration: "15 mins",
              description: "Inhale 4, hold 7, exhale 8. Practice daily for nervous system regulation. Use before stressful situations or as daily maintenance.",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-2-2",
              name: "Box Breathing Training",
              duration: "10 mins",
              description: "4-4-4-4 pattern breathing for acute stress management. Practice during breaks throughout the day for stress resilience.",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-2-3",
              name: "Stress Response Training",
              duration: "20 mins",
              description: "Practice response techniques like progressive muscle relaxation and brief mindfulness exercises when stress signals arise.",
              type: "meditation" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["GABA (500-750mg for nervous system support)", "L-theanine (200mg for calm focus)", "Phosphatidylserine (100mg for cortisol management)"],
          notes: "Breathwork is the fastest way to shift from sympathetic to parasympathetic nervous system activation."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Mindfulness & Present Moment Awareness",
          activities: [
            {
              id: "balance-3-1",
              name: "Mindfulness Meditation Practice",
              duration: "20 mins",
              description: "Present-moment awareness meditation. Start with 5 minutes, build to 20. Use guided apps initially. Creates space between stimulus and response.",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-3-2",
              name: "Mindful Eating Practice",
              duration: "30 mins",
              description: "Eat without distractions, chew slowly, pay attention to hunger/fullness cues. Practice gratitude for food. Improves digestion.",
              type: "nutrition" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-3-3",
              name: "Nature Therapy Session",
              duration: "30 mins",
              description: "Forest bathing - mindful time in nature without devices. Engage all senses, breathe deeply. Even 20 minutes provides measurable stress reduction.",
              type: "recovery" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["5-HTP for mood support", "Tryptophan for serotonin", "Rhodiola rosea (200-400mg for stress adaptation)"],
          notes: "Mindfulness training literally changes brain structure, improving emotional regulation and stress resilience."
        },
        {
          day: 4,
          dayName: "Thursday",
          focus: "Emotional Regulation & Hormonal Tracking",
          activities: [
            {
              id: "balance-4-1",
              name: "Emotional Regulation Training",
              duration: "25 mins",
              description: "Develop awareness of emotional triggers and patterns. Practice cognitive reframing, self-compassion, and healthy expression of emotions.",
              type: "meditation" as const,
              difficulty: "hard" as const
            },
            {
              id: "balance-4-2",
              name: "Hormonal Cycle Tracking",
              duration: "15 mins",
              description: "Track menstrual cycle, mood, energy, and symptoms. Use apps like Clue or Flo. Adjust training and nutrition based on cycle phases.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-4-3",
              name: "Journaling for Emotional Awareness",
              duration: "15 mins",
              description: "Write for 10-15 minutes about emotions and reflections. Helps process stress, identify patterns, develop emotional intelligence.",
              type: "meditation" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Omega-3 for inflammation reduction", "Vitamin D for mood", "SAMe for emotional balance"],
          notes: "Emotional regulation is a skill that improves with practice. Hormonal awareness helps optimize training and nutrition timing."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Social Connection & Joy",
          activities: [
            {
              id: "balance-5-1",
              name: "Social Connection & Community",
              duration: "60 mins",
              description: "Prioritize quality relationships, join groups, maintain regular contact with loved ones. Social support is crucial for stress resilience.",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-5-2",
              name: "Gratitude Practice",
              duration: "10 mins",
              description: "Write down 3 specific things you're grateful for each day. Be detailed and varied. Shifts focus from problems to positives.",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-5-3",
              name: "Joyful Movement Practice",
              duration: "30 mins",
              description: "Yoga, gentle movement, or any physical activity that brings joy. Focus on parasympathetic nervous system activation.",
              type: "exercise" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["B12 for energy and mood", "Rhodiola for adaptation", "Magnesium for relaxation"],
          notes: "Social connections and gratitude practices are scientifically proven to improve stress resilience and longevity."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Digital Detox & Energy Management",
          activities: [
            {
              id: "balance-6-1",
              name: "Digital Detox Training",
              duration: "4 hours",
              description: "Scheduled breaks from devices and social media. Create phone-free zones and times. Start with 1-hour daily, work up to half days.",
              type: "recovery" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-6-2",
              name: "Energy Audit Exercise",
              duration: "30 mins",
              description: "Identify energy drains and boosters in your life. Assess relationships, activities, and environments for their energetic impact.",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-6-3",
              name: "Restorative Movement",
              duration: "45 mins",
              description: "Tai chi, qigong, or gentle yoga focusing on breath and flow. Promotes parasympathetic activation and inner calm.",
              type: "exercise" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Adaptogen blend for stress resilience", "Coenzyme Q10 for cellular energy", "Calming herbs (chamomile, passionflower)"],
          notes: "Digital detox reduces overstimulation. Energy audit helps identify what truly serves your wellbeing."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Integration & Future Planning",
          activities: [
            {
              id: "balance-7-1",
              name: "Weekly Reflection & Integration",
              duration: "30 mins",
              description: "Journal about the week's experiences and insights. What stress management techniques worked best? What needs adjustment?",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-7-2",
              name: "Stress Management Planning",
              duration: "25 mins",
              description: "Plan stress management strategies for upcoming week. Identify potential stressors and prepare response strategies.",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-7-3",
              name: "Celebration & Self-Care Ritual",
              duration: "45 mins",
              description: "Create a meaningful self-care ritual to celebrate the week's progress. This could be a bath, massage, or favorite healthy meal.",
              type: "recovery" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Full spectrum multivitamin", "Probiotics for gut-brain axis", "Recovery and sleep support"],
          notes: "Integration and planning ensure sustainable stress management. Celebration reinforces positive changes and motivation."
        }
      ],
      beauty: [
        {
          day: 1,
          dayName: "Monday",
          focus: "Skin Assessment & UV Protection Foundation",
          activities: [
            {
              id: "beauty-1-1",
              name: "Comprehensive Skin Analysis",
              duration: "15 mins",
              description: "Evaluate skin type, concerns, and current condition. Take baseline photos in natural light. Identify specific areas needing attention.",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-1-2",
              name: "UV Protection Protocol Setup",
              duration: "10 mins",
              description: "Apply broad-spectrum SPF 30+ daily. Use 1/4 teaspoon to face, reapply every 2 hours outdoors. This is the most important anti-aging step.",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-1-3",
              name: "Hydration Optimization Protocol",
              duration: "All day",
              description: "Drink water equal to half your body weight in ounces daily. Add electrolytes if sweating. Proper hydration supports skin elasticity.",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Collagen peptides (10-20g daily, types I & III)", "Vitamin C (1000mg for collagen synthesis)", "Hyaluronic acid (100-200mg)"],
          notes: "UV protection is the single most important anti-aging intervention. Establish this foundation before other treatments."
        },
        {
          day: 2,
          dayName: "Tuesday",
          focus: "Active Skincare & Circulation",
          activities: [
            {
              id: "beauty-2-1",
              name: "Active Skincare Routine Implementation",
              duration: "20 mins",
              description: "Morning: gentle cleanser, vitamin C serum, moisturizer, SPF 30+. Evening: cleanser, retinol (2-3x/week), moisturizer. Start retinol slowly.",
              type: "beauty" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-2-2",
              name: "Facial Massage & Lymphatic Drainage",
              duration: "10 mins",
              description: "Use upward and outward strokes with gua sha tool. Start at center of face, work toward hairline and down to neck. Promotes circulation.",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-2-3",
              name: "Exercise for Blood Flow",
              duration: "30 mins",
              description: "Exercise increases circulation, delivering nutrients to skin cells and carrying away waste. Aim for activities that make you sweat.",
              type: "exercise" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Biotin & zinc for hair/nail health", "Astaxanthin (4-8mg) for UV protection", "Marine omega-3s for skin inflammation"],
          notes: "Active ingredients like retinol and vitamin C work synergistically. Start slowly to build tolerance and avoid irritation."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Collagen Support & Anti-Inflammatory Nutrition",
          activities: [
            {
              id: "beauty-3-1",
              name: "Collagen-Boosting Nutrition Protocol",
              duration: "45 mins",
              description: "Include vitamin C-rich foods, bone broth, marine collagen, antioxidant-rich berries. Limit sugar which damages collagen through glycation.",
              type: "nutrition" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-3-2",
              name: "Sugar Reduction for Collagen Protection",
              duration: "All day",
              description: "Limit added sugars and refined carbohydrates which cause glycation, damaging collagen fibres. Focus on whole foods and stable blood sugar.",
              type: "nutrition" as const,
              difficulty: "hard" as const
            },
            {
              id: "beauty-3-3",
              name: "Antioxidant-Rich Diet Implementation",
              duration: "All day",
              description: "Include colorful fruits and vegetables, green tea, dark chocolate, nuts, and seeds. Antioxidants protect against free radical damage.",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["NAD+ precursors for cellular repair", "Resveratrol for antioxidant protection", "Vitamin E for skin protection"],
          notes: "Nutrition is the foundation of skin health. Collagen production requires specific nutrients and is damaged by excess sugar."
        },
        {
          day: 4,
          dayName: "Thursday",
          focus: "Sleep Optimization & Stress Management",
          activities: [
            {
              id: "beauty-4-1",
              name: "Beauty Sleep Optimization",
              duration: "8 hours",
              description: "7-9 hours quality sleep. During sleep, skin repairs and regenerates. Growth hormone peaks during deep sleep, supporting collagen production.",
              type: "recovery" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-4-2",
              name: "Silk Pillowcase Protocol",
              duration: "All night",
              description: "Sleep on silk pillowcases - creates less friction than cotton, reducing hair breakage and skin irritation. Keep pillowcases clean.",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-4-3",
              name: "Stress Management for Skin Health",
              duration: "25 mins",
              description: "Chronic stress increases cortisol, which breaks down collagen and triggers skin issues. Practice stress-reduction techniques.",
              type: "meditation" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Magnesium for sleep quality", "Melatonin (if needed)", "Stress-support adaptogens"],
          notes: "Sleep is when skin repair happens. Stress management is crucial as cortisol directly damages collagen and skin health."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Professional Treatments & Deep Care",
          activities: [
            {
              id: "beauty-5-1",
              name: "Red Light Therapy Session",
              duration: "20 mins",
              description: "Professional LED red light therapy (660-850nm) stimulates collagen production and reduces inflammation. Can use at-home devices.",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-5-2",
              name: "Dry Brushing for Lymphatic Circulation",
              duration: "10 mins",
              description: "Use natural bristle brush on dry skin before showering. Brush toward heart in long strokes. Supports lymphatic drainage.",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-5-3",
              name: "Cold Water Face Treatment",
              duration: "5 mins",
              description: "End face washing with cool water rinse. Use ice cubes wrapped in cloth for 1-2 minutes. Stimulates circulation and tightens pores.",
              type: "beauty" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Copper for collagen synthesis", "Silicon for connective tissue", "Vitamin A for cell turnover"],
          notes: "Professional treatments accelerate results. Cold therapy and lymphatic drainage support natural detoxification processes."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Deep Treatment & Assessment",
          activities: [
            {
              id: "beauty-6-1",
              name: "Weekly Deep Treatment",
              duration: "45 mins",
              description: "Chemical peel (glycolic, lactic acid) or intensive mask treatment. Follow with soothing moisturizer and avoid sun exposure.",
              type: "beauty" as const,
              difficulty: "hard" as const
            },
            {
              id: "beauty-6-2",
              name: "Full Body Skin Care Routine",
              duration: "30 mins",
              description: "Extend skincare beyond face - exfoliate body, apply moisturizer with active ingredients, pay attention to neck, hands, décolletage.",
              type: "beauty" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-6-3",
              name: "Progress Documentation",
              duration: "10 mins",
              description: "Take progress photos in same lighting as Day 1. Document improvements in skin texture, tone, and overall appearance.",
              type: "beauty" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Full beauty complex", "Anti-inflammatory nutrients", "Recovery support"],
          notes: "Weekly deep treatments provide more dramatic results. Consistent documentation helps track progress and adjust protocols."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Integration & Long-term Planning",
          activities: [
            {
              id: "beauty-7-1",
              name: "Comprehensive Beauty Routine Review",
              duration: "30 mins",
              description: "Assess what worked best this week. Identify which products, treatments, and lifestyle changes had the most impact.",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-7-2",
              name: "Beauty-Supporting Meal Prep",
              duration: "60 mins",
              description: "Prepare skin-healthy meals for upcoming week. Focus on collagen-supporting nutrients, antioxidants, and anti-inflammatory foods.",
              type: "nutrition" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-7-3",
              name: "Self-Care & Relaxation Ritual",
              duration: "45 mins",
              description: "Create a luxurious self-care routine - bath with essential oils, face mask, gentle stretching. Stress reduction supports all beauty goals.",
              type: "recovery" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Complete multivitamin", "Probiotics for skin-gut axis", "Beauty maintenance stack"],
          notes: "Sustainable beauty comes from consistent daily habits, not occasional treatments. Plan for long-term success and enjoyment."
        }
      ]
    };

    return planTemplates[pillarType as keyof typeof planTemplates] || planTemplates.brain;
  };

  const currentPillar = pillarInfo[pillar as keyof typeof pillarInfo] || pillarInfo.brain;
  const planData = generateSevenDayPlan(pillar || 'brain');

  const toggleActivityCompletion = (activityId: string) => {
    const newCompleted = new Set(completedActivities);
    if (newCompleted.has(activityId)) {
      newCompleted.delete(activityId);
    } else {
      newCompleted.add(activityId);
    }
    setCompletedActivities(newCompleted);
  };

  const getCompletionPercentage = (day: DayPlan) => {
    const totalActivities = day.activities.length;
    const completedCount = day.activities.filter(activity => 
      completedActivities.has(activity.id)
    ).length;
    return Math.round((completedCount / totalActivities) * 100);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800'; 
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'exercise': return <Activity className="h-4 w-4" />;
      case 'meditation': return <Brain className="h-4 w-4" />;
      case 'nutrition': return <Utensils className="h-4 w-4" />;
      case 'beauty': return <Sparkles className="h-4 w-4" />;
      case 'recovery': return <Heart className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  if (!pillar || !currentPillar) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Invalid Plan</h1>
            <p className="text-muted-foreground mb-6">
              The requested 7-day plan could not be found.
            </p>
            <Button onClick={() => navigate('/pillars')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Pillars
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/pillars')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Pillars
          </Button>
          
          <div className={`bg-gradient-to-r ${currentPillar.color} p-6 rounded-lg text-white mb-6`}>
            <div className="flex items-center gap-4">
              <currentPillar.icon className="h-10 w-10" />
              <div>
                <h1 className="text-3xl font-bold">{currentPillar.title}</h1>
                <p className="text-lg opacity-90">{currentPillar.description}</p>
              </div>
            </div>
          </div>

          {/* Progress Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Week Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2 mb-4">
                {planData.map((day, index) => {
                  const completionPercentage = getCompletionPercentage(day);
                  const isCurrentDay = currentDay === day.day;
                  
                  return (
                    <div
                      key={day.day}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isCurrentDay 
                          ? 'border-primary bg-primary/10 ring-2 ring-primary/20' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setCurrentDay(day.day)}
                    >
                      <div className="text-center">
                        <div className="text-sm font-medium mb-1">{day.dayName}</div>
                        <div className="text-xs text-muted-foreground mb-2">Day {day.day}</div>
                        <Progress value={completionPercentage} className="h-1" />
                        <div className="text-xs mt-1">{completionPercentage}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Day Plan */}
        {planData.map((day) => (
          currentDay === day.day && (
            <div key={day.day} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {day.dayName} - Day {day.day}
                    </span>
                    <Badge variant="outline" className="text-sm">
                      Focus: {day.focus}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {day.notes}
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Activities */}
              <Card>
                <CardHeader>
                  <CardTitle>Today's Activities</CardTitle>
                  <CardDescription>
                    Complete these activities to achieve your daily goals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {day.activities.map((activity, index) => {
                      const isCompleted = completedActivities.has(activity.id);
                      
                      return (
                        <div
                          key={activity.id}
                          className={`p-4 border rounded-lg transition-all ${
                            isCompleted 
                              ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' 
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-start gap-4">
                            <Button
                              variant={isCompleted ? "default" : "outline"}
                              size="sm"
                              onClick={() => toggleActivityCompletion(activity.id)}
                              className="mt-1"
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="h-4 w-4" />
                              ) : (
                                <PlayCircle className="h-4 w-4" />
                              )}
                            </Button>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getActivityIcon(activity.type)}
                                <h4 className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>
                                  {activity.name}
                                </h4>
                                <Badge variant="outline" className={getDifficultyColor(activity.difficulty)}>
                                  {activity.difficulty}
                                </Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Timer className="h-3 w-3" />
                                  {activity.duration}
                                </div>
                              </div>
                              <p className={`text-sm ${isCompleted ? 'line-through text-muted-foreground' : 'text-muted-foreground'}`}>
                                {activity.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Supplements */}
              {day.supplements && day.supplements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Today's Supplements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {day.supplements.map((supplement, index) => (
                        <div key={index} className="p-3 border rounded-lg">
                          <span className="font-medium">{supplement}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Navigation */}
              <div className="flex justify-between items-center pt-6">
                <Button
                  variant="outline"
                  onClick={() => setCurrentDay(Math.max(1, currentDay - 1))}
                  disabled={currentDay === 1}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous Day
                </Button>
                
                <div className="text-center">
                  <div className="text-lg font-semibold">Day {currentDay} of 7</div>
                  <Progress value={(currentDay / 7) * 100} className="w-32 mt-2" />
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentDay(Math.min(7, currentDay + 1))}
                  disabled={currentDay === 7}
                >
                  Next Day
                  <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                </Button>
              </div>
            </div>
          )
        ))}
      </main>
    </div>
  );
};

export default SevenDayPlan;