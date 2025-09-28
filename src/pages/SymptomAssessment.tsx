import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

// Sample assessment questions - would normally come from a database
const assessmentQuestions = {
  "hot-flashes": [
    {
      id: 1,
      question: "How often do you experience hot flashes?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely (less than once a week)" },
        { value: "weekly", label: "Weekly (1-3 times per week)" },
        { value: "daily", label: "Daily (1-3 times per day)" },
        { value: "frequent", label: "Frequently (4+ times per day)" }
      ]
    },
    {
      id: 2,
      question: "How severe are your hot flashes typically?",
      type: "radio",
      options: [
        { value: "mild", label: "Mild - barely noticeable" },
        { value: "moderate", label: "Moderate - uncomfortable but manageable" },
        { value: "severe", label: "Severe - significantly disruptive" },
        { value: "extreme", label: "Extreme - debilitating" }
      ]
    },
    {
      id: 3,
      question: "When do your hot flashes typically occur?",
      type: "radio",
      options: [
        { value: "anytime", label: "Any time of day" },
        { value: "night", label: "Primarily at night" },
        { value: "day", label: "Primarily during the day" },
        { value: "triggers", label: "When triggered by specific situations" }
      ]
    },
    {
      id: 4,
      question: "What triggers seem to make your hot flashes worse?",
      type: "textarea",
      placeholder: "Describe any triggers you've noticed (stress, certain foods, activities, etc.)"
    }
  ],
  "sleep": [
    {
      id: 1,
      question: "How would you describe your overall sleep quality?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - consistently restorative sleep" },
        { value: "good", label: "Good - generally sleep well with minor issues" },
        { value: "fair", label: "Fair - frequent sleep disruptions" },
        { value: "poor", label: "Poor - chronic sleep problems" }
      ]
    },
    {
      id: 2,
      question: "How long does it typically take you to fall asleep?",
      type: "radio",
      options: [
        { value: "quick", label: "Less than 15 minutes" },
        { value: "normal", label: "15-30 minutes" },
        { value: "slow", label: "30-60 minutes" },
        { value: "very-slow", label: "More than 60 minutes" }
      ]
    },
    {
      id: 3,
      question: "How often do you wake up during the night?",
      type: "radio",
      options: [
        { value: "rarely", label: "Rarely - sleep through the night" },
        { value: "sometimes", label: "Sometimes - 1-2 times per night" },
        { value: "often", label: "Often - 3-4 times per night" },
        { value: "frequently", label: "Frequently - 5+ times per night" }
      ]
    },
    {
      id: 4,
      question: "How many hours of sleep do you typically get per night?",
      type: "radio",
      options: [
        { value: "less-than-5", label: "Less than 5 hours" },
        { value: "5-6", label: "5-6 hours" },
        { value: "6-7", label: "6-7 hours" },
        { value: "7-8", label: "7-8 hours" },
        { value: "8-plus", label: "8+ hours" }
      ]
    },
    {
      id: 5,
      question: "How do you feel when you wake up in the morning?",
      type: "radio",
      options: [
        { value: "refreshed", label: "Refreshed and energized" },
        { value: "okay", label: "Okay but need some time to wake up" },
        { value: "groggy", label: "Groggy and tired" },
        { value: "exhausted", label: "Exhausted despite sleeping" }
      ]
    },
    {
      id: 6,
      question: "What is your typical bedtime routine consistency?",
      type: "radio",
      options: [
        { value: "very-consistent", label: "Very consistent - same routine nightly" },
        { value: "mostly-consistent", label: "Mostly consistent with occasional variation" },
        { value: "somewhat-consistent", label: "Somewhat consistent but often varies" },
        { value: "inconsistent", label: "Inconsistent or no set routine" }
      ]
    },
    {
      id: 7,
      question: "How would you rate your sleep environment?",
      type: "radio",
      options: [
        { value: "optimal", label: "Optimal - dark, quiet, cool, comfortable" },
        { value: "good", label: "Good - minor environmental issues" },
        { value: "fair", label: "Fair - some disruptive factors" },
        { value: "poor", label: "Poor - multiple environmental challenges" }
      ]
    },
    {
      id: 8,
      question: "What factors most commonly disrupt your sleep?",
      type: "textarea",
      placeholder: "Describe any factors that affect your sleep (stress, noise, temperature, hormones, etc.)"
    }
  ],
  "joint-pain": [
    {
      id: 1,
      question: "Where do you primarily experience joint pain?",
      type: "radio",
      options: [
        { value: "hands", label: "Hands and fingers" },
        { value: "knees", label: "Knees" },
        { value: "hips", label: "Hips" },
        { value: "shoulders", label: "Shoulders" },
        { value: "multiple", label: "Multiple joints" },
        { value: "spine", label: "Spine/back" }
      ]
    },
    {
      id: 2,
      question: "How would you rate your pain on average (1-10 scale)?",
      type: "radio",
      options: [
        { value: "mild", label: "Mild (1-3/10)" },
        { value: "moderate", label: "Moderate (4-6/10)" },
        { value: "severe", label: "Severe (7-8/10)" },
        { value: "extreme", label: "Extreme (9-10/10)" }
      ]
    },
    {
      id: 3,
      question: "When is your joint pain typically worse?",
      type: "radio",
      options: [
        { value: "morning", label: "Morning stiffness upon waking" },
        { value: "evening", label: "Evening after daily activities" },
        { value: "weather", label: "During weather changes" },
        { value: "activity", label: "During or after physical activity" },
        { value: "constant", label: "Constant throughout the day" }
      ]
    },
    {
      id: 4,
      question: "How does joint pain affect your daily activities?",
      type: "radio",
      options: [
        { value: "minimal", label: "Minimal impact - can do everything normally" },
        { value: "some", label: "Some limitation with certain activities" },
        { value: "significant", label: "Significant limitation - avoid some activities" },
        { value: "severe", label: "Severe limitation - affects most activities" }
      ]
    },
    {
      id: 5,
      question: "How long have you been experiencing joint pain?",
      type: "radio",
      options: [
        { value: "recent", label: "Less than 3 months" },
        { value: "months", label: "3-12 months" },
        { value: "1-2years", label: "1-2 years" },
        { value: "chronic", label: "More than 2 years" }
      ]
    },
    {
      id: 6,
      question: "What helps reduce your joint pain?",
      type: "textarea",
      placeholder: "Describe treatments, activities, or lifestyle factors that help reduce your joint pain..."
    }
  ],
  
  // Gut Health Assessment
  "gut": [
    {
      id: 1,
      question: "How often do you experience digestive discomfort?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely (less than once a week)" },
        { value: "weekly", label: "Weekly (1-3 times per week)" },
        { value: "daily", label: "Daily" },
        { value: "frequent", label: "Multiple times daily" }
      ]
    },
    {
      id: 2,
      question: "What type of digestive symptoms do you experience most? (Select primary symptom)",
      type: "radio",
      options: [
        { value: "bloating", label: "Bloating and gas" },
        { value: "constipation", label: "Constipation" },
        { value: "diarrhea", label: "Diarrhea or loose stools" },
        { value: "pain", label: "Abdominal pain or cramping" },
        { value: "reflux", label: "Heartburn or acid reflux" }
      ]
    },
    {
      id: 3,
      question: "How would you rate your energy levels after meals?",
      type: "radio",
      options: [
        { value: "energised", label: "Energised and comfortable" },
        { value: "neutral", label: "No significant change" },
        { value: "tired", label: "Somewhat tired or sluggish" },
        { value: "exhausted", label: "Very tired or need to rest" }
      ]
    },
    {
      id: 4,
      question: "Have you noticed any food triggers that worsen your symptoms?",
      type: "textarea",
      placeholder: "Please describe any foods that seem to trigger your digestive symptoms..."
    },
    {
      id: 5,
      question: "Rate your overall digestive comfort on a scale of 1-10",
      type: "radio",
      options: [
        { value: "good", label: "Good (7-10/10)" },
        { value: "moderate", label: "Moderate (4-6/10)" },
        { value: "poor", label: "Poor (1-3/10)" }
      ]
    }
  ],
  
  // Brain Pillar Assessments
  "brain-brain-fog-assessment": [
    {
      id: 1,
      question: "How often do you experience mental fog or difficulty concentrating?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely (less than once a week)" },
        { value: "weekly", label: "Weekly (1-3 times per week)" },
        { value: "daily", label: "Daily" },
        { value: "frequent", label: "Multiple times daily" }
      ]
    },
    {
      id: 2,
      question: "How would you rate your memory performance?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - sharp and reliable" },
        { value: "good", label: "Good - occasional lapses" },
        { value: "fair", label: "Fair - frequent memory issues" },
        { value: "poor", label: "Poor - significant memory problems" }
      ]
    },
    {
      id: 3,
      question: "How is your ability to focus on complex tasks?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - can focus for hours" },
        { value: "good", label: "Good - can focus for 30-60 minutes" },
        { value: "fair", label: "Fair - can focus for 15-30 minutes" },
        { value: "poor", label: "Poor - difficulty focusing for more than 15 minutes" }
      ]
    },
    {
      id: 4,
      question: "How often do you experience mental fatigue?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely" },
        { value: "sometimes", label: "Sometimes - after demanding tasks" },
        { value: "often", label: "Often - daily mental fatigue" },
        { value: "constant", label: "Constantly - chronic mental exhaustion" }
      ]
    },
    {
      id: 5,
      question: "How is your word recall and finding the right words when speaking?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - words come easily" },
        { value: "good", label: "Good - occasional word searching" },
        { value: "fair", label: "Fair - frequent word-finding difficulties" },
        { value: "poor", label: "Poor - often struggle to find words" }
      ]
    },
    {
      id: 6,
      question: "How well do you process new information?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - quickly grasp new concepts" },
        { value: "good", label: "Good - understand with some effort" },
        { value: "fair", label: "Fair - need extra time to process" },
        { value: "poor", label: "Poor - significant difficulty processing information" }
      ]
    },
    {
      id: 7,
      question: "How is your attention to detail and accuracy?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - rarely make errors" },
        { value: "good", label: "Good - occasional minor mistakes" },
        { value: "fair", label: "Fair - frequent errors requiring double-checking" },
        { value: "poor", label: "Poor - many errors and oversights" }
      ]
    },
    {
      id: 8,
      question: "How well do you multitask or switch between activities?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - easily juggle multiple tasks" },
        { value: "good", label: "Good - can handle 2-3 tasks at once" },
        { value: "fair", label: "Fair - prefer focusing on one thing at a time" },
        { value: "poor", label: "Poor - get overwhelmed by multiple demands" }
      ]
    },
    {
      id: 9,
      question: "How is your working memory (holding information temporarily)?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - easily remember instructions and details" },
        { value: "good", label: "Good - remember most things with effort" },
        { value: "fair", label: "Fair - need to write things down frequently" },
        { value: "poor", label: "Poor - forget instructions quickly" }
      ]
    },
    {
      id: 10,
      question: "How often do you feel mentally 'cloudy' or unclear?",
      type: "radio",
      options: [
        { value: "never", label: "Never - always feel mentally clear" },
        { value: "rarely", label: "Rarely - only when very tired" },
        { value: "sometimes", label: "Sometimes - a few times per week" },
        { value: "frequently", label: "Frequently - most days" }
      ]
    },
    {
      id: 11,
      question: "How well do you organize and plan activities?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - very organized and systematic" },
        { value: "good", label: "Good - generally well-organized" },
        { value: "fair", label: "Fair - sometimes struggle with organization" },
        { value: "poor", label: "Poor - frequently disorganized and scattered" }
      ]
    },
    {
      id: 12,
      question: "How is your mental clarity first thing in the morning?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - wake up mentally sharp" },
        { value: "good", label: "Good - clear within 30 minutes" },
        { value: "fair", label: "Fair - takes 1-2 hours to feel clear" },
        { value: "poor", label: "Poor - feel foggy most of the morning" }
      ]
    }
  ],
  
  // Body Pillar Assessments
  "body-energy-&-fatigue-assessment": [
    {
      id: 1,
      question: "How would you rate your overall energy levels throughout the day?",
      type: "radio",
      options: [
        { value: "high", label: "High - feel energetic and vibrant most of the day" },
        { value: "moderate", label: "Moderate - have decent energy with some ups and downs" },
        { value: "low", label: "Low - often feel tired and lacking energy" },
        { value: "depleted", label: "Depleted - constantly exhausted and drained" }
      ]
    },
    {
      id: 2,
      question: "When do you typically experience energy crashes or dips?",
      type: "radio",
      options: [
        { value: "none", label: "No significant crashes - energy stays consistent" },
        { value: "afternoon", label: "Afternoon crash (2-4 PM)" },
        { value: "evening", label: "Early evening crash (5-7 PM)" },
        { value: "multiple", label: "Multiple crashes throughout the day" },
        { value: "morning", label: "Low energy in the morning" }
      ]
    },
    {
      id: 3,
      question: "How is your energy after physical exercise or activity?",
      type: "radio",
      options: [
        { value: "energized", label: "Energized and refreshed - exercise boosts my energy" },
        { value: "normal", label: "Normal recovery - feel good after appropriate rest" },
        { value: "tired", label: "More tired than expected for the activity level" },
        { value: "exhausted", label: "Completely exhausted - takes long time to recover" }
      ]
    },
    {
      id: 4,
      question: "How would you describe your morning energy when you wake up?",
      type: "radio",
      options: [
        { value: "refreshed", label: "Refreshed and ready to start the day" },
        { value: "okay", label: "Okay but need time to fully wake up" },
        { value: "groggy", label: "Groggy and tired despite adequate sleep" },
        { value: "exhausted", label: "Exhausted even after a full night's sleep" }
      ]
    },
    {
      id: 5,
      question: "How does your energy change throughout your menstrual cycle?",
      type: "radio",
      options: [
        { value: "no-change", label: "No noticeable change or not applicable" },
        { value: "some-variation", label: "Some variation - slightly lower during certain phases" },
        { value: "significant", label: "Significant changes - energy dips dramatically" },
        { value: "severe", label: "Severe changes - debilitating fatigue during cycle" }
      ]
    },
    {
      id: 6,
      question: "What time of day do you feel most energetic?",
      type: "radio",
      options: [
        { value: "morning", label: "Morning (6 AM - 12 PM)" },
        { value: "afternoon", label: "Afternoon (12 PM - 6 PM)" },
        { value: "evening", label: "Evening (6 PM - 10 PM)" },
        { value: "varies", label: "Varies day to day" },
        { value: "never", label: "Never feel truly energetic" }
      ]
    },
    {
      id: 7,
      question: "How long does it take you to recover from physical or mental exertion?",
      type: "radio",
      options: [
        { value: "quick", label: "Quick recovery - within hours" },
        { value: "normal", label: "Normal recovery - by the next day" },
        { value: "slow", label: "Slow recovery - takes 2-3 days" },
        { value: "very-slow", label: "Very slow - takes a week or more" }
      ]
    },
    {
      id: 8,
      question: "What factors do you notice affect your energy levels most?",
      type: "textarea",
      placeholder: "Describe factors like sleep, diet, stress, hormones, weather, etc. that impact your energy..."
    }
  ],
  
  "body-mobility-&-strength-analysis": [
    {
      id: 1,
      question: "How would you rate your overall physical strength?",
      type: "radio",
      options: [
        { value: "strong", label: "Strong - feel physically capable" },
        { value: "moderate", label: "Moderate - adequate strength" },
        { value: "weak", label: "Weak - struggle with physical tasks" },
        { value: "very-weak", label: "Very weak - difficulty with daily activities" }
      ]
    },
    {
      id: 2,
      question: "How is your flexibility and range of motion?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - very flexible" },
        { value: "good", label: "Good - reasonably flexible" },
        { value: "stiff", label: "Stiff - limited flexibility" },
        { value: "very-stiff", label: "Very stiff - restricted movement" }
      ]
    },
    {
      id: 3,
      question: "How often do you experience muscle or joint stiffness?",
      type: "radio",
      options: [
        { value: "never", label: "Never or rarely" },
        { value: "sometimes", label: "Sometimes after activity" },
        { value: "often", label: "Often, especially in the morning" },
        { value: "constant", label: "Constantly stiff" }
      ]
    }
  ],
  
  // Balance Pillar Assessments
  "balance-stress-&-anxiety-assessment": [
    {
      id: 1,
      question: "How often do you feel overwhelmed by stress in your daily life?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely - manage stress well most of the time" },
        { value: "sometimes", label: "Sometimes - during particularly busy or challenging periods" },
        { value: "often", label: "Often - stress is a regular issue I deal with" },
        { value: "constant", label: "Constantly - feel chronically stressed and overwhelmed" }
      ]
    },
    {
      id: 2,
      question: "How would you rate your overall anxiety levels?",
      type: "radio",
      options: [
        { value: "low", label: "Low - rarely feel anxious or worried" },
        { value: "mild", label: "Mild - occasional anxiety that's manageable" },
        { value: "moderate", label: "Moderate - regular anxiety episodes that interfere with life" },
        { value: "severe", label: "Severe - anxiety significantly impacts my daily functioning" }
      ]
    },
    {
      id: 3,
      question: "How well do you sleep when you're stressed or anxious?",
      type: "radio",
      options: [
        { value: "normal", label: "Sleep normally despite stress - good coping mechanism" },
        { value: "slightly-affected", label: "Slightly affected - takes longer to fall asleep" },
        { value: "poor", label: "Poor sleep - frequent waking or restless sleep" },
        { value: "insomnia", label: "Stress causes significant insomnia or sleep disruption" }
      ]
    },
    {
      id: 4,
      question: "What physical symptoms do you experience when stressed or anxious?",
      type: "radio",
      options: [
        { value: "minimal", label: "Minimal physical symptoms" },
        { value: "some", label: "Some symptoms (tension, headaches, stomach upset)" },
        { value: "many", label: "Multiple symptoms (racing heart, sweating, muscle tension)" },
        { value: "severe", label: "Severe symptoms (panic attacks, chest pain, breathing issues)" }
      ]
    },
    {
      id: 5,
      question: "How effectively do you feel you cope with stress?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - have effective strategies and bounce back quickly" },
        { value: "good", label: "Good - generally manage well with some effort" },
        { value: "fair", label: "Fair - struggle sometimes but get by" },
        { value: "poor", label: "Poor - often feel overwhelmed and unable to cope effectively" }
      ]
    },
    {
      id: 6,
      question: "What are your primary sources of stress currently?",
      type: "radio",
      options: [
        { value: "work", label: "Work or career pressures" },
        { value: "relationships", label: "Relationships or family dynamics" },
        { value: "health", label: "Health concerns or symptoms" },
        { value: "finances", label: "Financial pressures or security" },
        { value: "multiple", label: "Multiple areas creating stress" }
      ]
    },
    {
      id: 7,
      question: "How do you currently manage stress and anxiety?",
      type: "textarea",
      placeholder: "Describe your current stress management techniques, coping strategies, or support systems..."
    }
  ],

  "balance-hormonal-balance-evaluation": [
    {
      id: 1,
      question: "How regular are your menstrual cycles? (if applicable)",
      type: "radio",
      options: [
        { value: "regular", label: "Regular and predictable (21-35 day cycles)" },
        { value: "somewhat-irregular", label: "Somewhat irregular but generally predictable" },
        { value: "very-irregular", label: "Very irregular or unpredictable cycles" },
        { value: "absent", label: "Absent or very infrequent periods" },
        { value: "not-applicable", label: "Not applicable / post-menopause" }
      ]
    },
    {
      id: 2,
      question: "How stable is your mood throughout the day and month?",
      type: "radio",
      options: [
        { value: "very-stable", label: "Very stable - consistent mood most of the time" },
        { value: "minor-fluctuations", label: "Minor mood fluctuations - generally stable" },
        { value: "moderate-swings", label: "Moderate mood swings - noticeable changes" },
        { value: "severe-swings", label: "Severe mood swings - significant emotional ups and downs" }
      ]
    },
    {
      id: 3,
      question: "How is your libido/sexual desire?",
      type: "radio",
      options: [
        { value: "normal", label: "Normal and healthy for my age" },
        { value: "somewhat-low", label: "Somewhat lower than I'd like" },
        { value: "low", label: "Low libido - rarely interested" },
        { value: "very-low", label: "Very low or absent libido" }
      ]
    },
    {
      id: 4,
      question: "How do you experience PMS or pre-menstrual symptoms?",
      type: "radio",
      options: [
        { value: "minimal", label: "Minimal or no symptoms" },
        { value: "mild", label: "Mild symptoms that don't interfere much" },
        { value: "moderate", label: "Moderate symptoms that affect daily life" },
        { value: "severe", label: "Severe symptoms that significantly disrupt life" },
        { value: "not-applicable", label: "Not applicable" }
      ]
    },
    {
      id: 5,
      question: "How is your energy in relation to your menstrual cycle?",
      type: "radio",
      options: [
        { value: "consistent", label: "Consistent energy throughout my cycle" },
        { value: "minor-changes", label: "Minor changes - slightly lower at certain times" },
        { value: "significant-dips", label: "Significant energy dips during certain phases" },
        { value: "severe-fatigue", label: "Severe fatigue that impacts functioning" },
        { value: "not-applicable", label: "Not applicable" }
      ]
    },
    {
      id: 6,
      question: "How would you describe your sleep quality in relation to hormones?",
      type: "radio",
      options: [
        { value: "unaffected", label: "Sleep quality unaffected by hormonal changes" },
        { value: "slightly-affected", label: "Slightly affected during certain times of month" },
        { value: "moderately-affected", label: "Moderately affected - noticeable sleep disruption" },
        { value: "severely-affected", label: "Severely affected - significant sleep problems" }
      ]
    },
    {
      id: 7,
      question: "Have you experienced significant weight changes that seem hormone-related?",
      type: "radio",
      options: [
        { value: "no-change", label: "No significant hormone-related weight changes" },
        { value: "minor-fluctuations", label: "Minor weight fluctuations with cycles" },
        { value: "moderate-changes", label: "Moderate weight changes - 5-15 lbs" },
        { value: "significant-changes", label: "Significant weight changes - 15+ lbs" }
      ]
    },
    {
      id: 8,
      question: "How do you experience temperature regulation (hot/cold sensitivity)?",
      type: "radio",
      options: [
        { value: "normal", label: "Normal temperature regulation" },
        { value: "slightly-sensitive", label: "Slightly more sensitive to temperature changes" },
        { value: "hot-flashes", label: "Experience hot flashes or sudden temperature changes" },
        { value: "severe-dysregulation", label: "Severe temperature regulation problems" }
      ]
    },
    {
      id: 9,
      question: "What hormonal symptoms concern you most currently?",
      type: "textarea",
      placeholder: "Describe your most concerning hormonal symptoms or patterns..."
    }
  ],
  
  // Beauty Pillar Assessments
  "beauty-skin-health-assessment": [
    {
      id: 1,
      question: "How would you describe your current skin condition?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - clear, smooth, and radiant" },
        { value: "good", label: "Good - generally healthy with minor issues" },
        { value: "fair", label: "Fair - some concerns like dryness or breakouts" },
        { value: "poor", label: "Poor - multiple skin issues" }
      ]
    },
    {
      id: 2,
      question: "What is your primary skin concern?",
      type: "radio",
      options: [
        { value: "aging", label: "Signs of aging (wrinkles, fine lines)" },
        { value: "acne", label: "Acne or breakouts" },
        { value: "dryness", label: "Dryness or dehydration" },
        { value: "pigmentation", label: "Dark spots or uneven pigmentation" },
        { value: "sensitivity", label: "Sensitivity or irritation" }
      ]
    },
    {
      id: 3,
      question: "How consistent is your skincare routine?",
      type: "radio",
      options: [
        { value: "very-consistent", label: "Very consistent - daily routine" },
        { value: "mostly-consistent", label: "Mostly consistent with occasional lapses" },
        { value: "inconsistent", label: "Inconsistent - sporadic routine" },
        { value: "minimal", label: "Minimal or no routine" }
      ]
    }
  ],
  
  "beauty-beauty-&-aging-analysis": [
    {
      id: 1,
      question: "How satisfied are you with your current appearance?",
      type: "radio",
      options: [
        { value: "very-satisfied", label: "Very satisfied" },
        { value: "mostly-satisfied", label: "Mostly satisfied with minor concerns" },
        { value: "somewhat-dissatisfied", label: "Somewhat dissatisfied" },
        { value: "very-dissatisfied", label: "Very dissatisfied" }
      ]
    },
    {
      id: 2,
      question: "What aging concerns you most?",
      type: "radio",
      options: [
        { value: "facial-aging", label: "Facial aging (wrinkles, sagging)" },
        { value: "hair-changes", label: "Hair thinning or graying" },
        { value: "body-changes", label: "Body shape or skin texture changes" },
        { value: "energy-appearance", label: "Looking tired or lacking vitality" }
      ]
    },
    {
      id: 3,
      question: "How important is anti-aging prevention to you?",
      type: "radio",
      options: [
        { value: "very-important", label: "Very important - actively prevent aging" },
        { value: "important", label: "Important - some preventive measures" },
        { value: "somewhat-important", label: "Somewhat important" },
        { value: "not-important", label: "Not a current priority" }
      ]
    }
  ],
  
  "brain-memory-&-focus-analysis": [
    {
      id: 1,
      question: "How would you rate your working memory (ability to hold information temporarily)?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - can easily juggle multiple pieces of information" },
        { value: "good", label: "Good - generally manage well" },
        { value: "fair", label: "Fair - sometimes struggle with multiple tasks" },
        { value: "poor", label: "Poor - difficulty holding information in mind" }
      ]
    },
    {
      id: 2,
      question: "How is your ability to learn new information?",
      type: "radio",
      options: [
        { value: "fast", label: "Fast learner - pick up new concepts quickly" },
        { value: "normal", label: "Normal pace - learn at average speed" },
        { value: "slow", label: "Slow learner - need extra time and repetition" },
        { value: "difficulty", label: "Significant difficulty learning new things" }
      ]
    },
    {
      id: 3,
      question: "How often do you experience 'tip of the tongue' moments?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely" },
        { value: "weekly", label: "Weekly" },
        { value: "daily", label: "Daily" },
        { value: "frequent", label: "Multiple times daily" }
      ]
    },
    {
      id: 4,
      question: "How is your ability to concentrate for extended periods?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - can focus for hours without breaks" },
        { value: "good", label: "Good - can focus for 45-90 minutes" },
        { value: "fair", label: "Fair - can focus for 20-45 minutes" },
        { value: "poor", label: "Poor - difficulty focusing for more than 20 minutes" }
      ]
    },
    {
      id: 5,
      question: "How is your short-term memory for daily tasks?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - rarely forget what I need to do" },
        { value: "good", label: "Good - occasional minor lapses" },
        { value: "fair", label: "Fair - frequently need reminders or lists" },
        { value: "poor", label: "Poor - constantly forgetting tasks and appointments" }
      ]
    },
    {
      id: 6,
      question: "How well do you remember names and faces?",
      type: "radio",
      options: [
        { value: "excellent", label: "Excellent - easily remember people I meet" },
        { value: "good", label: "Good - remember with some effort" },
        { value: "fair", label: "Fair - struggle with names but remember faces" },
        { value: "poor", label: "Poor - difficulty with both names and faces" }
      ]
    },
    {
      id: 7,
      question: "How has your memory changed over the past few years?",
      type: "radio",
      options: [
        { value: "improved", label: "Improved or stayed the same" },
        { value: "slight-decline", label: "Slight decline but manageable" },
        { value: "noticeable-decline", label: "Noticeable decline that concerns me" },
        { value: "significant-decline", label: "Significant decline affecting daily life" }
      ]
    }
  ],

  // Individual Symptom Assessments
  "brain-fog": [
    {
      id: 1,
      question: "How often do you experience mental fog or difficulty thinking clearly?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely - only when very tired or stressed" },
        { value: "weekly", label: "Weekly - a few times per week" },
        { value: "daily", label: "Daily - most days I experience some brain fog" },
        { value: "constant", label: "Constantly - persistent mental cloudiness" }
      ]
    },
    {
      id: 2,
      question: "How severely does brain fog impact your daily functioning?",
      type: "radio",
      options: [
        { value: "minimal", label: "Minimal impact - barely noticeable" },
        { value: "mild", label: "Mild impact - slightly slower thinking" },
        { value: "moderate", label: "Moderate impact - affects work or daily tasks" },
        { value: "severe", label: "Severe impact - significantly impairs function" }
      ]
    },
    {
      id: 3,
      question: "When do you typically experience brain fog most?",
      type: "radio",
      options: [
        { value: "morning", label: "Morning - difficulty getting mentally started" },
        { value: "afternoon", label: "Afternoon - post-lunch mental dip" },
        { value: "evening", label: "Evening - mental fatigue sets in" },
        { value: "variable", label: "Variable - no consistent pattern" }
      ]
    },
    {
      id: 4,
      question: "What symptoms accompany your brain fog?",
      type: "radio",
      options: [
        { value: "concentration", label: "Difficulty concentrating and focusing" },
        { value: "memory", label: "Memory problems and forgetfulness" },
        { value: "words", label: "Difficulty finding words or expressing thoughts" },
        { value: "all", label: "All of the above symptoms" }
      ]
    },
    {
      id: 5,
      question: "What seems to trigger or worsen your brain fog?",
      type: "textarea",
      placeholder: "Describe factors like stress, hormones, diet, sleep, medications, or other triggers..."
    }
  ],

  "energy-levels": [
    {
      id: 1,
      question: "How would you describe your overall energy levels?",
      type: "radio",
      options: [
        { value: "high", label: "High - feel energetic most of the time" },
        { value: "moderate", label: "Moderate - adequate energy with some fluctuation" },
        { value: "low", label: "Low - frequently feel tired and low energy" },
        { value: "depleted", label: "Severely depleted - constantly exhausted" }
      ]
    },
    {
      id: 2,
      question: "How has your energy changed over the past year?",
      type: "radio",
      options: [
        { value: "improved", label: "Improved - energy levels have gotten better" },
        { value: "same", label: "About the same - no significant change" },
        { value: "declined", label: "Declined - less energy than before" },
        { value: "severely-declined", label: "Severely declined - major drop in energy" }
      ]
    },
    {
      id: 3,
      question: "How do you feel upon waking in the morning?",
      type: "radio",
      options: [
        { value: "refreshed", label: "Refreshed and ready for the day" },
        { value: "okay", label: "Okay but need time to fully wake up" },
        { value: "tired", label: "Tired despite adequate sleep" },
        { value: "exhausted", label: "Exhausted even after full night's sleep" }
      ]
    },
    {
      id: 4,
      question: "When during the day do you typically have the most energy?",
      type: "radio",
      options: [
        { value: "morning", label: "Morning hours (6 AM - 12 PM)" },
        { value: "afternoon", label: "Afternoon (12 PM - 6 PM)" },
        { value: "evening", label: "Evening (6 PM - 10 PM)" },
        { value: "never", label: "Never feel like I have good energy" }
      ]
    },
    {
      id: 5,
      question: "How does physical activity affect your energy?",
      type: "radio",
      options: [
        { value: "boosts", label: "Boosts my energy - I feel more energetic after" },
        { value: "neutral", label: "Neutral - normal recovery without energy boost" },
        { value: "drains", label: "Drains me - takes longer to recover than expected" },
        { value: "depletes", label: "Severely depletes me - exhausted for days" }
      ]
    }
  ],

  "anxiety": [
    {
      id: 1,
      question: "How often do you experience anxiety or worry?",
      type: "radio",
      options: [
        { value: "rare", label: "Rarely - only in very stressful situations" },
        { value: "sometimes", label: "Sometimes - a few times per week" },
        { value: "often", label: "Often - most days I feel anxious" },
        { value: "constant", label: "Constantly - persistent anxiety throughout day" }
      ]
    },
    {
      id: 2,
      question: "How would you rate the intensity of your anxiety?",
      type: "radio",
      options: [
        { value: "mild", label: "Mild - manageable worry or unease" },
        { value: "moderate", label: "Moderate - noticeable anxiety that affects functioning" },
        { value: "severe", label: "Severe - intense anxiety that disrupts daily life" },
        { value: "panic", label: "Panic level - overwhelming fear or panic attacks" }
      ]
    },
    {
      id: 3,
      question: "What physical symptoms accompany your anxiety?",
      type: "radio",
      options: [
        { value: "minimal", label: "Minimal - mostly mental worry" },
        { value: "some", label: "Some physical symptoms (tension, butterflies)" },
        { value: "many", label: "Many symptoms (racing heart, sweating, trembling)" },
        { value: "severe", label: "Severe symptoms (chest pain, difficulty breathing)" }
      ]
    },
    {
      id: 4,
      question: "What situations or thoughts trigger your anxiety most?",
      type: "textarea",
      placeholder: "Describe your main anxiety triggers, situations, or thought patterns..."
    }
  ]
};

