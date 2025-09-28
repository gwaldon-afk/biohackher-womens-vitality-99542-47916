import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Heart, Zap, Sparkles, UserRound, Pill, Activity, ChevronDown, Target, Lightbulb, TestTube, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import beautyPillar from "@/assets/beauty-pillar.png";
import brainPillar from "@/assets/brain-pillar.png";
import bodyPillar from "@/assets/body-pillar.png";
import balancePillar from "@/assets/balance-pillar.png";

const Pillars = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedPillar, setSelectedPillar] = useState<string | null>(null);

  // Mock user assessment data - in real app this would come from user profile
  const userAssessments = {
    brain: { completed: false, lastTaken: null },
    body: { completed: true, lastTaken: "2024-01-15" },
    balance: { completed: false, lastTaken: null },
    beauty: { completed: true, lastTaken: "2024-01-10" }
  };

  const pillars = {
    brain: {
      title: "Brain",
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
        training: [
          "Learning new languages (increases neuroplasticity by 30%)",
          "Playing musical instruments (enhances working memory)",
          "Dual N-back cognitive training games (2-3x/week)",
          "Speed reading practice (doubles reading efficiency)",
          "Memory palace technique for information retention",
          "Social engagement & meaningful relationships",
          "Reading fiction (improves empathy and cognitive flexibility)",
          "Meditation & mindfulness practices (8-12 minutes daily)",
          "Breathwork training (4-7-8 breathing, box breathing)",
          "Cold exposure training (2-11 minutes, 50-59°F)",
          "Morning sunlight exposure protocol (10-30 minutes)",
          "Quality sleep optimization (7-9 hours, consistent schedule)",
          "Regular aerobic exercise (Zone 2 cardio for BDNF)",
          "Intermittent fasting (14-16 hour windows)"
        ],
        therapy: [
          "Neurofeedback training sessions",
          "Transcranial direct current stimulation (tDCS)",
          "Cognitive behavioral therapy (CBT)",
          "Hyperbaric oxygen therapy (HBOT)",
          "Red light therapy for mitochondrial function",
          "Flotation tank sessions for deep relaxation",
          "Binaural beats therapy (40Hz gamma waves)",
          "Professional sleep optimization coaching",
          "Brain mapping and assessment",
          "IV therapy for cognitive enhancement"
        ]
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
        overview: "Optimize your cognitive function with evidence-based brain health protocols. From nootropics to neurofeedback, discover personalized strategies to enhance memory, focus, and mental clarity.",
        keyAreas: ["Cognitive Enhancement", "Memory Optimization", "Focus & Concentration", "Neuroprotection", "Mental Clarity"]
      }
    },
    body: {
      title: "Body",
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
        training: [
          "Zone 2 cardio training (180-age in BPM, 45-60 min)",
          "Strength training 3-4x/week (compound movements)",
          "High-intensity interval training (HIIT 2x/week)",
          "Mobility work & dynamic stretching (daily 15 min)",
          "Functional movement patterns training",
          "Progressive overload resistance training",
          "Plyometric exercises for power development",
          "Balance and proprioception training",
          "Walking 8,000-10,000 steps daily",
          "Morning movement routine (5-10 minutes)",
          "Active recovery protocols (yoga, swimming)",
          "Breathwork training for performance",
          "Movement quality assessment and correction",
          "Sport-specific skill development"
        ],
        therapy: [
          "Heat therapy: Sauna 4x/week (174-212°F, 20 min)",
          "Cold plunge therapy (50-59°F, 2-11 minutes)",
          "Deep tissue massage (weekly/bi-weekly)",
          "Cryotherapy sessions for recovery",
          "Compression therapy for circulation",
          "PEMF (Pulsed Electromagnetic Field) therapy",
          "Infrared sauna for muscle recovery",
          "Physical therapy movement assessment",
          "Myofascial release techniques",
          "Recovery monitoring (HRV, sleep tracking)",
          "IV hydration and nutrient therapy",
          "Hormone optimization therapy"
        ]
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
      title: "Balance",
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
        training: [
          "Morning sunlight exposure (10-30 min for cortisol regulation)",
          "Stress-reducing breathwork training (4-7-8, box breathing)",
          "Meditation & mindfulness practice (10-20 min daily)",
          "Hormonal cycle tracking & optimization",
          "Sleep hygiene protocol implementation",
          "Yoga & gentle movement practices",
          "Journaling for emotional regulation",
          "Gratitude practice (3 things daily)",
          "Social connection & community building",
          "Forest bathing & nature therapy sessions",
          "Digital detox training periods",
          "Mindful eating practices",
          "Stress response training techniques",
          "Emotional regulation skill building"
        ],
        therapy: [
          "Hormone testing & optimization protocols",
          "Stress management counseling & CBT",
          "Acupuncture for nervous system balance",
          "Professional massage therapy",
          "HRV training for autonomic balance",
          "Light therapy for circadian rhythm support",
          "Guided meditation & mindfulness training",
          "Biofeedback therapy sessions",
          "Adaptogenic herb protocol guidance",
          "Sleep therapy and optimization",
          "Nutritional therapy for mood balance",
          "Energy healing and reiki sessions"
        ]
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
      title: "Beauty",
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
        training: [
          "Daily skincare routine with active ingredients",
          "Facial massage & lymphatic drainage (5 min daily)",
          "Collagen-boosting nutrition protocols",
          "UV protection with broad-spectrum SPF 30+",
          "Hydration optimization (half body weight in oz)",
          "Sleep on silk pillowcases for skin/hair health",
          "Facial exercises for muscle tone (gua sha)",
          "Antioxidant-rich diet implementation",
          "Sugar reduction for collagen protection",
          "Cold water face rinses for circulation",
          "Dry brushing for lymphatic circulation",
          "Stress management for skin health",
          "Regular exercise for blood flow",
          "Beauty sleep optimization (7-9 hours)"
        ],
        therapy: [
          "Professional LED red light therapy (660-850nm)",
          "Microneedling for collagen induction",
          "Chemical peels (glycolic, lactic acid)",
          "Professional dermatological treatments",
          "Lymphatic drainage massage therapy",
          "Aesthetic consultation & treatment planning",
          "Nutrition counseling for skin health",
          "Hormone optimization for anti-aging",
          "IV therapy for beauty enhancement",
          "Professional skincare treatments",
          "Laser therapy for skin rejuvenation",
          "Platelet-rich plasma (PRP) treatments"
        ]
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
    "Cold exposure training (2-11 minutes, 50-59°F)": "Start with 30-second cold showers, gradually increase duration. Work up to 2-11 minutes in 50-59°F water. End hot showers with cold, or use ice baths for advanced practitioners.",
    "Morning sunlight exposure protocol (10-30 minutes)": "Get outside within 30-60 minutes of waking. Face east if possible, no sunglasses needed. 10 minutes on bright days, 30 minutes on overcast days to regulate circadian rhythm.",
    "Quality sleep optimization (7-9 hours, consistent schedule)": "Maintain consistent sleep/wake times, keep bedroom cool (65-68°F), dark, and quiet. No screens 1 hour before bed, use blackout curtains or eye masks.",
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
    "Sugar reduction for collagen protection": "Limit added sugars and refined carbohydrates which cause glycation, damaging collagen fibers. Focus on whole foods and stable blood sugar levels.",
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
    "Cognitive behavioral therapy (CBT)": "Evidence-based therapy that helps identify and change negative thought patterns and behaviors. Particularly effective for anxiety, depression, and stress management.",
    "Hyperbaric oxygen therapy (HBOT)": "Breathing pure oxygen in a pressurized chamber to increase oxygen delivery to tissues and promote healing. May support brain function and recovery from injury.",
    "Red light therapy for mitochondrial function": "Low-level laser therapy using specific wavelengths (660-850nm) to stimulate cellular energy production and reduce inflammation in brain tissue.",
    "Flotation tank sessions for deep relaxation": "Floating in saltwater in a sensory-deprivation environment. Promotes deep relaxation, reduces stress hormones, and may enhance creativity and problem-solving.",
    "Binaural beats therapy (40Hz gamma waves)": "Audio therapy using slightly different frequencies in each ear to encourage specific brainwave states. 40Hz gamma frequencies may enhance focus and cognitive performance.",
    "Professional sleep optimization coaching": "Working with sleep specialists to identify and address sleep disorders, optimize sleep environment, and develop personalized sleep hygiene protocols.",
    "Brain mapping and assessment": "Comprehensive testing of cognitive function, including memory, attention, processing speed, and executive function to identify areas for improvement.",
    "IV therapy for cognitive enhancement": "Intravenous delivery of nutrients like B-vitamins, magnesium, and antioxidants to support brain function. Should only be done by qualified medical professionals.",

    // Body Therapies
    "Heat therapy: Sauna 4x/week (174-212°F, 20 min)": "Regular sauna use promotes heat shock proteins, improves cardiovascular health, and aids recovery. Start with shorter sessions and lower temperatures, build tolerance gradually.",
    "Cold plunge therapy (50-59°F, 2-11 minutes)": "Cold water immersion therapy to reduce inflammation, boost metabolism, and improve recovery. Always have supervision and exit if experiencing adverse reactions.",
    "Deep tissue massage (weekly/bi-weekly)": "Therapeutic massage targeting deeper muscle layers to release tension, improve circulation, and aid recovery. Work with licensed massage therapists for best results.",
    "Cryotherapy sessions for recovery": "Whole-body exposure to extremely cold temperatures (-200 to -250°F) for 2-4 minutes. Reduces inflammation and may speed recovery, but requires proper facility and supervision.",
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

  const specializedSections = [
    {
      title: "Coaching",
      subtitle: "Personalized guidance for your biohacking journey",
      icon: UserRound,
      color: "from-orange-500 to-amber-600",
      route: "/coaching",
      description: "Get personalized coaching tailored to your unique biohacking goals and health data."
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
      completed: userAssessments[pillarKey as keyof typeof userAssessments]?.completed || false
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
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold mb-6 gradient-text">
              The Four Pillars of Biohacking
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empowering women to beat ageing through biohacking. Discover personalized protocols across Brain, Body, Balance, and Beauty.
            </p>
          </div>
        </div>
      </section>

      {/* Four Pillars Grid */}
      <section className="py-16">
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
                          const isCompleted = userAssessments[selectedPillar as keyof typeof userAssessments]?.completed;
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
                              Daily personalized recommendations
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
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].biohacks.training.map((training, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  {protocolDetails[training as keyof typeof protocolDetails] ? (
                                    <Dialog>
                                      <DialogTrigger asChild>
                                        <button className="text-left hover:text-primary underline decoration-dotted">
                                          {training}
                                        </button>
                                      </DialogTrigger>
                                      <DialogContent>
                                        <DialogHeader>
                                          <DialogTitle>{training}</DialogTitle>
                                          <DialogDescription>
                                            {protocolDetails[training as keyof typeof protocolDetails]}
                                          </DialogDescription>
                                        </DialogHeader>
                                      </DialogContent>
                                    </Dialog>
                                  ) : (
                                    <span>{training}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
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
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].biohacks.therapy.map((therapy, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                  {therapyExplanations[therapy as keyof typeof therapyExplanations] ? (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button className="text-left hover:text-primary underline decoration-dotted">
                                          {therapy}
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-sm">
                                        <p>{therapyExplanations[therapy as keyof typeof therapyExplanations]}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  ) : (
                                    <span>{therapy}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
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
                            <ul className="space-y-2">
                              {pillars[selectedPillar as keyof typeof pillars].supplements.map((supplement, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  {supplement}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </CollapsibleContent>
                    </Collapsible>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Specialized Sections */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Specialized Biohacking Areas</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Dive deeper into specialized areas with expert guidance, evidence-based protocols, and advanced therapies.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {specializedSections.map((section, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(section.route)}>
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                      <section.icon className="h-8 w-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{section.title}</CardTitle>
                    <CardDescription>{section.subtitle}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {section.description}
                    </p>
                    <Button variant="outline" className="w-full">
                      Explore {section.title}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
    </TooltipProvider>
  );
};

export default Pillars;