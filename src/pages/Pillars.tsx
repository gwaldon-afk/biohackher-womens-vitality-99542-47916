import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Zap, Sparkles, UserRound, Pill, Activity, ChevronDown, Target, Lightbulb, TestTube, Calendar, AlertTriangle, CheckCircle, ShoppingCart } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/useCart";
import { useAssessmentCompletions } from "@/hooks/useAssessmentCompletions";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTranslation } from "react-i18next";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";

const Pillars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { completions, loading } = useAssessmentCompletions();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);
  const { t } = useTranslation();

  // Check for pillar parameter in URL and auto-select
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pillarParam = urlParams.get('pillar');
    if (pillarParam && pillars[pillarParam as keyof typeof pillars]) {
      setSelectedPillar(pillarParam);
    }
  }, []);

  const pillars = {
    brain: {
      title: t('pillars.brain'),
      subtitle: "Get on top of brain fog and sharpen your mind",
      image: brainPillar,
      icon: Brain,
      color: "from-purple-500 to-indigo-600",
      symptomAssessments: [
        {
          title: "Brain Fog Assessment",
          description: "Evaluate mental clarity and cognitive function",
          duration: "5 minutes",
          questions: 12
        },
        {
          title: "Memory & Focus Analysis",
          description: "Assess concentration and memory performance",
          duration: "4 minutes",
          questions: 10
        }
      ],
      biohacks: {
        training: {
          beginner: [
            "Morning sunlight exposure protocol (10-30 minutes)",
            "Quality sleep optimization (7-9 hours, consistent schedule)",
            "Meditation & mindfulness practices (8-12 minutes daily)",
            "Reading fiction (improves empathy and cognitive flexibility)"
          ],
          intermediate: [
            "Learning new languages (increases neuroplasticity by 30%)",
            "Speed reading practice (doubles reading efficiency)",
            "Memory palace technique for information retention",
            "Regular aerobic exercise (Zone 2 cardio for BDNF)",
            "Intermittent fasting (14-16 hour windows)"
          ],
          advanced: [
            "Dual N-back cognitive training games (2-3x/week)",
            "Playing musical instruments (enhances working memory)",
            "Cold exposure training (2-11 minutes, 50-59°F)",
            "Breathwork training (4-7-8 breathing, box breathing)"
          ]
        },
        therapy: {
          beginner: [
            "Professional sleep optimization coaching",
            "Cognitive behavioural therapy (CBT)",
            "Guided meditation & mindfulness training"
          ],
          intermediate: [
            "Neurofeedback training sessions",
            "Red light therapy for mitochondrial function",
            "Flotation tank sessions for deep relaxation",
            "Hyperbaric oxygen therapy (HBOT)"
          ],
          advanced: [
            "Transcranial direct current stimulation (tDCS)",
            "Binaural beats therapy (40Hz gamma waves)",
            "IV therapy for cognitive enhancement",
            "Brain mapping and assessment"
          ]
        }
      },
      supplements: [
        "Omega-3 fatty acids (EPA/DHA 1-3g daily)",
        "Magnesium glycinate (200-400mg before bed)", 
        "B-complex vitamins for neurotransmitter support",
        "Lion's Mane mushroom (500-1000mg)",
        "Rhodiola rosea for stress adaptation",
        "Phosphatidylserine for memory",
        "Alpha-GPC for acetylcholine support",
        "Creatine monohydrate (3-5g daily)"
      ],
      content: {
        overview: "Optimise your cognitive function with evidence-based brain health protocols. From nootropics to neurofeedback, discover personalised strategies to enhance memory, focus, and mental clarity.",
        keyAreas: ["Cognitive Enhancement", "Memory Optimization", "Focus & Concentration", "Neuroprotection", "Mental Clarity"]
      }
    },
    body: {
      title: t('pillars.body'),
      subtitle: "Keep your body agile and mobile by fighting the signs of ageing",
      image: bodyPillar,
      icon: Activity,
      color: "from-green-500 to-emerald-600",
      symptomAssessments: [
        {
          title: "Energy & Fatigue Assessment",
          description: "Evaluate physical energy levels and fatigue patterns",
          duration: "6 minutes",
          questions: 14
        },
        {
          title: "Mobility & Strength Analysis",
          description: "Assess physical function and movement quality",
          duration: "5 minutes",
          questions: 12
        }
      ],
      biohacks: {
        training: {
          beginner: [
            "Walking 8,000-10,000 steps daily",
            "Morning movement routine (5-10 minutes)", 
            "Mobility work & dynamic stretching (daily 15 min)",
            "Functional movement patterns training"
          ],
          intermediate: [
            "Zone 2 cardio training (180-age in BPM, 45-60 min)",
            "Strength training 3-4x/week (compound movements)",
            "Progressive overload resistance training",
            "Active recovery protocols (yoga, swimming)",
            "Breathwork training for performance"
          ],
          advanced: [
            "High-intensity interval training (HIIT 2x/week)",
            "Plyometric exercises for power development",
            "Balance and proprioception training",
            "Movement quality assessment and correction"
          ]
        },
        therapy: {
          beginner: [
            "Deep tissue massage (weekly/bi-weekly)",
            "Recovery monitoring (HRV, sleep tracking)",
            "Myofascial release techniques"
          ],
          intermediate: [
            "Heat therapy: Sauna 4x/week (174-212°F, 20 min)",
            "Infrared sauna for muscle recovery",
            "Physical therapy movement assessment",
            "Compression therapy for circulation"
          ],
          advanced: [
            "Cold plunge therapy (50-59°F, 2-11 minutes)",
            "Cryotherapy sessions for recovery",
            "PEMF (Pulsed Electromagnetic Field) therapy",
            "IV hydration and nutrient therapy",
            "Hormone optimization therapy"
          ]
        }
      },
      supplements: [
        "Whey or plant protein (20-40g post-workout)",
        "Creatine monohydrate (3-5g daily)",
        "Collagen peptides (10-20g for joints)",
        "Vitamin D3 + K2 (2000-4000 IU D3)",
        "Magnesium (glycinate or citrate, 200-400mg)",
        "Omega-3 fish oil (1-3g EPA/DHA)",
        "Electrolyte replacement (sodium, potassium)",
        "CoQ10 for mitochondrial support (100-200mg)"
      ],
      content: {
        overview: "Maintain peak physical performance and combat aging with cutting-edge body optimization techniques. From strength training to metabolic enhancement.",
        keyAreas: ["Strength & Mobility", "Metabolic Health", "Recovery Optimization", "Body Composition", "Physical Resilience"]
      }
    },
    balance: {
      title: t('pillars.balance'),
      subtitle: "Achieve inner calm and peace",
      image: balancePillar,
      icon: Zap,
      color: "from-blue-500 to-cyan-600",
      symptomAssessments: [
        {
          title: "Stress & Anxiety Assessment",
          description: "Evaluate stress levels and emotional balance",
          duration: "6 minutes",
          questions: 14
        },
        {
          title: "Hormonal Balance Evaluation",
          description: "Assess hormonal health and mood stability",
          duration: "5 minutes",
          questions: 11
        }
      ],
      biohacks: {
        training: {
          beginner: [
            "Morning sunlight exposure (10-30 min for cortisol regulation)",
            "Sleep hygiene protocol implementation", 
            "Gratitude practice (3 things daily)",
            "Mindful eating practices"
          ],
          intermediate: [
            "Stress-reducing breathwork training (4-7-8, box breathing)",
            "Meditation & mindfulness practice (10-20 min daily)",
            "Yoga & gentle movement practices",
            "Journaling for emotional regulation",
            "Digital detox training periods"
          ],
          advanced: [
            "Hormonal cycle tracking & optimization",
            "Forest bathing & nature therapy sessions",
            "Stress response training techniques",
            "Emotional regulation skill building"
          ]
        },
        therapy: {
          beginner: [
            "Professional massage therapy",
            "Guided meditation & mindfulness training",
            "Sleep therapy and optimization"
          ],
          intermediate: [
            "Stress management counseling & CBT",
            "HRV training for autonomic balance",
            "Light therapy for circadian rhythm support",
            "Acupuncture for nervous system balance"
          ],
          advanced: [
            "Hormone testing & optimization protocols",
            "Biofeedback therapy sessions",
            "Adaptogenic herb protocol guidance",
            "Nutritional therapy for mood balance"
          ]
        }
      },
      supplements: [
        "Ashwagandha (300-600mg for cortisol regulation)",
        "Magnesium glycinate (200-400mg for relaxation)",
        "GABA (500-750mg for nervous system support)",
        "L-theanine (200mg for calm focus)",
        "Rhodiola rosea (200-400mg for stress adaptation)",
        "Phosphatidylserine (100mg for cortisol management)",
        "B-complex for neurotransmitter support",
        "Omega-3s for inflammation reduction"
      ],
      content: {
        overview: "Find your equilibrium through stress management, hormonal optimization, and mindfulness practices. Create lasting balance in your daily life.",
        keyAreas: ["Stress Management", "Hormonal Balance", "Emotional Regulation", "Mindfulness", "Life Balance"]
      }
    },
    beauty: {
      title: t('pillars.beauty'),
      subtitle: "Learn to glow from the outside in with the latest hacks to keep you looking younger than ever",
      image: beautyPillar,
      icon: Sparkles,
      color: "from-pink-500 to-rose-600",
      symptomAssessments: [
        {
          title: "Skin Health Assessment",
          description: "Evaluate skin condition and aging markers",
          duration: "4 minutes",
          questions: 9
        },
        {
          title: "Beauty & Aging Analysis",
          description: "Assess aesthetic concerns and anti-aging needs",
          duration: "6 minutes",
          questions: 13
        }
      ],
      biohacks: {
        training: {
          beginner: [
            "UV protection with broad-spectrum SPF 30+",
            "Hydration optimization (half body weight in oz)",
            "Beauty sleep optimization (7-9 hours)",
            "Daily skincare routine with active ingredients"
          ],
          intermediate: [
            "Facial massage & lymphatic drainage (5 min daily)",
            "Collagen-boosting nutrition protocols",
            "Antioxidant-rich diet implementation",
            "Sugar reduction for collagen protection",
            "Regular exercise for blood flow"
          ],
          advanced: [
            "Facial exercises for muscle tone (gua sha)",
            "Cold water face rinses for circulation",
            "Dry brushing for lymphatic circulation",
            "Stress management for skin health"
          ]
        },
        therapy: {
          beginner: [
            "Professional dermatological treatments",
            "Nutrition counseling for skin health",
            "Aesthetic consultation & treatment planning"
          ],
          intermediate: [
            "Professional LED red light therapy (660-850nm)",
            "Chemical peels (glycolic, lactic acid)",
            "Lymphatic drainage massage therapy",
            "Hormone optimization for anti-aging"
          ],
          advanced: [
            "Microneedling for collagen induction",
            "IV therapy for beauty enhancement",
            "Laser therapy for skin rejuvenation",
            "Platelet-rich plasma (PRP) treatments"
          ]
        }
      },
      supplements: [
        "Collagen peptides (10-20g daily, types I & III)",
        "Vitamin C (1000mg for collagen synthesis)",
        "Hyaluronic acid (100-200mg for hydration)",
        "Biotin & zinc for hair/nail health",
        "Astaxanthin (4-8mg for UV protection)",
        "Marine omega-3s for skin inflammation",
        "NAD+ precursors for cellular repair",
        "Resveratrol for antioxidant protection"
      ],
      content: {
        overview: "Achieve radiant beauty from within using advanced anti-aging protocols, skincare innovations, and holistic beauty practices.",
        keyAreas: ["Skin Health", "Anti-Aging", "Cellular Regeneration", "Beauty Nutrition", "Aesthetic Optimization"]
      }
    }
  };

  // Protocol and therapy details for explanations
  const protocolDetails = {
    // Brain Training Protocols
    "Learning new languages (increases neuroplasticity by 30%)": "Start with 15-30 minutes daily using apps like Duolingo or Babbel. Focus on consistent daily practice rather than long sessions. Neuroplasticity benefits appear within 4-6 weeks.",
    "Playing musical instruments (enhances working memory)": "Practice any instrument for 20-30 minutes daily. Piano and guitar are excellent choices. Focus on learning new pieces rather than repeating familiar ones to maximize cognitive benefits.",
    "Dual N-back cognitive training games (2-3x/week)": "Use apps like Brain Workshop or online dual n-back games. Start with 2-back level and progress gradually. Train for 20 minutes, 2-3 times per week for working memory improvement.",
    "Speed reading practice (doubles reading efficiency)": "Use techniques like chunking, reducing subvocalization, and peripheral vision training. Practice 15-20 minutes daily with apps like Spreeder or 7 Speed Reading.",
    "Memory palace technique for information retention": "Create vivid mental maps of familiar places and associate information with specific locations. Start with your home layout and practice placing 5-10 items before expanding.",
    "Social engagement & meaningful relationships": "Prioritize face-to-face interactions, join communities aligned with your interests, practice active listening, and maintain regular contact with close friends and family.",
    "Reading fiction (improves empathy and cognitive flexibility)": "Read diverse fiction genres for 30+ minutes daily. Focus on character-driven narratives and different cultural perspectives to enhance emotional intelligence.",
    "Meditation & mindfulness practices (8-12 minutes daily)": "Start with guided meditations using apps like Headspace or Insight Timer. Focus on breath awareness, body scans, or loving-kindness meditation. Consistency matters more than duration.",
    "Breathwork training (4-7-8 breathing, box breathing)": "4-7-8: Inhale for 4, hold for 7, exhale for 8. Box breathing: 4-4-4-4 pattern. Practice 5-10 rounds, 2-3 times daily for stress reduction and focus enhancement.",
    "Cold exposure training (2-11 minutes, 10-15°C)": "Start with 30-second cold showers, gradually increase duration. Work up to 2-11 minutes in 10-15°C water. End hot showers with cold, or use ice baths for advanced practitioners.",
    "Morning sunlight exposure protocol (10-30 minutes)": "Get outside within 30-60 minutes of waking. Face east if possible, no sunglasses needed. 10 minutes on bright days, 30 minutes on overcast days to regulate circadian rhythm.",
    "Quality sleep optimisation (7-9 hours, consistent schedule)": "Maintain consistent sleep/wake times, keep bedroom cool (18-20°C), dark, and quiet. No screens 1 hour before bed, use blackout curtains or eye masks.",
    "Regular aerobic exercise (Zone 2 cardio for BDNF)": "Exercise at 60-70% max heart rate where you can still hold a conversation. 45-60 minutes, 2-3 times per week to boost brain-derived neurotrophic factor.",
    "Intermittent fasting (14-16 hour windows)": "Start with 12-hour overnight fast, gradually extend to 14-16 hours. Example: eat between 12pm-8pm, fast from 8pm-12pm next day. Stay hydrated during fasting periods.",

    // Body Training Protocols
    "Zone 2 cardio training (180-age in BPM, 45-60 min)": "Calculate target heart rate: 180 minus your age. Exercise at this intensity where you can still hold a conversation. Build aerobic base and mitochondrial function.",
    "Strength training 3-4x/week (compound movements)": "Focus on squats, deadlifts, bench press, rows, overhead press. 3-4 sets of 6-12 reps at 70-85% 1RM. Progressive overload is key - increase weight, reps, or sets weekly.",
    "High-intensity interval training (HIIT 2x/week)": "Alternate high-intensity bursts (85-95% max effort) with recovery periods. Example: 30 seconds work, 90 seconds rest, repeat 8-15 rounds. Limit to 2-3 sessions per week.",
    "Mobility work & dynamic stretching (daily 15 min)": "Include hip circles, leg swings, arm circles, and full-body movements. Focus on major joints and movement patterns you'll use in daily activities or workouts.",
    "Functional movement patterns training": "Practice squatting, lunging, pushing, pulling, rotating, and gait patterns. Use bodyweight or light resistance. Focus on quality movement before adding load.",
    "Progressive overload resistance training": "Gradually increase training stimulus through more weight, reps, sets, or frequency. Track workouts and aim to improve one variable each week while maintaining proper form.",
    "Plyometric exercises for power development": "Include jump squats, box jumps, burpees, medicine ball throws. 2-3 sets of 5-10 explosive reps with full recovery between sets. Focus on landing mechanics.",
    "Balance and proprioception training": "Single-leg stands, BOSU ball exercises, stability ball work, eyes-closed balance challenges. Start with 30 seconds, progress to 2 minutes per exercise.",
    "Walking 8,000-10,000 steps daily": "Use a pedometer or smartphone to track. Break into manageable chunks throughout the day. Take stairs, park farther away, have walking meetings when possible.",
    "Morning movement routine (5-10 minutes)": "Include gentle stretches, joint mobility, and light activation exercises. Focus on spine, hips, and shoulders. Sets intention for active day ahead.",
    "Active recovery protocols (yoga, swimming)": "Low-intensity activities on rest days. Yoga flows, easy swimming, gentle cycling, or walking. Promotes blood flow without adding training stress.",
    "Breathwork training for performance": "Practice rhythmic breathing during exercise. Nasal breathing during low intensity, mouth breathing during high intensity. Use breathing to manage effort and recovery.",
    "Movement quality assessment and correction": "Video record exercises to check form. Work with qualified trainer for movement screen. Address imbalances and compensations before they become problems.",
    "Sport-specific skill development": "Practice skills relevant to your chosen activities. Focus on technique before intensity. Break complex movements into components and practice deliberately.",

    // Balance Training Protocols
    "Morning sunlight exposure (10-30 min for cortisol regulation)": "Get outside within 30-60 minutes of waking. No sunglasses needed. Helps set healthy cortisol rhythm and circadian timing for better sleep and stress management.",
    "Stress-reducing breathwork training (4-7-8, box breathing)": "Practice daily: 4-7-8 breathing for sleep, box breathing for acute stress. Use before stressful situations or as daily maintenance for nervous system regulation.",
    "Meditation & mindfulness practice (10-20 min daily)": "Start with 5 minutes, build to 20. Use guided apps initially. Focus on breath, body sensations, or loving-kindness. Creates space between stimulus and response.",
    "Hormonal cycle tracking & optimization": "Track menstrual cycle, mood, energy, and symptoms. Adjust training and nutrition based on cycle phases. Use apps like Clue or Flo for detailed tracking.",
    "Sleep hygiene protocol implementation": "Consistent sleep schedule, cool dark room, no caffeine after 2pm, no screens 1 hour before bed, relaxing bedtime routine. Sleep affects all hormones significantly.",
    "Yoga & gentle movement practices": "Include restorative poses, gentle flows, and breathing practices. Focus on parasympathetic nervous system activation. Yin yoga and restorative styles are particularly balancing.",
    "Journaling for emotional regulation": "Write for 10-15 minutes daily. Include gratitude, emotions, and reflections. Helps process stress, identify patterns, and develop emotional awareness and intelligence.",
    "Gratitude practice (3 things daily)": "Write down 3 specific things you're grateful for each day. Be detailed and varied. Practice shifts focus from problems to positives, improving mood and perspective.",
    "Social connection & community building": "Prioritize quality relationships. Join groups, volunteer, maintain regular contact with loved ones. Social support is crucial for stress resilience and longevity.",
    "Forest bathing & nature therapy sessions": "Spend mindful time in nature without devices. Engage all senses, breathe deeply, and move slowly. Even 20 minutes provides measurable stress reduction benefits.",
    "Digital detox training periods": "Scheduled breaks from devices and social media. Start with 1-hour daily, work up to half or full days. Create phone-free zones and times, especially before bed.",
    "Mindful eating practices": "Eat without distractions, chew slowly, pay attention to hunger/fullness cues. Practice gratitude for food. Improves digestion and relationship with food.",
    "Stress response training techniques": "Learn to recognize early stress signals. Practice response techniques like deep breathing, progressive muscle relaxation, or brief mindfulness exercises.",
    "Emotional regulation skill building": "Develop awareness of emotional triggers and patterns. Practice techniques like cognitive reframing, self-compassion, and healthy expression of emotions.",

    // Beauty Training Protocols
    "Daily skincare routine with active ingredients": "Morning: gentle cleanser, vitamin C serum, moisturizer, SPF 30+. Evening: cleanser, retinol (2-3x/week), moisturizer. Start retinol slowly to build tolerance.",
    "Facial massage & lymphatic drainage (5 min daily)": "Use upward and outward strokes with clean hands or gua sha tool. Start at center of face, work toward hairline and down to neck. Promotes circulation and reduces puffiness.",
    "Collagen-boosting nutrition protocols": "Include vitamin C-rich foods, bone broth, marine collagen, and antioxidant-rich berries. Limit sugar and processed foods which damage collagen through glycation.",
    "UV protection with broad-spectrum SPF 30+": "Apply 1/4 teaspoon to face daily, reapply every 2 hours if outdoors. Use SPF 30+ with both UVA and UVB protection. This is the most important anti-aging step.",
    "Hydration optimization (half body weight in oz)": "Drink water equal to half your body weight in ounces daily. Add electrolytes if sweating heavily. Proper hydration supports skin elasticity and overall appearance.",
    "Sleep on silk pillowcases for skin/hair health": "Silk creates less friction than cotton, reducing hair breakage and skin irritation. Keep pillowcases clean and replace weekly. Also consider silk sleep masks.",
    "Facial exercises for muscle tone (gua sha)": "Use gua sha tool with facial oil for 5-10 minutes daily. Apply gentle pressure, work from center outward. Promotes circulation and may help with facial muscle tone.",
    "Antioxidant-rich diet implementation": "Include colorful fruits and vegetables, green tea, dark chocolate, nuts, and seeds. Antioxidants protect against free radical damage and support skin health from within.",
    "Sugar reduction for collagen protection": "Limit added sugars and refined carbohydrates which cause glycation, damaging collagen fibres. Focus on whole foods and stable blood sugar levels.",
    "Cold water face rinses for circulation": "End daily face washing with cool water rinse. Helps tighten pores temporarily and stimulates circulation. Can also use ice cubes wrapped in cloth for 1-2 minutes.",
    "Dry brushing for lymphatic circulation": "Use natural bristle brush on dry skin before showering. Brush toward heart in long strokes. Supports lymphatic drainage and may improve skin texture.",
    "Stress management for skin health": "Chronic stress increases cortisol, which breaks down collagen and can trigger skin issues. Practice stress-reduction techniques for better skin from the inside out.",
    "Regular exercise for blood flow": "Exercise increases circulation, delivering nutrients to skin cells and carrying away waste products. Aim for activities that make you sweat to help detoxify through skin.",
    "Beauty sleep optimization (7-9 hours)": "During sleep, skin repairs and regenerates. Growth hormone peaks during deep sleep, supporting collagen production. Maintain consistent sleep schedule for optimal skin health."
  };

  const therapyExplanations = {
    // Brain Therapies
    "Neurofeedback training sessions": "Non-invasive brain training using real-time monitoring of brain activity to improve focus, reduce anxiety, and optimize brain function. Sensors measure brainwaves while you perform tasks.",
    "Transcranial direct current stimulation (tDCS)": "Gentle electrical stimulation applied to specific brain areas to enhance cognitive performance and mood. Uses very low electrical current to stimulate neuronal activity.",
    "Cognitive behavioural therapy (CBT)": "Evidence-based therapy that helps identify and change negative thought patterns and behaviours. Particularly effective for anxiety, depression, and stress management.",
    "Hyperbaric oxygen therapy (HBOT)": "Breathing pure oxygen in a pressurized chamber to increase oxygen delivery to tissues and promote healing. May support brain function and recovery from injury.",
    "Red light therapy for mitochondrial function": "Low-level laser therapy using specific wavelengths (660-850nm) to stimulate cellular energy production and reduce inflammation in brain tissue.",
    "Flotation tank sessions for deep relaxation": "Floating in saltwater in a sensory-deprivation environment. Promotes deep relaxation, reduces stress hormones, and may enhance creativity and problem-solving.",
    "Binaural beats therapy (40Hz gamma waves)": "Audio therapy using slightly different frequencies in each ear to encourage specific brainwave states. 40Hz gamma frequencies may enhance focus and cognitive performance.",
    "Professional sleep optimization coaching": "Working with sleep specialists to identify and address sleep disorders, optimize sleep environment, and develop personalized sleep hygiene protocols.",
    "Brain mapping and assessment": "Comprehensive testing of cognitive function, including memory, attention, processing speed, and executive function to identify areas for improvement.",
    "IV therapy for cognitive enhancement": "Intravenous delivery of nutrients like B-vitamins, magnesium, and antioxidants to support brain function. Should only be done by qualified medical professionals.",

    // Body Therapies
    "Heat therapy: Sauna 4x/week (79-100°C, 20 min)": "Regular sauna use promotes heat shock proteins, improves cardiovascular health, and aids recovery. Start with shorter sessions and lower temperatures, build tolerance gradually.",
    "Cold plunge therapy (10-15°C, 2-11 minutes)": "Cold water immersion therapy to reduce inflammation, boost metabolism, and improve recovery. Always have supervision and exit if experiencing adverse reactions.",
    "Deep tissue massage (weekly/bi-weekly)": "Therapeutic massage targeting deeper muscle layers to release tension, improve circulation, and aid recovery. Work with licensed massage therapists for best results.",
    "Cryotherapy sessions for recovery": "Whole-body exposure to extremely cold temperatures (-129 to -157°C) for 2-4 minutes. Reduces inflammation and may speed recovery, but requires proper facility and supervision.",
    "Compression therapy for circulation": "Use of pneumatic compression devices to improve blood flow and lymphatic drainage. Particularly helpful for recovery and reducing swelling in legs.",
    "PEMF (Pulsed Electromagnetic Field) therapy": "Low-frequency electromagnetic fields applied to the body to reduce inflammation and promote cellular repair. Used for pain management and recovery enhancement.",
    "Infrared sauna for muscle recovery": "Uses infrared light to heat the body directly rather than heating air. May penetrate deeper than traditional saunas and provide similar benefits at lower temperatures.",
    "Physical therapy movement assessment": "Professional evaluation of movement patterns, strength, and flexibility to identify imbalances and develop corrective exercise programs.",
    "Myofascial release techniques": "Manual therapy techniques targeting the fascial system to improve mobility and reduce pain. Can be done with tools like foam rollers or by qualified practitioners.",
    "Recovery monitoring (HRV, sleep tracking)": "Using devices to track heart rate variability, sleep quality, and other recovery metrics to optimize training and lifestyle factors.",
    "IV hydration and nutrient therapy": "Intravenous delivery of fluids, electrolytes, and nutrients for rapid hydration and recovery. Should be administered by qualified medical professionals.",
    "Hormone optimization therapy": "Medical assessment and treatment of hormone imbalances that may affect performance, recovery, and body composition. Requires qualified healthcare provider.",

    // Balance Therapies
    "Hormone testing & optimization protocols": "Comprehensive testing of hormone levels (cortisol, thyroid, sex hormones) followed by lifestyle and/or medical interventions to optimize balance.",
    "Stress management counseling & CBT": "Professional counseling to develop coping strategies, identify stress triggers, and learn evidence-based techniques for managing stress and anxiety.",
    "Acupuncture for nervous system balance": "Traditional Chinese medicine practice using thin needles at specific points to promote balance in the nervous system and reduce stress.",
    "Professional massage therapy": "Therapeutic massage by licensed practitioners to reduce muscle tension, promote relaxation, and support the parasympathetic nervous system.",
    "HRV training for autonomic balance": "Heart rate variability training using breathing techniques and biofeedback to improve stress resilience and autonomic nervous system function.",
    "Light therapy for circadian rhythm support": "Exposure to specific wavelengths and intensities of light to regulate circadian rhythms, improve sleep, and support mood.",
    "Guided meditation & mindfulness training": "Professional instruction in meditation and mindfulness techniques to develop sustainable stress management skills and emotional regulation.",
    "Biofeedback therapy sessions": "Real-time monitoring of physiological functions (heart rate, breathing, muscle tension) to learn conscious control over these typically automatic processes.",
    "Adaptogenic herb protocol guidance": "Professional guidance on using adaptogenic herbs like ashwagandha, rhodiola, and holy basil to support stress adaptation and hormone balance.",
    "Sleep therapy and optimization": "Medical assessment and treatment of sleep disorders, plus optimization of sleep environment and habits for better rest and recovery.",
    "Nutritional therapy for mood balance": "Working with qualified nutritionists to identify and address nutritional factors affecting mood, energy, and stress resilience.",
    "Energy healing and reiki sessions": "Alternative healing practices aimed at balancing energy flow in the body. While not scientifically proven, many find these practices relaxing and stress-reducing.",

    // Beauty Therapies
    "Professional LED red light therapy (660-850nm)": "Clinical-grade LED devices delivering specific wavelengths to stimulate collagen production, reduce inflammation, and improve skin texture and tone.",
    "Microneedling for collagen induction": "Minimally invasive treatment using tiny needles to create controlled micro-injuries that stimulate natural collagen and elastin production.",
    "Chemical peels (glycolic, lactic acid)": "Professional application of chemical solutions to remove damaged outer layers of skin, revealing smoother, more even-toned skin underneath.",
    "Professional dermatological treatments": "Medical-grade skincare treatments administered by dermatologists or licensed aestheticians, including prescription retinoids and advanced procedures.",
    "Lymphatic drainage massage therapy": "Specialized massage technique to stimulate lymphatic flow, reduce puffiness, and promote detoxification. Particularly beneficial for facial treatments.",
    "Aesthetic consultation & treatment planning": "Professional assessment of skin condition and aesthetic goals to develop personalized treatment plans using evidence-based approaches.",
    "Nutrition counseling for skin health": "Working with qualified nutritionists to optimize diet for skin health, addressing factors like inflammation, antioxidant status, and nutrient deficiencies.",
    "Hormone optimization for anti-aging": "Medical assessment and treatment of hormonal factors affecting aging, including declining estrogen, growth hormone, and other age-related changes.",
    "IV therapy for beauty enhancement": "Intravenous delivery of vitamins, antioxidants, and other nutrients to support skin health from within. Should be done by qualified medical professionals.",
    "Professional skincare treatments": "Clinical treatments including facials, extractions, and professional-grade product applications by licensed aestheticians or dermatologists.",
    "Laser therapy for skin rejuvenation": "Various laser treatments to address specific skin concerns like pigmentation, texture, and signs of aging. Requires qualified practitioners and proper protocols.",
    "Platelet-rich plasma (PRP) treatments": "Use of patient's own platelet-rich plasma to stimulate collagen production and tissue regeneration. Also known as 'vampire facials' when used for facial rejuvenation."
  };

  // Supplement details and product data
  const supplementDetails = {
    // Brain Supplements
    "Omega-3 fatty acids (EPA/DHA 1-3g daily)": {
      description: "Essential fatty acids that support brain health, reduce inflammation, and improve cognitive function. EPA and DHA are crucial for neurotransmitter production.",
      benefits: "Improves memory, reduces brain fog, supports mood stability",
      dosage: "1-3g daily with meals",
      price: 29.99,
      id: "omega-3-brain"
    },
    "Magnesium glycinate (200-400mg before bed)": {
      description: "Highly bioavailable form of magnesium that supports nervous system function, sleep quality, and stress reduction.",
      benefits: "Better sleep, reduced anxiety, improved focus",
      dosage: "200-400mg before bedtime",
      price: 24.99,
      id: "magnesium-glycinate"
    },
    "B-complex vitamins for neurotransmitter support": {
      description: "Essential B vitamins that support energy production, neurotransmitter synthesis, and overall brain function.",
      benefits: "Increased energy, better mood, enhanced cognitive function",
      dosage: "1 capsule daily with breakfast",
      price: 19.99,
      id: "b-complex-brain"
    },
    "Lion's Mane mushroom (500-1000mg)": {
      description: "Medicinal mushroom that supports nerve growth factor and cognitive function. Contains compounds that may promote neuroplasticity.",
      benefits: "Enhanced memory, improved focus, neuroprotection",
      dosage: "500-1000mg daily",
      price: 34.99,
      id: "lions-mane"
    },
    "Rhodiola rosea for stress adaptation": {
      description: "Adaptogenic herb that helps the body manage stress while supporting cognitive performance and energy levels.",
      benefits: "Reduced fatigue, better stress resilience, improved mental clarity",
      dosage: "200-400mg in the morning",
      price: 27.99,
      id: "rhodiola-brain"
    },
    "Phosphatidylserine for memory": {
      description: "Phospholipid that supports brain cell membrane integrity and is crucial for memory formation and recall.",
      benefits: "Enhanced memory, improved learning, better cognitive aging",
      dosage: "100mg daily",
      price: 32.99,
      id: "phosphatidylserine"
    },
    "Alpha-GPC for acetylcholine support": {
      description: "Choline compound that crosses the blood-brain barrier to support acetylcholine production, crucial for memory and learning.",
      benefits: "Improved memory, enhanced focus, better learning capacity",
      dosage: "300-600mg daily",
      price: 39.99,
      id: "alpha-gpc"
    },
    "Creatine monohydrate (3-5g daily)": {
      description: "Well-researched compound that supports brain energy metabolism and may enhance cognitive performance, especially under stress.",
      benefits: "Increased mental energy, better cognitive performance, neuroprotection",
      dosage: "3-5g daily",
      price: 22.99,
      id: "creatine-brain"
    },

    // Body Supplements
    "Whey or plant protein (20-40g post-workout)": {
      description: "High-quality protein for muscle recovery and growth. Choose whey for fast absorption or plant-based for dietary preferences.",
      benefits: "Muscle recovery, lean mass maintenance, satiety",
      dosage: "20-40g within 2 hours post-workout",
      price: 49.99,
      id: "protein-powder"
    },
    "Collagen peptides (10-20g for joints)": {
      description: "Bioactive collagen peptides that support joint health, skin elasticity, and connective tissue repair.",
      benefits: "Joint support, skin health, improved recovery",
      dosage: "10-20g daily, preferably on empty stomach",
      price: 35.99,
      id: "collagen-peptides"
    },
    "Vitamin D3 + K2 (2000-4000 IU D3)": {
      description: "Essential vitamin D3 combined with K2 for optimal calcium metabolism and bone health support.",
      benefits: "Bone health, immune function, hormone support",
      dosage: "2000-4000 IU D3 with 100mcg K2 daily",
      price: 26.99,
      id: "vitamin-d3-k2"
    },
    "Electrolyte replacement (sodium, potassium)": {
      description: "Balanced electrolyte formula to support hydration, muscle function, and recovery during training.",
      benefits: "Better hydration, reduced cramping, improved performance",
      dosage: "During and after workouts as needed",
      price: 18.99,
      id: "electrolytes"
    },
    "CoQ10 for mitochondrial support (100-200mg)": {
      description: "Coenzyme Q10 supports cellular energy production and acts as a powerful antioxidant for heart and muscle health.",
      benefits: "Increased energy, antioxidant protection, heart health",
      dosage: "100-200mg with meals",
      price: 41.99,
      id: "coq10"
    },

    // Balance Supplements
    "Ashwagandha (300-600mg for cortisol regulation)": {
      description: "Adaptogenic herb that helps regulate cortisol levels and supports the body's response to stress.",
      benefits: "Reduced stress, better sleep, improved mood",
      dosage: "300-600mg daily, preferably with meals",
      price: 28.99,
      id: "ashwagandha"
    },
    "GABA (500-750mg for nervous system support)": {
      description: "Gamma-aminobutyric acid, the brain's primary inhibitory neurotransmitter, supports relaxation and calm.",
      benefits: "Reduced anxiety, better relaxation, improved sleep onset",
      dosage: "500-750mg before bed",
      price: 21.99,
      id: "gaba"
    },
    "L-theanine (200mg for calm focus)": {
      description: "Amino acid found in green tea that promotes relaxation without drowsiness and enhances focus.",
      benefits: "Calm alertness, reduced anxiety, improved focus",
      dosage: "200mg daily, can be taken with or without caffeine",
      price: 23.99,
      id: "l-theanine"
    },

    // Beauty Supplements
    "Hyaluronic acid (100-200mg for hydration)": {
      description: "Molecule that can hold up to 1000 times its weight in water, supporting skin hydration from within.",
      benefits: "Improved skin hydration, reduced fine lines, plumper skin",
      dosage: "100-200mg daily",
      price: 31.99,
      id: "hyaluronic-acid"
    },
    "Vitamin C (1000mg for collagen synthesis)": {
      description: "Essential vitamin for collagen production, antioxidant protection, and immune system support.",
      benefits: "Collagen support, antioxidant protection, immune health",
      dosage: "1000mg daily with meals",
      price: 16.99,
      id: "vitamin-c"
    },
    "Biotin & zinc for hair/nail health": {
      description: "Essential nutrients for keratin production, supporting healthy hair growth and strong nails.",
      benefits: "Stronger hair and nails, improved growth, better texture",
      dosage: "1 capsule daily",
      price: 19.99,
      id: "biotin-zinc"
    },
    "Astaxanthin (4-8mg for UV protection)": {
      description: "Powerful antioxidant carotenoid that provides natural UV protection and supports skin health.",
      benefits: "UV protection, reduced skin aging, antioxidant support",
      dosage: "4-8mg daily with fats for absorption",
      price: 33.99,
      id: "astaxanthin"
    },
    "Marine omega-3s for skin inflammation": {
      description: "Marine-sourced omega-3 fatty acids that support skin health by reducing inflammation and promoting barrier function.",
      benefits: "Reduced skin inflammation, improved barrier function, healthy glow",
      dosage: "1-2g daily with meals",
      price: 36.99,
      id: "marine-omega-3"
    },
    "NAD+ precursors for cellular repair": {
      description: "Precursors that support NAD+ production, crucial for cellular energy and DNA repair processes.",
      benefits: "Enhanced cellular repair, anti-aging support, increased energy",
      dosage: "250-500mg daily",
      price: 59.99,
      id: "nad-precursors"
    },
    "Resveratrol for antioxidant protection": {
      description: "Powerful polyphenol antioxidant found in red wine and grapes, supports cardiovascular and cellular health.",
      benefits: "Antioxidant protection, anti-aging support, cardiovascular health",
      dosage: "250-500mg daily",
      price: 37.99,
      id: "resveratrol"
    }
  };

  const handleAddToCart = (supplement: string) => {
    const details = supplementDetails[supplement as keyof typeof supplementDetails];
    if (details) {
      const product = {
        id: details.id,
        name: supplement.split(' (')[0], // Remove dosage from name
        price: details.price,
        image: '/placeholder-supplement.jpg',
        brand: 'BiohackHer',
        dosage: details.dosage,
        description: details.description
      };
      
      addToCart(product);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    }
  };

  const specializedSections = [
    {
      title: "Coaching",
      subtitle: "Personalized guidance for your biohacking journey",
      icon: UserRound,
      color: "from-orange-500 to-amber-600",
      route: "/coaching",
      description: "Get personalised coaching tailored to your unique biohacking goals and health data."
    },
    {
      title: "Supplements",
      subtitle: "Evidence-based supplement protocols",
      icon: Pill,
      color: "from-teal-500 to-green-600",
      route: "/supplements",
      description: "Discover scientifically-backed supplements organized by the four pillars of wellness."
    },
    {
      title: "Therapy",
      subtitle: "Advanced biohacking therapies and protocols",
      icon: Heart,
      color: "from-red-500 to-pink-600",
      route: "/therapies",
      description: "Explore cutting-edge therapies like red light, cold exposure, and HRV protocols."
    }
  ];

  const handlePillarClick = (pillarKey: string) => {
    setSelectedPillar(selectedPillar === pillarKey ? null : pillarKey);
  };

  const handleAssessmentStart = (pillarKey: string, assessmentTitle: string) => {
    // Navigate to a specialized assessment based on pillar and type
    navigate(`/assessment/${pillarKey}-${assessmentTitle.toLowerCase().replace(/\s+/g, '-')}`);
  };

  const getMandatoryAssessments = (pillarKey: string) => {
    return pillars[pillarKey as keyof typeof pillars].symptomAssessments.map(assessment => ({
      ...assessment,
      pillar: pillarKey,
      completed: completions[pillarKey as keyof typeof completions]?.completed || false
    }));
  };

  const handle7DayPlan = (pillarKey: string) => {
    const mandatoryAssessments = getMandatoryAssessments(pillarKey);
    const incompleteAssessments = mandatoryAssessments.filter(assessment => !assessment.completed);
    
    if (incompleteAssessments.length > 0) {
      toast({
        title: "Complete Required Assessments",
        description: `You need to complete ${incompleteAssessments.length} assessment(s) before accessing your personalized 7-day plan.`,
        variant: "destructive",
      });
      return;
    }
    
    // Navigate to 7-day plan page with pillar context
    navigate(`/7-day-plan/${pillarKey}`);
  };

  return (
    <TooltipProvider>
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-4">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              {t('pillars.title')}
            </h1>
            <p className="text-lg text-primary font-medium max-w-3xl mx-auto">
              Understanding your health through four essential pillars gives you a complete picture of your wellbeing. Each pillar addresses a key area that impacts how you look, feel, and function every day. Take targeted assessments to uncover personalized insights and create your roadmap to optimal health.
            </p>
          </div>
        </div>
      </section>

      {/* Four Pillars Grid */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {Object.entries(pillars).map(([key, pillar]) => (
              <Card 
                key={key}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                  selectedPillar === key ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handlePillarClick(key)}
              >
                <CardHeader className="text-center">
                  <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
                    <img 
                      src={pillar.image} 
                      alt={`${pillar.title} pillar`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <pillar.icon className="h-6 w-6" />
                    {pillar.title}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {pillar.subtitle}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* Detailed Pillar View */}
          {selectedPillar && (
            <div className="mb-16">
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-3xl flex items-center gap-3">
                    {React.createElement(pillars[selectedPillar as keyof typeof pillars].icon, { className: "h-8 w-8" })}
                    {pillars[selectedPillar as keyof typeof pillars].title} Overview
                  </CardTitle>
                  <CardDescription className="text-lg">
                    {pillars[selectedPillar as keyof typeof pillars].content.overview}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Key Focus Areas */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Key Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {pillars[selectedPillar as keyof typeof pillars].content.keyAreas.map((area, index) => (
                        <Badge key={index} variant="secondary">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                   {/* Symptom Assessments & 7-Day Plan */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Required Assessments for Personalized Plan
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {pillars[selectedPillar as keyof typeof pillars].symptomAssessments.map((assessment, index) => {
                           const isCompleted = completions[selectedPillar as keyof typeof completions]?.completed;
                           return (
                            <Card key={index} className="hover:shadow-md transition-shadow">
                              <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                  {isCompleted ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                  ) : (
                                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                                  )}
                                  {assessment.title}
                                </CardTitle>
                                <CardDescription>{assessment.description}</CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex justify-between items-center mb-4">
                                  <Badge variant="outline">{assessment.duration}</Badge>
                                  <Badge variant="outline">{assessment.questions} questions</Badge>
                                  {isCompleted && (
                                    <Badge variant="default" className="bg-green-100 text-green-800">
                                      Completed
                                    </Badge>
                                  )}
                                </div>
                                <Button 
                                  onClick={() => handleAssessmentStart(selectedPillar, assessment.title)}
                                  className="w-full"
                                  variant={isCompleted ? "outline" : "default"}
                                >
                                  {isCompleted ? "Retake Assessment" : "Start Assessment"}
                                </Button>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    {/* 7-Day Plan Section */}
                    <div>
                      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-2xl flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Get Your Personalized 7-Day {pillars[selectedPillar as keyof typeof pillars].title} Plan
                          </CardTitle>
                          <CardDescription>
                            Based on your LIS (Longevity Impact Score) and assessment results, get a tailored 7-day protocol designed specifically for your {pillars[selectedPillar as keyof typeof pillars].title.toLowerCase()} optimization goals.
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              Daily personalised recommendations
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              Progress tracking and adjustments
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-4 w-4" />
                              Evidence-based protocols
                            </div>
                            <Button 
                              onClick={() => handle7DayPlan(selectedPillar)}
                              className="w-full"
                              size="lg"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Get My 7-Day Plan
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Expandable Sections */}
                  <div className="space-y-4">
                    {/* Training Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            {pillars[selectedPillar as keyof typeof pillars].title} Training Protocols
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                              Evidence-based training protocols you can implement yourself
                            </p>
                            
                            {/* Beginner Level */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                Beginner (Start Here)
                              </h4>
                              <ul className="space-y-2 ml-5">
                                {(pillars[selectedPillar as keyof typeof pillars].biohacks.training as any).beginner.map((training: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    {protocolDetails[training as keyof typeof protocolDetails] ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button className="text-left hover:text-primary underline decoration-dotted">
                                            {training}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md">
                                          <p>{protocolDetails[training as keyof typeof protocolDetails]}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span>{training}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Intermediate Level */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                Intermediate (6+ Weeks Experience)
                              </h4>
                              <ul className="space-y-2 ml-5">
                                {(pillars[selectedPillar as keyof typeof pillars].biohacks.training as any).intermediate.map((training: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    {protocolDetails[training as keyof typeof protocolDetails] ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button className="text-left hover:text-primary underline decoration-dotted">
                                            {training}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md">
                                          <p>{protocolDetails[training as keyof typeof protocolDetails]}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span>{training}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Advanced Level */}
                            <div className="mb-4">
                              <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                Advanced (3+ Months Experience)
                              </h4>
                              <ul className="space-y-2 ml-5">
                                {(pillars[selectedPillar as keyof typeof pillars].biohacks.training as any).advanced.map((training: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {protocolDetails[training as keyof typeof protocolDetails] ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button className="text-left hover:text-primary underline decoration-dotted">
                                            {training}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md">
                                          <p>{protocolDetails[training as keyof typeof protocolDetails]}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span>{training}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Therapy Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <TestTube className="h-4 w-4" />
                            {pillars[selectedPillar as keyof typeof pillars].title} Therapies
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                              Professional therapies and advanced treatments
                            </p>
                            
                            {/* Beginner Level */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                Beginner (Accessible & Affordable)
                              </h4>
                              <ul className="space-y-2 ml-5">
                                {(pillars[selectedPillar as keyof typeof pillars].biohacks.therapy as any).beginner.map((therapy: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    {therapyExplanations[therapy as keyof typeof therapyExplanations] ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button className="text-left hover:text-primary underline decoration-dotted">
                                            {therapy}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md">
                                          <p>{therapyExplanations[therapy as keyof typeof therapyExplanations]}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span>{therapy}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Intermediate Level */}
                            <div className="mb-6">
                              <h4 className="font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                Intermediate (Moderate Investment)
                              </h4>
                              <ul className="space-y-2 ml-5">
                                {(pillars[selectedPillar as keyof typeof pillars].biohacks.therapy as any).intermediate.map((therapy: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    {therapyExplanations[therapy as keyof typeof therapyExplanations] ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button className="text-left hover:text-primary underline decoration-dotted">
                                            {therapy}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md">
                                          <p>{therapyExplanations[therapy as keyof typeof therapyExplanations]}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span>{therapy}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Advanced Level */}
                            <div className="mb-4">
                              <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                Advanced (High Investment)
                              </h4>
                              <ul className="space-y-2 ml-5">
                                {(pillars[selectedPillar as keyof typeof pillars].biohacks.therapy as any).advanced.map((therapy: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    {therapyExplanations[therapy as keyof typeof therapyExplanations] ? (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <button className="text-left hover:text-primary underline decoration-dotted">
                                            {therapy}
                                          </button>
                                        </TooltipTrigger>
                                        <TooltipContent className="max-w-md">
                                          <p>{therapyExplanations[therapy as keyof typeof therapyExplanations]}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    ) : (
                                      <span>{therapy}</span>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>

                    {/* Supplements Section */}
                    <Collapsible>
                      <CollapsibleTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          <span className="flex items-center gap-2">
                            <Pill className="h-4 w-4" />
                            {pillars[selectedPillar as keyof typeof pillars].title} Supplements
                          </span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-4">
                              Evidence-based supplements with recommended dosages
                            </p>
                            <div className="space-y-3">
                              {pillars[selectedPillar as keyof typeof pillars].supplements.map((supplement, index) => {
                                const details = supplementDetails[supplement as keyof typeof supplementDetails];
                                return (
                                  <div key={index} className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:shadow-sm transition-shadow">
                                    <div className="flex items-center gap-2 flex-1">
                                      <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                                      {details ? (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <button className="text-left hover:text-primary underline decoration-dotted text-sm">
                                              {supplement}
                                            </button>
                                          </TooltipTrigger>
                                          <TooltipContent className="max-w-xs">
                                            <div className="space-y-2">
                                              <p className="font-medium">{details.description}</p>
                                              <p className="text-sm"><strong>Benefits:</strong> {details.benefits}</p>
                                              <p className="text-sm"><strong>Dosage:</strong> {details.dosage}</p>
                                              <p className="text-sm font-medium text-primary">${details.price}</p>
                                            </div>
                                          </TooltipContent>
                                        </Tooltip>
                                      ) : (
                                        <span className="text-sm">{supplement}</span>
                                      )}
                                    </div>
                                    {details && (
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className="text-sm font-medium text-primary">${details.price}</span>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => handleAddToCart(supplement)}
                                          className="h-8 px-3"
                                        >
                                          <ShoppingCart className="h-3 w-3 mr-1" />
                                          Add
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </section>
    </div>
    </TooltipProvider>
  );
};

export default Pillars;