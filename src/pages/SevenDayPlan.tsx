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
          focus: "Cognitive Assessment & Foundation",
          activities: [
            {
              id: "brain-1-1",
              name: "Morning Meditation",
              duration: "15 mins",
              description: "Mindfulness meditation to establish baseline mental clarity",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-1-2", 
              name: "Brain Training Games",
              duration: "20 mins",
              description: "Logic puzzles and memory exercises to activate neural pathways",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-1-3",
              name: "Omega-3 Rich Meal",
              duration: "30 mins",
              description: "Prepare salmon with walnuts to support brain health",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Omega-3 Fish Oil", "B-Complex Vitamins", "Magnesium"],
          notes: "Focus on establishing baseline cognitive function and introducing brain-healthy habits."
        },
        {
          day: 2,
          dayName: "Tuesday", 
          focus: "Memory Enhancement",
          activities: [
            {
              id: "brain-2-1",
              name: "Memory Palace Technique",
              duration: "25 mins", 
              description: "Learn and practice spatial memory techniques",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-2-2",
              name: "Reading Comprehension",
              duration: "30 mins",
              description: "Active reading with note-taking to improve retention",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-2-3",
              name: "Blueberry Power Bowl",
              duration: "15 mins",
              description: "Antioxidant-rich breakfast to support memory formation",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Ginkgo Biloba", "Phosphatidylserine", "Lion's Mane"],
          notes: "Focus on memory formation and retention techniques."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Focus & Concentration",
          activities: [
            {
              id: "brain-3-1",
              name: "Pomodoro Focus Sessions",
              duration: "2 hours",
              description: "25-minute focused work blocks with 5-minute breaks",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-3-2",
              name: "Breathing Exercises",
              duration: "10 mins",
              description: "Box breathing to improve attention and reduce brain fog",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-3-3",
              name: "Green Tea Ritual",
              duration: "10 mins",
              description: "Mindful green tea consumption for L-theanine benefits",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["L-Theanine", "Rhodiola Rosea", "Bacopa Monnieri"],
          notes: "Develop sustained attention and concentration skills."
        },
        {
          day: 4,
          dayName: "Thursday",
          focus: "Processing Speed",
          activities: [
            {
              id: "brain-4-1",
              name: "Rapid Decision Games",
              duration: "20 mins",
              description: "Quick-fire cognitive challenges to improve processing speed",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "brain-4-2",
              name: "Speed Reading Practice",
              duration: "30 mins",
              description: "Techniques to increase reading speed while maintaining comprehension",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-4-3",
              name: "Brain-Boosting Smoothie",
              duration: "10 mins",
              description: "Spinach, berries, and protein powder for mental energy",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Modafinil Alternative", "Caffeine + L-Theanine", "Alpha-GPC"],
          notes: "Challenge processing speed and reaction time."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Creative Thinking",
          activities: [
            {
              id: "brain-5-1",
              name: "Creative Brainstorming",
              duration: "45 mins",
              description: "Divergent thinking exercises to boost creativity",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-5-2",
              name: "Art or Music Therapy",
              duration: "30 mins",
              description: "Engage in creative activities to stimulate right brain function",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-5-3",
              name: "Dark Chocolate Break",
              duration: "5 mins",
              description: "70%+ cacao chocolate for cognitive enhancement",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["BDNF Enhancers", "Curcumin", "Resveratrol"],
          notes: "Stimulate creative and innovative thinking patterns."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Integration & Review",
          activities: [
            {
              id: "brain-6-1",
              name: "Weekly Review Session",
              duration: "60 mins",
              description: "Consolidate learning and assess cognitive improvements",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "brain-6-2",
              name: "Social Learning",
              duration: "2 hours",
              description: "Engage in meaningful conversations or group learning",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-6-3",
              name: "Mediterranean Meal",
              duration: "45 mins",
              description: "Prepare a brain-healthy Mediterranean-style dinner",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Full Spectrum B-Vitamins", "Omega-3", "Vitamin D"],
          notes: "Integrate the week's learning and plan for continued improvement."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Recovery & Planning",
          activities: [
            {
              id: "brain-7-1",
              name: "Restorative Meditation",
              duration: "30 mins",
              description: "Deep relaxation to consolidate neural adaptations",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-7-2",
              name: "Nature Walk",
              duration: "45 mins",
              description: "Outdoor walk for mental restoration and vitamin D",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "brain-7-3",
              name: "Meal Prep Planning",
              duration: "30 mins",
              description: "Plan brain-healthy meals for the upcoming week",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Stress Support Complex", "Sleep Enhancement", "Recovery Blend"],
          notes: "Allow for recovery and plan continued cognitive enhancement."
        }
      ],
      body: [
        {
          day: 1,
          dayName: "Monday",
          focus: "Strength Foundation",
          activities: [
            {
              id: "body-1-1",
              name: "Full Body Assessment",
              duration: "30 mins",
              description: "Baseline strength and mobility testing",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-1-2",
              name: "Foundation Strength Training",
              duration: "45 mins", 
              description: "Basic compound movements: squats, push-ups, planks",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-1-3",
              name: "Post-Workout Protein",
              duration: "10 mins",
              description: "Whey or plant protein shake within 30 minutes",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Whey Protein", "Creatine", "Multivitamin"],
          notes: "Establish baseline fitness and introduce fundamental movement patterns."
        },
        {
          day: 2,
          dayName: "Tuesday",
          focus: "Cardiovascular Health",
          activities: [
            {
              id: "body-2-1",
              name: "HIIT Cardio Session",
              duration: "25 mins",
              description: "High-intensity intervals alternating with rest periods",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "body-2-2", 
              name: "Active Recovery Walk",
              duration: "20 mins",
              description: "Light walking to promote circulation and recovery",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-2-3",
              name: "Hydration Protocol",
              duration: "All day",
              description: "Drink 3-4 liters of water with electrolytes",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Electrolyte Blend", "Beetroot Extract", "Coenzyme Q10"],
          notes: "Focus on cardiovascular conditioning and recovery."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Flexibility & Mobility",
          activities: [
            {
              id: "body-3-1",
              name: "Yoga Flow Session",
              duration: "60 mins",
              description: "Dynamic yoga sequence for flexibility and strength",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-3-2",
              name: "Foam Rolling",
              duration: "15 mins",
              description: "Myofascial release for muscle recovery",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-3-3",
              name: "Anti-Inflammatory Meal",
              duration: "30 mins",
              description: "Turmeric-spiced vegetables with lean protein",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Turmeric Curcumin", "Glucosamine", "MSM"],
          notes: "Improve range of motion and reduce muscle tension."
        },
        {
          day: 4,
          dayName: "Thursday", 
          focus: "Upper Body Power",
          activities: [
            {
              id: "body-4-1",
              name: "Upper Body Strength",
              duration: "50 mins",
              description: "Push-ups, pull-ups, shoulder presses, rows",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "body-4-2",
              name: "Core Strengthening",
              duration: "20 mins",
              description: "Planks, dead bugs, bird dogs, mountain climbers",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-4-3",
              name: "Recovery Nutrition",
              duration: "15 mins",
              description: "Post-workout meal with carbs and protein",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["BCAA", "Glutamine", "Vitamin D"],
          notes: "Build upper body strength and core stability."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Lower Body Power",
          activities: [
            {
              id: "body-5-1",
              name: "Lower Body Strength", 
              duration: "50 mins",
              description: "Squats, lunges, deadlifts, calf raises",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "body-5-2",
              name: "Plyometric Training",
              duration: "20 mins",
              description: "Jump squats, box jumps, burpees for explosive power",
              type: "exercise" as const,
              difficulty: "hard" as const
            },
            {
              id: "body-5-3",
              name: "Recovery Smoothie",
              duration: "10 mins",
              description: "Banana, berries, protein powder, spinach blend",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Protein Powder", "Creatine", "Beta-Alanine"],
          notes: "Develop lower body strength and explosive power."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Endurance & Integration",
          activities: [
            {
              id: "body-6-1",
              name: "Long Duration Cardio",
              duration: "45 mins",
              description: "Steady-state cardio at moderate intensity",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-6-2",
              name: "Full Body Circuit",
              duration: "30 mins",
              description: "Combine all movement patterns learned this week",
              type: "exercise" as const,
              difficulty: "medium" as const
            },
            {
              id: "body-6-3",
              name: "Meal Prep Session",
              duration: "60 mins",
              description: "Prepare healthy meals for the upcoming week",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Multivitamin", "Omega-3", "Probiotics"],
          notes: "Test endurance capacity and integrate all training elements."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Recovery & Assessment",
          activities: [
            {
              id: "body-7-1",
              name: "Gentle Stretching",
              duration: "30 mins",
              description: "Full body stretch routine for recovery",
              type: "recovery" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-7-2",
              name: "Progress Assessment",
              duration: "20 mins",
              description: "Compare measurements and performance to Day 1",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "body-7-3",
              name: "Restorative Nutrition",
              duration: "45 mins",
              description: "Nutrient-dense meal focusing on recovery",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Magnesium", "Zinc", "Recovery Complex"],
          notes: "Allow for complete recovery and assess week's progress."
        }
      ],
      balance: [
        {
          day: 1,
          dayName: "Monday",
          focus: "Stress Assessment & Grounding",
          activities: [
            {
              id: "balance-1-1",
              name: "Stress Level Assessment",
              duration: "20 mins",
              description: "Evaluate current stress levels and triggers",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-1-2",
              name: "Grounding Exercise",
              duration: "15 mins",
              description: "5-4-3-2-1 sensory grounding technique",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-1-3",
              name: "Adaptogenic Tea",
              duration: "10 mins",
              description: "Ashwagandha or rhodiola tea for stress support",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Ashwagandha", "L-Theanine", "Magnesium"],
          notes: "Establish baseline stress levels and introduce calming practices."
        },
        {
          day: 2,
          dayName: "Tuesday",
          focus: "Breathing & Relaxation",
          activities: [
            {
              id: "balance-2-1",
              name: "Deep Breathing Practice",
              duration: "25 mins",
              description: "4-7-8 breathing technique for nervous system regulation",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-2-2",
              name: "Progressive Muscle Relaxation",
              duration: "30 mins",
              description: "Systematic tension and release of muscle groups",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-2-3",
              name: "Calming Herbal Blend",
              duration: "5 mins",
              description: "Chamomile and lavender tea before bed",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["GABA", "Chamomile Extract", "Passionflower"],
          notes: "Focus on breath work and muscle relaxation techniques."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Mindfulness & Presence",
          activities: [
            {
              id: "balance-3-1",
              name: "Mindfulness Meditation",
              duration: "30 mins",
              description: "Present-moment awareness meditation",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-3-2",
              name: "Mindful Walking",
              duration: "20 mins",
              description: "Slow, conscious walking with awareness",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-3-3",
              name: "Mindful Eating Practice",
              duration: "30 mins",
              description: "Slow, conscious meal consumption",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["5-HTP", "Tryptophan", "B-Complex"],
          notes: "Develop present-moment awareness and mindful habits."
        },
        {
          day: 4,
          dayName: "Thursday",
          focus: "Emotional Regulation",
          activities: [
            {
              id: "balance-4-1",
              name: "Emotion Recognition",
              duration: "25 mins",
              description: "Journal emotions and identify patterns",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-4-2",
              name: "Cognitive Reframing",
              duration: "30 mins",
              description: "Practice changing negative thought patterns",
              type: "meditation" as const,
              difficulty: "hard" as const
            },
            {
              id: "balance-4-3",
              name: "Mood-Supporting Foods",
              duration: "30 mins",
              description: "Omega-3 rich meal with complex carbohydrates",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Omega-3", "Vitamin D", "St. John's Wort"],
          notes: "Learn to recognize and regulate emotional responses."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Social Connection & Joy",
          activities: [
            {
              id: "balance-5-1",
              name: "Social Interaction",
              duration: "60 mins",
              description: "Quality time with friends or family",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-5-2",
              name: "Gratitude Practice",
              duration: "15 mins",
              description: "Write down 5 things you're grateful for",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-5-3",
              name: "Comfort Food (Healthy)",
              duration: "45 mins",
              description: "Prepare a favorite healthy comfort meal",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["SAMe", "Rhodiola", "B12"],
          notes: "Focus on social connections and positive emotions."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Energy Management",
          activities: [
            {
              id: "balance-6-1",
              name: "Energy Audit",
              duration: "30 mins",
              description: "Identify energy drains and boosters in your life",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-6-2",
              name: "Gentle Movement",
              duration: "45 mins",
              description: "Tai chi, qigong, or gentle yoga",
              type: "exercise" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-6-3",
              name: "Energy-Supporting Meal",
              duration: "30 mins",
              description: "Balanced meal with stable blood sugar impact",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Coenzyme Q10", "Iron (if deficient)", "Adaptogen Blend"],
          notes: "Optimize energy levels and identify sustainability patterns."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Integration & Future Planning",
          activities: [
            {
              id: "balance-7-1",
              name: "Weekly Reflection",
              duration: "30 mins",
              description: "Journal about the week's experiences and insights",
              type: "meditation" as const,
              difficulty: "easy" as const
            },
            {
              id: "balance-7-2",
              name: "Future Planning Session",
              duration: "45 mins",
              description: "Plan stress management strategies for upcoming week",
              type: "meditation" as const,
              difficulty: "medium" as const
            },
            {
              id: "balance-7-3",
              name: "Celebration Meal",
              duration: "60 mins",
              description: "Prepare and enjoy a special, healthy meal",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Full Spectrum Multivitamin", "Probiotics", "Recovery Complex"],
          notes: "Integrate learnings and plan for sustainable stress management."
        }
      ],
      beauty: [
        {
          day: 1,
          dayName: "Monday",
          focus: "Skin Assessment & Cleansing",
          activities: [
            {
              id: "beauty-1-1",
              name: "Skin Analysis",
              duration: "15 mins",
              description: "Evaluate skin type, concerns, and current condition",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-1-2",
              name: "Deep Cleansing Routine",
              duration: "20 mins",
              description: "Double cleanse with oil and water-based cleanser",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-1-3",
              name: "Hydrating Foods",
              duration: "30 mins",
              description: "Water-rich foods: cucumber, watermelon, leafy greens",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Collagen Peptides", "Hyaluronic Acid", "Vitamin C"],
          notes: "Establish baseline skin condition and introduce proper cleansing."
        },
        {
          day: 2,
          dayName: "Tuesday",
          focus: "Exfoliation & Renewal",
          activities: [
            {
              id: "beauty-2-1",
              name: "Gentle Exfoliation",
              duration: "15 mins",
              description: "AHA/BHA exfoliant or gentle physical scrub",
              type: "beauty" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-2-2",
              name: "Hydrating Face Mask",
              duration: "20 mins",
              description: "Apply nourishing face mask for 15-20 minutes",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-2-3",
              name: "Antioxidant Smoothie",
              duration: "10 mins",
              description: "Berries, spinach, and vitamin C for skin protection",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Biotin", "Vitamin E", "Zinc"],
          notes: "Focus on cell turnover and skin renewal processes."
        },
        {
          day: 3,
          dayName: "Wednesday",
          focus: "Hydration & Nourishment",
          activities: [
            {
              id: "beauty-3-1",
              name: "Intensive Moisturizing",
              duration: "15 mins",
              description: "Apply rich moisturizer with facial massage",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-3-2",
              name: "Hair Treatment",
              duration: "30 mins",
              description: "Deep conditioning hair mask with scalp massage",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-3-3",
              name: "Beauty-Boosting Meal",
              duration: "30 mins",
              description: "Avocado, nuts, seeds, and healthy fats",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Essential Fatty Acids", "Silica", "MSM"],
          notes: "Deep hydration and nourishment for skin and hair."
        },
        {
          day: 4,
          dayName: "Thursday",
          focus: "Anti-Aging & Protection",
          activities: [
            {
              id: "beauty-4-1",
              name: "Retinol/Retinoid Application",
              duration: "10 mins",
              description: "Apply anti-aging serum (start with lower concentration)",
              type: "beauty" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-4-2",
              name: "Sunscreen Protocol",
              duration: "5 mins",
              description: "Apply broad-spectrum SPF 30+ (reapply every 2 hours)",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-4-3",
              name: "Anti-Inflammatory Foods",
              duration: "30 mins",
              description: "Turmeric, green tea, dark leafy greens",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Resveratrol", "Curcumin", "Green Tea Extract"],
          notes: "Focus on prevention and protection against aging factors."
        },
        {
          day: 5,
          dayName: "Friday",
          focus: "Circulation & Glow",
          activities: [
            {
              id: "beauty-5-1",
              name: "Facial Massage",
              duration: "20 mins",
              description: "Gua sha or jade roller facial massage",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-5-2",
              name: "Body Brushing",
              duration: "10 mins",
              description: "Dry brush skin before shower for circulation",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-5-3",
              name: "Glow-Enhancing Foods",
              duration: "30 mins",
              description: "Beta-carotene rich foods: carrots, sweet potato, papaya",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Beta-Carotene", "Vitamin A", "Copper"],
          notes: "Enhance circulation and natural skin radiance."
        },
        {
          day: 6,
          dayName: "Saturday",
          focus: "Detox & Purification",
          activities: [
            {
              id: "beauty-6-1",
              name: "Detoxifying Face Mask",
              duration: "25 mins",
              description: "Clay or charcoal mask to draw out impurities",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-6-2",
              name: "Lymphatic Drainage",
              duration: "15 mins",
              description: "Gentle massage to promote lymphatic drainage",
              type: "beauty" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-6-3",
              name: "Detox Water",
              duration: "All day",
              description: "Lemon, cucumber, mint infused water throughout day",
              type: "nutrition" as const,
              difficulty: "easy" as const
            }
          ],
          supplements: ["Milk Thistle", "Glutathione", "NAC"],
          notes: "Support natural detoxification processes for clearer skin."
        },
        {
          day: 7,
          dayName: "Sunday",
          focus: "Restoration & Maintenance",
          activities: [
            {
              id: "beauty-7-1",
              name: "Restorative Face Treatment",
              duration: "45 mins",
              description: "Multi-step facial with serum and moisturizer",
              type: "beauty" as const,
              difficulty: "medium" as const
            },
            {
              id: "beauty-7-2",
              name: "Progress Photos",
              duration: "10 mins",
              description: "Take photos to compare with Day 1 baseline",
              type: "beauty" as const,
              difficulty: "easy" as const
            },
            {
              id: "beauty-7-3",
              name: "Beauty-Supporting Meal Prep",
              duration: "60 mins",
              description: "Prepare skin-healthy meals for the upcoming week",
              type: "nutrition" as const,
              difficulty: "medium" as const
            }
          ],
          supplements: ["Complete Beauty Complex", "Probiotics", "Multivitamin"],
          notes: "Restore and maintain the improvements gained throughout the week."
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