const SymptomAssessment = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  console.log('🚀 SymptomAssessment loaded - FRESH VERSION', { symptomId, user: !!user });
  
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = symptomId ? (assessmentQuestions[symptomId as keyof typeof assessmentQuestions] || []) : [];

  const handleAnswer = (questionId: number, answer: string) => {
    console.log('📝 Answer updated:', { questionId, answer });
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🎯 Form submitted!', { questions: questions.length, answers });
    
    // Check if all questions are answered
    const allAnswered = questions.every(q => {
      const hasAnswer = answers[q.id] && answers[q.id].trim() !== "";
      console.log(`❓ Question ${q.id}: ${hasAnswer ? '✅ ANSWERED' : '❌ MISSING'}`, answers[q.id]);
      return hasAnswer;
    });
    
    console.log('✅ All questions answered:', allAnswered);
    
    if (!allAnswered) {
      console.log('❌ Validation failed - showing toast');
      toast({
        variant: "destructive",
        title: "Please answer all questions",
        description: "All questions must be completed before submitting."
      });
      return;
    }
    
    console.log('🎉 Validation passed - calling completeAssessment');
    completeAssessment();
  };

  const completeAssessment = async () => {
    console.log('💾 Starting completeAssessment', { user: !!user, symptomId });
    
    if (isSubmitting) {
      console.log('🛑 Already submitting, ignoring duplicate call');
      return;
    }
    
    setIsSubmitting(true);
    
    if (!user) {
      console.log('❌ User not authenticated');
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to save your assessment results."
      });
      navigate('/auth');
      setIsSubmitting(false);
      return;
    }

    if (!symptomId) {
      console.log('❌ Missing symptomId');
      toast({
        variant: "destructive",
        title: "Error",
        description: "Symptom ID is missing. Please try again."
      });
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📤 Saving to database...', answers);
      
      // Save assessment results to database with proper conflict resolution
      const { error } = await supabase
        .from('user_symptoms')
        .upsert({
          user_id: user.id,
          symptom_id: symptomId,
          is_active: true,
          severity: 'Moderate', // This would be calculated based on answers
          frequency: 'Weekly', // This would be calculated based on answers
          notes: JSON.stringify(answers),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,symptom_id'
        });

      if (error) {
        console.error('❌ Database error:', error);
        throw error;
      }

      console.log('✅ Assessment saved successfully');
      toast({
        title: "Assessment Complete",
        description: "Your responses have been saved. View your symptom summary."
      });
      
      setIsComplete(true);
      
      // Navigate to results page with answers as URL parameters
      const urlParams = new URLSearchParams();
      Object.entries(answers).forEach(([questionId, answer]) => {
        urlParams.set(`q${questionId}`, answer);
      });
      
      setTimeout(() => {
        navigate(`/assessment/${symptomId}/results?${urlParams.toString()}`);
      }, 1000);
    } catch (error) {
      console.error('❌ Error saving assessment:', error);
      toast({
        variant: "destructive",
        title: "Error saving assessment",
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSymptomName = (id: string) => {
    const nameMap: Record<string, string> = {
      "hot-flashes": "Hot Flashes",
      "sleep": "Sleep Issues",
      "joint-pain": "Joint Pain",
      "brain-fog": "Brain Fog",
      "energy-levels": "Low Energy",
      "bloating": "Bloating",
      "weight-changes": "Weight Changes",
      "hair-thinning": "Hair Thinning",
      "anxiety": "Anxiety",
      "irregular-periods": "Irregular Periods",
      "headaches": "Headaches",
      "night-sweats": "Night Sweats",
      "memory-issues": "Memory Issues",
      "gut": "Gut Health",
      // Brain Pillar Assessments
      "brain-brain-fog-assessment": "Brain Fog Assessment",
      "brain-memory-&-focus-analysis": "Memory & Focus Analysis",
      // Body Pillar Assessments
      "body-energy-&-fatigue-assessment": "Energy & Fatigue Assessment",
      "body-mobility-&-strength-analysis": "Mobility & Strength Analysis",
      // Balance Pillar Assessments
      "balance-stress-&-anxiety-assessment": "Stress & Anxiety Assessment",
      "balance-hormonal-balance-evaluation": "Hormonal Balance Evaluation",
      // Beauty Pillar Assessments
      "beauty-skin-health-assessment": "Skin Health Assessment",
      "beauty-beauty-&-aging-analysis": "Beauty & Aging Analysis"
    };
    return nameMap[id] || id;
  };

  const isPillarAssessment = symptomId?.includes('-');
  const pillarName = isPillarAssessment ? symptomId?.split('-')[0] : null;
  
  const getBackRoute = () => {
    if (isPillarAssessment && pillarName) {
      return `/pillars?pillar=${pillarName}`;
    }
    return '/symptoms';
  };

  const getBackText = () => {
    if (isPillarAssessment && pillarName) {
      return `Back to ${pillarName.charAt(0).toUpperCase() + pillarName.slice(1)} Pillar`;
    }
    return 'Back to Symptoms';
  };

  if (!symptomId || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Assessment Not Available</h1>
            <p className="text-muted-foreground mb-6">
              This symptom assessment is not yet available.
            </p>
            <Button onClick={() => navigate(getBackRoute())}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {getBackText()}
            </Button>
          </div>
        </main>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="text-center">
            <CardHeader>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
              <CardDescription>
                Thank you for completing the {getSymptomName(symptomId)} assessment.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Your responses have been analyzed and personalized recommendations are being prepared.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/symptoms')}>
                  View More Symptoms
                </Button>
                <Button variant="outline" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(getBackRoute())}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {getBackText()}
          </Button>
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">{getSymptomName(symptomId)} Assessment</h1>
            <p className="text-muted-foreground">
              Please answer all questions to get your personalized recommendations
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </span>
                  {question.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {question.type === "radio" && question.options && (
                  <RadioGroup
                    value={answers[question.id] || ""}
                    onValueChange={(value) => handleAnswer(question.id, value)}
                  >
                    {question.options.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.value} id={`${question.id}-${option.value}`} />
                        <Label htmlFor={`${question.id}-${option.value}`} className="cursor-pointer flex-1">
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {question.type === "textarea" && (
                  <Textarea
                    placeholder={('placeholder' in question) ? question.placeholder : "Enter your response..."}
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswer(question.id, e.target.value)}
                    rows={4}
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-center pt-6">
            <Button 
              type="submit" 
              size="lg" 
              className="px-8"
              disabled={isSubmitting}
              onClick={() => console.log('🔥 Button clicked directly!')}
            >
              {isSubmitting ? "Saving..." : "🚀 Complete Assessment"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SymptomAssessment;