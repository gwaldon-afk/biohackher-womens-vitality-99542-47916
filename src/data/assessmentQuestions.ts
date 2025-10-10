// Scientifically-based assessment questions for all assessment types
// Based on validated questionnaires and research instruments

export interface AssessmentQuestion {
  id: string;
  category: string;
  question: string;
  options: Array<{
    text: string;
    score: number;
  }>;
}

export interface AssessmentConfig {
  id: string;
  name: string;
  description: string;
  pillar: string;
  questions: AssessmentQuestion[];
  scoringGuidance: {
    excellent: { min: number; max: number; description: string };
    good: { min: number; max: number; description: string };
    fair: { min: number; max: number; description: string };
    poor: { min: number; max: number; description: string };
  };
}

// COGNITIVE & BRAIN ASSESSMENTS

const cognitiveFunction: AssessmentConfig = {
  id: "cognitive-function",
  name: "Cognitive Function Assessment",
  description: "Comprehensive cognitive performance evaluation based on validated neuropsychological measures",
  pillar: "brain",
  questions: [
    {
      id: "memory-recall",
      category: "Memory",
      question: "How would you rate your ability to remember recent conversations or events?",
      options: [
        { text: "Excellent - I rarely forget details", score: 100 },
        { text: "Good - I remember most things", score: 75 },
        { text: "Fair - I sometimes forget details", score: 50 },
        { text: "Poor - I frequently forget conversations", score: 25 }
      ]
    },
    {
      id: "working-memory",
      category: "Memory",
      question: "How easily can you hold and manipulate information in your mind (e.g., mental math, following complex instructions)?",
      options: [
        { text: "Very easily - No difficulty", score: 100 },
        { text: "Fairly easily - Minor challenges", score: 75 },
        { text: "With difficulty - Noticeable challenges", score: 50 },
        { text: "Very difficult - Significant struggles", score: 25 }
      ]
    },
    {
      id: "attention-sustained",
      category: "Focus",
      question: "How long can you maintain focus on a single task without distraction?",
      options: [
        { text: "Over 2 hours easily", score: 100 },
        { text: "1-2 hours", score: 75 },
        { text: "30 minutes to 1 hour", score: 50 },
        { text: "Less than 30 minutes", score: 25 }
      ]
    },
    {
      id: "processing-speed",
      category: "Processing",
      question: "How quickly do you understand and respond to new information?",
      options: [
        { text: "Very quickly - I'm usually the first to grasp concepts", score: 100 },
        { text: "Quickly - I understand at a normal pace", score: 75 },
        { text: "Slowly - I need extra time", score: 50 },
        { text: "Very slowly - I struggle to keep up", score: 25 }
      ]
    },
    {
      id: "executive-function",
      category: "Executive Function",
      question: "How well can you plan, organize, and complete complex multi-step tasks?",
      options: [
        { text: "Excellent - I handle complex tasks effortlessly", score: 100 },
        { text: "Good - I manage well with some effort", score: 75 },
        { text: "Fair - I struggle with complex tasks", score: 50 },
        { text: "Poor - Complex tasks overwhelm me", score: 25 }
      ]
    },
    {
      id: "verbal-fluency",
      category: "Language",
      question: "How easily can you find the right words when speaking or writing?",
      options: [
        { text: "Very easily - Words come naturally", score: 100 },
        { text: "Fairly easily - Occasional word-finding issues", score: 75 },
        { text: "With difficulty - Frequent word-finding problems", score: 50 },
        { text: "Very difficult - Constant word-finding struggles", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Superior cognitive function across all domains" },
    good: { min: 70, max: 84, description: "Good cognitive function with minor areas for improvement" },
    fair: { min: 50, max: 69, description: "Moderate cognitive challenges requiring attention" },
    poor: { min: 0, max: 49, description: "Significant cognitive difficulties needing comprehensive support" }
  }
};

const brainFog: AssessmentConfig = {
  id: "brain-fog",
  name: "Brain Fog Assessment",
  description: "Evaluate mental clarity and cognitive fatigue based on validated instruments",
  pillar: "brain",
  questions: [
    {
      id: "mental-clarity",
      category: "Clarity",
      question: "How often do you experience mental cloudiness or lack of clarity?",
      options: [
        { text: "Rarely or never", score: 100 },
        { text: "Occasionally (1-2 days/week)", score: 70 },
        { text: "Frequently (3-5 days/week)", score: 40 },
        { text: "Almost daily", score: 10 }
      ]
    },
    {
      id: "concentration-difficulty",
      category: "Focus",
      question: "How difficult is it to concentrate on tasks throughout the day?",
      options: [
        { text: "No difficulty", score: 100 },
        { text: "Mild difficulty", score: 70 },
        { text: "Moderate difficulty", score: 40 },
        { text: "Severe difficulty", score: 10 }
      ]
    },
    {
      id: "mental-fatigue",
      category: "Fatigue",
      question: "How quickly does mental exhaustion set in when doing cognitive tasks?",
      options: [
        { text: "I can work for hours without fatigue", score: 100 },
        { text: "After 2-3 hours of mental work", score: 70 },
        { text: "After 1 hour of mental work", score: 40 },
        { text: "Within 30 minutes", score: 10 }
      ]
    },
    {
      id: "forgetfulness",
      category: "Memory",
      question: "How often do you forget why you entered a room or lose track of conversations?",
      options: [
        { text: "Rarely", score: 100 },
        { text: "Sometimes (once a week)", score: 70 },
        { text: "Often (several times a week)", score: 40 },
        { text: "Very frequently (daily)", score: 10 }
      ]
    },
    {
      id: "sluggish-thinking",
      category: "Processing",
      question: "How would you describe your thinking speed?",
      options: [
        { text: "Quick and sharp", score: 100 },
        { text: "Normal pace", score: 70 },
        { text: "Noticeably slower than usual", score: 40 },
        { text: "Very sluggish and delayed", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal brain fog - excellent mental clarity" },
    good: { min: 65, max: 84, description: "Mild brain fog - manageable with lifestyle adjustments" },
    fair: { min: 40, max: 64, description: "Moderate brain fog - requires targeted interventions" },
    poor: { min: 0, max: 39, description: "Severe brain fog - comprehensive medical evaluation recommended" }
  }
};

const sleepQuality: AssessmentConfig = {
  id: "sleep",
  name: "Sleep Quality Assessment",
  description: "Based on Pittsburgh Sleep Quality Index (PSQI) and sleep medicine research",
  pillar: "brain",
  questions: [
    {
      id: "sleep-latency",
      category: "Sleep Onset",
      question: "How long does it typically take you to fall asleep?",
      options: [
        { text: "Less than 15 minutes", score: 100 },
        { text: "15-30 minutes", score: 75 },
        { text: "31-60 minutes", score: 40 },
        { text: "More than 60 minutes", score: 10 }
      ]
    },
    {
      id: "sleep-duration",
      category: "Duration",
      question: "How many hours of actual sleep do you get per night?",
      options: [
        { text: "7-9 hours", score: 100 },
        { text: "6-7 hours", score: 75 },
        { text: "5-6 hours", score: 40 },
        { text: "Less than 5 hours", score: 10 }
      ]
    },
    {
      id: "sleep-continuity",
      category: "Sleep Maintenance",
      question: "How often do you wake up during the night?",
      options: [
        { text: "Rarely - I sleep through the night", score: 100 },
        { text: "Once per night", score: 75 },
        { text: "2-3 times per night", score: 40 },
        { text: "More than 3 times per night", score: 10 }
      ]
    },
    {
      id: "sleep-quality-subjective",
      category: "Quality",
      question: "How would you rate the overall quality of your sleep?",
      options: [
        { text: "Excellent - I wake refreshed", score: 100 },
        { text: "Good - Generally restful", score: 75 },
        { text: "Fair - Not very restful", score: 40 },
        { text: "Poor - I never feel rested", score: 10 }
      ]
    },
    {
      id: "daytime-dysfunction",
      category: "Daytime Impact",
      question: "How much does poor sleep affect your daytime functioning?",
      options: [
        { text: "No effect - I feel energized", score: 100 },
        { text: "Slight effect - Minor fatigue", score: 75 },
        { text: "Moderate effect - Noticeable fatigue", score: 40 },
        { text: "Severe effect - Can barely function", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Excellent sleep quality supporting optimal health" },
    good: { min: 65, max: 84, description: "Good sleep with room for improvement" },
    fair: { min: 40, max: 64, description: "Poor sleep quality requiring intervention" },
    poor: { min: 0, max: 39, description: "Severe sleep dysfunction - medical evaluation recommended" }
  }
};

// BODY & PHYSICAL ASSESSMENTS

const energyLevels: AssessmentConfig = {
  id: "energy-levels",
  name: "Energy Levels Assessment",
  description: "Based on Chalder Fatigue Scale and energy assessment research",
  pillar: "body",
  questions: [
    {
      id: "morning-energy",
      category: "Morning",
      question: "How do you feel when you wake up in the morning?",
      options: [
        { text: "Energized and ready for the day", score: 100 },
        { text: "Reasonably refreshed", score: 70 },
        { text: "Tired and sluggish", score: 40 },
        { text: "Exhausted with no energy", score: 10 }
      ]
    },
    {
      id: "sustained-energy",
      category: "Endurance",
      question: "How is your energy throughout the day?",
      options: [
        { text: "Consistent and strong all day", score: 100 },
        { text: "Good with minor afternoon dip", score: 70 },
        { text: "Significant afternoon crash", score: 40 },
        { text: "Constantly exhausted", score: 10 }
      ]
    },
    {
      id: "physical-fatigue",
      category: "Physical Energy",
      question: "Do you feel physically tired or heavy in your body?",
      options: [
        { text: "Rarely - I feel light and energetic", score: 100 },
        { text: "Sometimes - Usually after activity", score: 70 },
        { text: "Often - Most of the day", score: 40 },
        { text: "Always - My body feels heavy", score: 10 }
      ]
    },
    {
      id: "motivation-energy",
      category: "Mental Energy",
      question: "How is your motivation to start and complete activities?",
      options: [
        { text: "High - I'm eager to do things", score: 100 },
        { text: "Good - I can get myself going", score: 70 },
        { text: "Low - It takes effort to start", score: 40 },
        { text: "Very low - Everything feels like a struggle", score: 10 }
      ]
    },
    {
      id: "recovery-energy",
      category: "Recovery",
      question: "How quickly do you recover energy after physical or mental exertion?",
      options: [
        { text: "Quickly - Within an hour", score: 100 },
        { text: "Moderately - A few hours", score: 70 },
        { text: "Slowly - Need a full day", score: 40 },
        { text: "Very slowly - Multiple days needed", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Optimal energy levels supporting peak performance" },
    good: { min: 65, max: 84, description: "Good energy with minor fatigue" },
    fair: { min: 40, max: 64, description: "Significant fatigue requiring intervention" },
    poor: { min: 0, max: 39, description: "Severe chronic fatigue - comprehensive evaluation needed" }
  }
};

const physicalPerformance: AssessmentConfig = {
  id: "physical-performance",
  name: "Physical Performance Assessment",
  description: "Based on functional movement assessment and sports medicine research",
  pillar: "body",
  questions: [
    {
      id: "strength-levels",
      category: "Strength",
      question: "How would you rate your overall strength for daily activities?",
      options: [
        { text: "Excellent - Everything feels easy", score: 100 },
        { text: "Good - I can handle most tasks", score: 75 },
        { text: "Fair - Some tasks are challenging", score: 50 },
        { text: "Poor - Many tasks are difficult", score: 25 }
      ]
    },
    {
      id: "endurance-capacity",
      category: "Endurance",
      question: "How long can you sustain physical activity (walking, stairs, etc.)?",
      options: [
        { text: "Over 30 minutes without difficulty", score: 100 },
        { text: "20-30 minutes comfortably", score: 75 },
        { text: "10-20 minutes with fatigue", score: 50 },
        { text: "Less than 10 minutes", score: 25 }
      ]
    },
    {
      id: "flexibility-mobility",
      category: "Mobility",
      question: "How is your flexibility and range of motion?",
      options: [
        { text: "Excellent - Full range of motion", score: 100 },
        { text: "Good - Minor stiffness", score: 75 },
        { text: "Limited - Noticeable restrictions", score: 50 },
        { text: "Very limited - Significant restrictions", score: 25 }
      ]
    },
    {
      id: "balance-coordination",
      category: "Balance",
      question: "How confident are you in your balance and coordination?",
      options: [
        { text: "Very confident - Never worry about balance", score: 100 },
        { text: "Confident - Rarely have issues", score: 75 },
        { text: "Somewhat confident - Occasional instability", score: 50 },
        { text: "Not confident - Frequently unsteady", score: 25 }
      ]
    },
    {
      id: "recovery-time",
      category: "Recovery",
      question: "How long does it take to recover from physical activity?",
      options: [
        { text: "Less than 24 hours", score: 100 },
        { text: "1-2 days", score: 75 },
        { text: "3-4 days", score: 50 },
        { text: "More than 4 days", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Excellent physical performance and function" },
    good: { min: 65, max: 84, description: "Good performance with room for enhancement" },
    fair: { min: 45, max: 64, description: "Moderate limitations requiring targeted training" },
    poor: { min: 0, max: 44, description: "Significant physical limitations - professional guidance recommended" }
  }
};

const painAssessment: AssessmentConfig = {
  id: "pain-assessment",
  name: "Pain Assessment",
  description: "Based on Brief Pain Inventory and McGill Pain Questionnaire",
  pillar: "body",
  questions: [
    {
      id: "pain-severity",
      category: "Severity",
      question: "On average, how would you rate your pain level?",
      options: [
        { text: "No pain", score: 100 },
        { text: "Mild pain (1-3/10)", score: 70 },
        { text: "Moderate pain (4-6/10)", score: 40 },
        { text: "Severe pain (7-10/10)", score: 10 }
      ]
    },
    {
      id: "pain-frequency",
      category: "Frequency",
      question: "How often do you experience pain?",
      options: [
        { text: "Never or rarely", score: 100 },
        { text: "Occasionally (1-2 days/week)", score: 70 },
        { text: "Frequently (3-5 days/week)", score: 40 },
        { text: "Daily or constant", score: 10 }
      ]
    },
    {
      id: "pain-interference-activity",
      category: "Impact",
      question: "How much does pain interfere with your daily activities?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "A little bit", score: 70 },
        { text: "Moderately", score: 40 },
        { text: "Severely - I can't do many activities", score: 10 }
      ]
    },
    {
      id: "pain-interference-sleep",
      category: "Sleep Impact",
      question: "Does pain interfere with your sleep?",
      options: [
        { text: "Never", score: 100 },
        { text: "Rarely", score: 70 },
        { text: "Often", score: 40 },
        { text: "Always - Pain prevents sleep", score: 10 }
      ]
    },
    {
      id: "pain-locations",
      category: "Distribution",
      question: "How many areas of your body are affected by pain?",
      options: [
        { text: "None", score: 100 },
        { text: "1-2 locations", score: 70 },
        { text: "3-4 locations", score: 40 },
        { text: "5 or more locations", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "No significant pain - optimal physical comfort" },
    good: { min: 65, max: 84, description: "Mild pain - manageable with minor interventions" },
    fair: { min: 40, max: 64, description: "Moderate pain - requires active management" },
    poor: { min: 0, max: 39, description: "Severe pain - comprehensive pain management needed" }
  }
};

// BALANCE & EMOTIONAL ASSESSMENTS

const stressAssessment: AssessmentConfig = {
  id: "stress-assessment",
  name: "Stress Assessment",
  description: "Based on Perceived Stress Scale (PSS) and stress research",
  pillar: "balance",
  questions: [
    {
      id: "stress-frequency",
      category: "Frequency",
      question: "How often have you felt stressed in the past month?",
      options: [
        { text: "Never or rarely", score: 100 },
        { text: "Sometimes", score: 65 },
        { text: "Often", score: 35 },
        { text: "Very often or constantly", score: 10 }
      ]
    },
    {
      id: "stress-control",
      category: "Control",
      question: "How often have you felt unable to control important things in your life?",
      options: [
        { text: "Never", score: 100 },
        { text: "Rarely", score: 65 },
        { text: "Sometimes", score: 35 },
        { text: "Often", score: 10 }
      ]
    },
    {
      id: "stress-overwhelm",
      category: "Overwhelm",
      question: "How often have you felt overwhelmed by your responsibilities?",
      options: [
        { text: "Never", score: 100 },
        { text: "Rarely", score: 65 },
        { text: "Sometimes", score: 35 },
        { text: "Often or always", score: 10 }
      ]
    },
    {
      id: "stress-coping",
      category: "Coping",
      question: "How confident are you in your ability to handle personal problems?",
      options: [
        { text: "Very confident", score: 100 },
        { text: "Fairly confident", score: 65 },
        { text: "Not very confident", score: 35 },
        { text: "Not confident at all", score: 10 }
      ]
    },
    {
      id: "stress-physical",
      category: "Physical Symptoms",
      question: "How often do you experience physical symptoms of stress (headaches, muscle tension, stomach issues)?",
      options: [
        { text: "Never", score: 100 },
        { text: "Rarely", score: 65 },
        { text: "Sometimes", score: 35 },
        { text: "Often or always", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 80, max: 100, description: "Low stress - excellent stress management" },
    good: { min: 60, max: 79, description: "Moderate stress - generally manageable" },
    fair: { min: 35, max: 59, description: "High stress - intervention recommended" },
    poor: { min: 0, max: 34, description: "Very high stress - immediate support needed" }
  }
};

const moodTracking: AssessmentConfig = {
  id: "mood-tracking",
  name: "Mood Assessment",
  description: "Based on PHQ-9 and mood disorder screening instruments",
  pillar: "balance",
  questions: [
    {
      id: "mood-general",
      category: "General Mood",
      question: "Over the past two weeks, how often have you felt down, depressed, or hopeless?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Several days", score: 65 },
        { text: "More than half the days", score: 35 },
        { text: "Nearly every day", score: 10 }
      ]
    },
    {
      id: "mood-interest",
      category: "Interest",
      question: "How often have you had little interest or pleasure in doing things?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Several days", score: 65 },
        { text: "More than half the days", score: 35 },
        { text: "Nearly every day", score: 10 }
      ]
    },
    {
      id: "mood-variability",
      category: "Stability",
      question: "How stable is your mood throughout the day?",
      options: [
        { text: "Very stable - Consistent positive mood", score: 100 },
        { text: "Fairly stable - Minor fluctuations", score: 65 },
        { text: "Somewhat unstable - Noticeable mood swings", score: 35 },
        { text: "Very unstable - Extreme mood swings", score: 10 }
      ]
    },
    {
      id: "mood-irritability",
      category: "Irritability",
      question: "How often do you feel irritable or easily annoyed?",
      options: [
        { text: "Rarely", score: 100 },
        { text: "Sometimes", score: 65 },
        { text: "Often", score: 35 },
        { text: "Almost constantly", score: 10 }
      ]
    },
    {
      id: "mood-energy",
      category: "Energy",
      question: "How would you describe your emotional energy levels?",
      options: [
        { text: "High - I feel emotionally vibrant", score: 100 },
        { text: "Good - Generally positive", score: 65 },
        { text: "Low - Often feeling flat", score: 35 },
        { text: "Very low - Emotionally exhausted", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 80, max: 100, description: "Excellent mood stability and emotional wellbeing" },
    good: { min: 60, max: 79, description: "Good mood with minor fluctuations" },
    fair: { min: 35, max: 59, description: "Mood concerns requiring support" },
    poor: { min: 0, max: 34, description: "Significant mood disturbance - professional help recommended" }
  }
};

const anxietyAssessment: AssessmentConfig = {
  id: "anxiety-assessment",
  name: "Anxiety Assessment",
  description: "Based on GAD-7 (Generalized Anxiety Disorder-7) scale",
  pillar: "balance",
  questions: [
    {
      id: "anxiety-nervousness",
      category: "Nervousness",
      question: "Over the past two weeks, how often have you felt nervous, anxious, or on edge?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Several days", score: 65 },
        { text: "More than half the days", score: 35 },
        { text: "Nearly every day", score: 10 }
      ]
    },
    {
      id: "anxiety-worry-control",
      category: "Worry Control",
      question: "How often have you been unable to stop or control worrying?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Several days", score: 65 },
        { text: "More than half the days", score: 35 },
        { text: "Nearly every day", score: 10 }
      ]
    },
    {
      id: "anxiety-excessive-worry",
      category: "Excessive Worry",
      question: "How often have you worried too much about different things?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Several days", score: 65 },
        { text: "More than half the days", score: 35 },
        { text: "Nearly every day", score: 10 }
      ]
    },
    {
      id: "anxiety-relaxation",
      category: "Relaxation",
      question: "How difficult is it for you to relax?",
      options: [
        { text: "Not difficult at all", score: 100 },
        { text: "Somewhat difficult", score: 65 },
        { text: "Very difficult", score: 35 },
        { text: "Extremely difficult", score: 10 }
      ]
    },
    {
      id: "anxiety-restlessness",
      category: "Restlessness",
      question: "How often have you felt restless or unable to sit still?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Several days", score: 65 },
        { text: "More than half the days", score: 35 },
        { text: "Nearly every day", score: 10 }
      ]
    },
    {
      id: "anxiety-fear",
      category: "Fear",
      question: "How often have you felt afraid that something awful might happen?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Several days", score: 65 },
        { text: "More than half the days", score: 35 },
        { text: "Nearly every day", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 80, max: 100, description: "Minimal anxiety - excellent emotional regulation" },
    good: { min: 60, max: 79, description: "Mild anxiety - generally manageable" },
    fair: { min: 35, max: 59, description: "Moderate anxiety - intervention recommended" },
    poor: { min: 0, max: 34, description: "Severe anxiety - professional treatment recommended" }
  }
};

// BEAUTY & AGING ASSESSMENTS

const skinHealth: AssessmentConfig = {
  id: "skin-health",
  name: "Skin Health Assessment",
  description: "Based on dermatological assessment scales and skin aging research",
  pillar: "beauty",
  questions: [
    {
      id: "skin-texture",
      category: "Texture",
      question: "How would you describe your skin texture?",
      options: [
        { text: "Smooth and even", score: 100 },
        { text: "Generally smooth with minor roughness", score: 70 },
        { text: "Noticeably rough or uneven", score: 40 },
        { text: "Very rough with significant texture issues", score: 10 }
      ]
    },
    {
      id: "skin-hydration",
      category: "Hydration",
      question: "How hydrated does your skin feel?",
      options: [
        { text: "Well-hydrated and supple", score: 100 },
        { text: "Generally hydrated", score: 70 },
        { text: "Often dry or tight", score: 40 },
        { text: "Very dry and dehydrated", score: 10 }
      ]
    },
    {
      id: "skin-elasticity",
      category: "Elasticity",
      question: "How would you rate your skin's elasticity and firmness?",
      options: [
        { text: "Excellent - Very firm and bouncy", score: 100 },
        { text: "Good - Generally firm", score: 70 },
        { text: "Fair - Some loss of firmness", score: 40 },
        { text: "Poor - Significant sagging", score: 10 }
      ]
    },
    {
      id: "skin-pigmentation",
      category: "Pigmentation",
      question: "Do you have concerns about uneven skin tone or dark spots?",
      options: [
        { text: "No - Even skin tone", score: 100 },
        { text: "Minor - Few small areas", score: 70 },
        { text: "Moderate - Several noticeable areas", score: 40 },
        { text: "Significant - Many areas of concern", score: 10 }
      ]
    },
    {
      id: "skin-sensitivity",
      category: "Sensitivity",
      question: "How sensitive or reactive is your skin?",
      options: [
        { text: "Not sensitive - Tolerates everything well", score: 100 },
        { text: "Mildly sensitive - Occasional reactions", score: 70 },
        { text: "Moderately sensitive - Frequent reactions", score: 40 },
        { text: "Very sensitive - Reacts to most products", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Excellent skin health - optimal condition" },
    good: { min: 65, max: 84, description: "Good skin health with minor concerns" },
    fair: { min: 40, max: 64, description: "Moderate skin concerns requiring targeted care" },
    poor: { min: 0, max: 39, description: "Significant skin issues - dermatological consultation recommended" }
  }
};

const hairVitality: AssessmentConfig = {
  id: "hair-vitality",
  name: "Hair Vitality Assessment",
  description: "Based on trichological assessment and hair health research",
  pillar: "beauty",
  questions: [
    {
      id: "hair-thickness",
      category: "Density",
      question: "Have you noticed changes in your hair thickness or density?",
      options: [
        { text: "No change - Hair remains thick", score: 100 },
        { text: "Slight thinning", score: 70 },
        { text: "Moderate thinning", score: 40 },
        { text: "Significant hair loss", score: 10 }
      ]
    },
    {
      id: "hair-growth",
      category: "Growth",
      question: "How would you describe your hair growth rate?",
      options: [
        { text: "Normal and healthy", score: 100 },
        { text: "Slightly slower than usual", score: 70 },
        { text: "Noticeably slower", score: 40 },
        { text: "Very slow or minimal growth", score: 10 }
      ]
    },
    {
      id: "hair-texture",
      category: "Texture",
      question: "How is the texture and condition of your hair?",
      options: [
        { text: "Healthy, shiny, and strong", score: 100 },
        { text: "Generally healthy with minor dryness", score: 70 },
        { text: "Dry, brittle, or damaged", score: 40 },
        { text: "Very damaged and breaking", score: 10 }
      ]
    },
    {
      id: "hair-shedding",
      category: "Shedding",
      question: "How much hair do you notice shedding daily?",
      options: [
        { text: "Minimal - Normal shedding", score: 100 },
        { text: "Moderate - Slightly more than usual", score: 70 },
        { text: "High - Noticeably more shedding", score: 40 },
        { text: "Excessive - Alarming amounts", score: 10 }
      ]
    },
    {
      id: "scalp-health",
      category: "Scalp",
      question: "How is your scalp health?",
      options: [
        { text: "Healthy - No issues", score: 100 },
        { text: "Minor issues - Occasional dryness or itching", score: 70 },
        { text: "Moderate issues - Frequent problems", score: 40 },
        { text: "Significant issues - Chronic scalp problems", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Excellent hair vitality and health" },
    good: { min: 65, max: 84, description: "Good hair health with minor concerns" },
    fair: { min: 40, max: 64, description: "Moderate hair concerns requiring intervention" },
    poor: { min: 0, max: 39, description: "Significant hair issues - trichological consultation recommended" }
  }
};

const agingConcerns: AssessmentConfig = {
  id: "aging-concerns",
  name: "Visible Aging Assessment",
  description: "Based on dermatological aging scales and longevity research",
  pillar: "beauty",
  questions: [
    {
      id: "fine-lines",
      category: "Lines & Wrinkles",
      question: "How would you rate the appearance of fine lines and wrinkles?",
      options: [
        { text: "Minimal or none", score: 100 },
        { text: "Few fine lines", score: 70 },
        { text: "Moderate lines and wrinkles", score: 40 },
        { text: "Significant deep wrinkles", score: 10 }
      ]
    },
    {
      id: "skin-sagging",
      category: "Firmness",
      question: "Have you noticed loss of skin firmness or sagging?",
      options: [
        { text: "No - Skin remains firm", score: 100 },
        { text: "Minimal loss of firmness", score: 70 },
        { text: "Moderate sagging", score: 40 },
        { text: "Significant sagging", score: 10 }
      ]
    },
    {
      id: "age-spots",
      category: "Pigmentation",
      question: "How much do age spots or sun damage concern you?",
      options: [
        { text: "No concerns - Clear skin", score: 100 },
        { text: "Minor spots - Few areas", score: 70 },
        { text: "Moderate spots - Several areas", score: 40 },
        { text: "Significant spots - Many areas", score: 10 }
      ]
    },
    {
      id: "facial-volume",
      category: "Volume",
      question: "Have you noticed loss of facial volume or hollowing?",
      options: [
        { text: "No loss - Full volume maintained", score: 100 },
        { text: "Slight volume loss", score: 70 },
        { text: "Moderate volume loss", score: 40 },
        { text: "Significant volume loss", score: 10 }
      ]
    },
    {
      id: "skin-radiance",
      category: "Radiance",
      question: "How would you describe your skin's radiance and glow?",
      options: [
        { text: "Radiant and glowing", score: 100 },
        { text: "Generally healthy-looking", score: 70 },
        { text: "Dull or lackluster", score: 40 },
        { text: "Very dull with no radiance", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal visible aging - excellent skin preservation" },
    good: { min: 65, max: 84, description: "Age-appropriate with minor concerns" },
    fair: { min: 40, max: 64, description: "Moderate aging signs - targeted interventions recommended" },
    poor: { min: 0, max: 39, description: "Significant aging concerns - comprehensive rejuvenation plan needed" }
  }
};

// MENOPAUSE-SPECIFIC ASSESSMENTS

const hotFlushes: AssessmentConfig = {
  id: "hot-flushes",
  name: "Hot Flush Assessment",
  description: "Based on Greene Climacteric Scale and menopause symptom research",
  pillar: "balance",
  questions: [
    {
      id: "flush-frequency",
      category: "Frequency",
      question: "How often do you experience hot flushes?",
      options: [
        { text: "Never or rarely", score: 100 },
        { text: "A few times per week", score: 65 },
        { text: "Daily", score: 35 },
        { text: "Multiple times per day", score: 10 }
      ]
    },
    {
      id: "flush-severity",
      category: "Severity",
      question: "How severe are your hot flushes when they occur?",
      options: [
        { text: "None", score: 100 },
        { text: "Mild - Barely noticeable", score: 65 },
        { text: "Moderate - Uncomfortable", score: 35 },
        { text: "Severe - Debilitating", score: 10 }
      ]
    },
    {
      id: "night-sweats",
      category: "Night Sweats",
      question: "How often do night sweats disrupt your sleep?",
      options: [
        { text: "Never", score: 100 },
        { text: "Occasionally", score: 65 },
        { text: "Frequently (3-5 nights/week)", score: 35 },
        { text: "Nightly", score: 10 }
      ]
    },
    {
      id: "flush-impact",
      category: "Impact",
      question: "How much do hot flushes interfere with your daily activities?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Slightly", score: 65 },
        { text: "Moderately", score: 35 },
        { text: "Severely - Major disruption", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal or no vasomotor symptoms" },
    good: { min: 60, max: 84, description: "Mild symptoms - manageable with lifestyle" },
    fair: { min: 35, max: 59, description: "Moderate symptoms - treatment may help" },
    poor: { min: 0, max: 34, description: "Severe symptoms - medical intervention recommended" }
  }
};

const memoryChanges: AssessmentConfig = {
  id: "memory-changes",
  name: "Menopause Memory Assessment",
  description: "Assessing cognitive changes during menopausal transition",
  pillar: "brain",
  questions: [
    {
      id: "word-finding",
      category: "Verbal Memory",
      question: "How often do you struggle to find the right words?",
      options: [
        { text: "Rarely", score: 100 },
        { text: "Sometimes", score: 65 },
        { text: "Often", score: 35 },
        { text: "Very frequently", score: 10 }
      ]
    },
    {
      id: "short-term-memory",
      category: "Short-term Memory",
      question: "Do you forget things you just read or conversations you just had?",
      options: [
        { text: "Rarely", score: 100 },
        { text: "Sometimes", score: 65 },
        { text: "Often", score: 35 },
        { text: "Very frequently", score: 10 }
      ]
    },
    {
      id: "task-completion",
      category: "Executive Function",
      question: "How often do you lose track of what you were doing?",
      options: [
        { text: "Rarely", score: 100 },
        { text: "Sometimes", score: 65 },
        { text: "Often", score: 35 },
        { text: "Very frequently", score: 10 }
      ]
    },
    {
      id: "mental-clarity-hormones",
      category: "Clarity",
      question: "How would you rate your overall mental clarity during this transition?",
      options: [
        { text: "Clear and sharp", score: 100 },
        { text: "Generally clear", score: 65 },
        { text: "Often foggy", score: 35 },
        { text: "Constantly foggy", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal cognitive changes" },
    good: { min: 60, max: 84, description: "Mild cognitive changes - typical of transition" },
    fair: { min: 35, max: 59, description: "Moderate changes - support recommended" },
    poor: { min: 0, max: 34, description: "Significant changes - comprehensive evaluation needed" }
  }
};

const weightChanges: AssessmentConfig = {
  id: "weight-changes",
  name: "Metabolic Changes Assessment",
  description: "Assessing metabolic shifts during menopause transition",
  pillar: "body",
  questions: [
    {
      id: "weight-gain",
      category: "Weight",
      question: "Have you experienced unexplained weight gain during menopause transition?",
      options: [
        { text: "No weight gain", score: 100 },
        { text: "Minimal gain (< 5 lbs)", score: 70 },
        { text: "Moderate gain (5-15 lbs)", score: 40 },
        { text: "Significant gain (> 15 lbs)", score: 10 }
      ]
    },
    {
      id: "body-composition",
      category: "Body Composition",
      question: "Have you noticed a change in where your body stores fat (more around midsection)?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slight change", score: 70 },
        { text: "Moderate change", score: 40 },
        { text: "Significant change", score: 10 }
      ]
    },
    {
      id: "metabolism-feel",
      category: "Metabolism",
      question: "Do you feel your metabolism has slowed down?",
      options: [
        { text: "No - Same as before", score: 100 },
        { text: "Slightly slower", score: 70 },
        { text: "Noticeably slower", score: 40 },
        { text: "Significantly slower", score: 10 }
      ]
    },
    {
      id: "weight-management-difficulty",
      category: "Management",
      question: "How difficult has it become to manage your weight?",
      options: [
        { text: "Not difficult - Same as before", score: 100 },
        { text: "Slightly more difficult", score: 70 },
        { text: "Much more difficult", score: 40 },
        { text: "Extremely difficult", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal metabolic changes" },
    good: { min: 60, max: 84, description: "Mild metabolic changes - manageable" },
    fair: { min: 35, max: 59, description: "Moderate metabolic challenges" },
    poor: { min: 0, max: 34, description: "Significant metabolic changes - support needed" }
  }
};

const muscleMaintenance: AssessmentConfig = {
  id: "muscle-maintenance",
  name: "Muscle Maintenance Assessment",
  description: "Assessing muscle mass and strength during menopause",
  pillar: "body",
  questions: [
    {
      id: "muscle-strength",
      category: "Strength",
      question: "Have you noticed a decrease in your muscle strength?",
      options: [
        { text: "No decrease - Same strength", score: 100 },
        { text: "Slight decrease", score: 70 },
        { text: "Moderate decrease", score: 40 },
        { text: "Significant decrease", score: 10 }
      ]
    },
    {
      id: "muscle-mass",
      category: "Mass",
      question: "Have you noticed loss of muscle tone or size?",
      options: [
        { text: "No loss", score: 100 },
        { text: "Slight loss", score: 70 },
        { text: "Moderate loss", score: 40 },
        { text: "Significant loss", score: 10 }
      ]
    },
    {
      id: "exercise-response",
      category: "Exercise Response",
      question: "How does your body respond to exercise compared to before menopause?",
      options: [
        { text: "Same response - Good muscle building", score: 100 },
        { text: "Slightly harder to build muscle", score: 70 },
        { text: "Much harder to build muscle", score: 40 },
        { text: "Very difficult to maintain muscle", score: 10 }
      ]
    },
    {
      id: "recovery-muscle",
      category: "Recovery",
      question: "How is your muscle recovery after exercise?",
      options: [
        { text: "Quick recovery - Same as before", score: 100 },
        { text: "Slightly slower", score: 70 },
        { text: "Much slower", score: 40 },
        { text: "Very slow - Prolonged soreness", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Excellent muscle maintenance" },
    good: { min: 60, max: 84, description: "Good muscle maintenance with minor changes" },
    fair: { min: 35, max: 59, description: "Moderate muscle loss - targeted intervention needed" },
    poor: { min: 0, max: 34, description: "Significant muscle loss - comprehensive program recommended" }
  }
};

const energyFluctuations: AssessmentConfig = {
  id: "energy-fluctuations",
  name: "Energy Fluctuations Assessment",
  description: "Assessing energy changes through hormonal transition",
  pillar: "body",
  questions: [
    {
      id: "energy-variability",
      category: "Variability",
      question: "How variable is your energy from day to day?",
      options: [
        { text: "Consistent - Stable energy", score: 100 },
        { text: "Slightly variable", score: 65 },
        { text: "Very variable - Unpredictable", score: 35 },
        { text: "Extremely variable - Exhausting unpredictability", score: 10 }
      ]
    },
    {
      id: "afternoon-crash",
      category: "Daily Pattern",
      question: "How severe are your afternoon energy crashes?",
      options: [
        { text: "No crashes", score: 100 },
        { text: "Mild dip", score: 65 },
        { text: "Moderate crash", score: 35 },
        { text: "Severe crash - Can barely function", score: 10 }
      ]
    },
    {
      id: "hormonal-energy-link",
      category: "Hormonal Impact",
      question: "Do you notice energy changes related to your menstrual cycle or hormonal fluctuations?",
      options: [
        { text: "No correlation", score: 100 },
        { text: "Slight correlation", score: 65 },
        { text: "Strong correlation", score: 35 },
        { text: "Extreme energy swings with hormones", score: 10 }
      ]
    },
    {
      id: "sustained-activity",
      category: "Endurance",
      question: "Can you sustain physical or mental activity as well as before menopause?",
      options: [
        { text: "Yes - Same endurance", score: 100 },
        { text: "Slightly reduced", score: 65 },
        { text: "Noticeably reduced", score: 35 },
        { text: "Significantly reduced", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Stable energy through transition" },
    good: { min: 60, max: 84, description: "Mild energy fluctuations" },
    fair: { min: 35, max: 59, description: "Moderate energy challenges" },
    poor: { min: 0, max: 34, description: "Severe energy instability - support needed" }
  }
};

const moodChanges: AssessmentConfig = {
  id: "mood-changes",
  name: "Menopause Mood Assessment",
  description: "Evaluating emotional changes during hormonal transition",
  pillar: "balance",
  questions: [
    {
      id: "mood-swings",
      category: "Mood Swings",
      question: "How often do you experience sudden mood swings?",
      options: [
        { text: "Rarely", score: 100 },
        { text: "Sometimes", score: 65 },
        { text: "Often", score: 35 },
        { text: "Very frequently - Daily", score: 10 }
      ]
    },
    {
      id: "irritability-menopause",
      category: "Irritability",
      question: "How much more irritable do you feel compared to before menopause?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slightly more irritable", score: 65 },
        { text: "Moderately more irritable", score: 35 },
        { text: "Significantly more irritable", score: 10 }
      ]
    },
    {
      id: "emotional-sensitivity",
      category: "Sensitivity",
      question: "Do you feel more emotionally sensitive or tearful?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slightly more sensitive", score: 65 },
        { text: "Noticeably more sensitive", score: 35 },
        { text: "Very emotionally fragile", score: 10 }
      ]
    },
    {
      id: "low-mood",
      category: "Depression",
      question: "How often do you experience low mood or feelings of sadness?",
      options: [
        { text: "Rarely", score: 100 },
        { text: "Sometimes", score: 65 },
        { text: "Often", score: 35 },
        { text: "Most of the time", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Stable mood through transition" },
    good: { min: 60, max: 84, description: "Mild mood changes - manageable" },
    fair: { min: 35, max: 59, description: "Moderate mood disruption" },
    poor: { min: 0, max: 34, description: "Significant mood challenges - support recommended" }
  }
};

const hormoneSymptoms: AssessmentConfig = {
  id: "hormone-symptoms",
  name: "Comprehensive Hormone Symptom Assessment",
  description: "Overall menopause symptom evaluation based on Menopause Rating Scale",
  pillar: "balance",
  questions: [
    {
      id: "overall-symptom-burden",
      category: "Overall",
      question: "How would you rate the overall burden of your menopause symptoms?",
      options: [
        { text: "Minimal - Life is normal", score: 100 },
        { text: "Mild - Occasional discomfort", score: 70 },
        { text: "Moderate - Regular interference", score: 40 },
        { text: "Severe - Significantly affects quality of life", score: 10 }
      ]
    },
    {
      id: "sleep-menopause",
      category: "Sleep",
      question: "How much do menopause symptoms affect your sleep?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Slightly - Occasional disruption", score: 70 },
        { text: "Moderately - Frequent disruption", score: 40 },
        { text: "Severely - Chronic sleep problems", score: 10 }
      ]
    },
    {
      id: "joint-pain",
      category: "Physical",
      question: "Do you experience joint or muscle pain related to menopause?",
      options: [
        { text: "No pain", score: 100 },
        { text: "Mild pain", score: 70 },
        { text: "Moderate pain", score: 40 },
        { text: "Severe pain", score: 10 }
      ]
    },
    {
      id: "vaginal-symptoms",
      category: "Urogenital",
      question: "Do you experience vaginal dryness or urinary symptoms?",
      options: [
        { text: "No symptoms", score: 100 },
        { text: "Mild symptoms", score: 70 },
        { text: "Moderate symptoms", score: 40 },
        { text: "Severe symptoms", score: 10 }
      ]
    },
    {
      id: "cognitive-menopause",
      category: "Cognitive",
      question: "How much do cognitive symptoms (memory, concentration) affect you?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Slightly", score: 70 },
        { text: "Moderately", score: 40 },
        { text: "Severely", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal symptom burden" },
    good: { min: 60, max: 84, description: "Mild symptoms - manageable" },
    fair: { min: 35, max: 59, description: "Moderate symptoms - treatment may help" },
    poor: { min: 0, max: 34, description: "Severe symptoms - medical intervention recommended" }
  }
};

const skinChanges: AssessmentConfig = {
  id: "skin-changes",
  name: "Menopause Skin Changes",
  description: "Assessing skin changes during hormonal transition",
  pillar: "beauty",
  questions: [
    {
      id: "skin-dryness",
      category: "Hydration",
      question: "Have you noticed increased skin dryness since entering menopause?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slightly drier", score: 70 },
        { text: "Noticeably drier", score: 40 },
        { text: "Extremely dry and uncomfortable", score: 10 }
      ]
    },
    {
      id: "skin-thinning",
      category: "Thickness",
      question: "Has your skin become thinner or more fragile?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slightly thinner", score: 70 },
        { text: "Noticeably thinner", score: 40 },
        { text: "Significantly thinner - Bruises easily", score: 10 }
      ]
    },
    {
      id: "wrinkle-acceleration",
      category: "Aging",
      question: "Have wrinkles appeared or deepened more rapidly since menopause?",
      options: [
        { text: "No acceleration", score: 100 },
        { text: "Slight acceleration", score: 70 },
        { text: "Noticeable acceleration", score: 40 },
        { text: "Rapid acceleration - Dramatic change", score: 10 }
      ]
    },
    {
      id: "skin-sensitivity-menopause",
      category: "Sensitivity",
      question: "Has your skin become more sensitive or reactive?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slightly more sensitive", score: 70 },
        { text: "Noticeably more sensitive", score: 40 },
        { text: "Very sensitive - Reacts to everything", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal skin changes" },
    good: { min: 60, max: 84, description: "Mild skin changes - manageable with care" },
    fair: { min: 35, max: 59, description: "Moderate skin changes - targeted treatment needed" },
    poor: { min: 0, max: 34, description: "Significant skin changes - comprehensive skincare plan recommended" }
  }
};

const collagenLoss: AssessmentConfig = {
  id: "collagen-loss",
  name: "Collagen & Elasticity Assessment",
  description: "Evaluating structural skin changes during menopause",
  pillar: "beauty",
  questions: [
    {
      id: "facial-sagging",
      category: "Facial Contours",
      question: "Have you noticed sagging or loss of definition in your facial contours?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slight changes", score: 70 },
        { text: "Noticeable sagging", score: 40 },
        { text: "Significant sagging", score: 10 }
      ]
    },
    {
      id: "neck-decollete",
      category: "Neck & Chest",
      question: "How has the skin on your neck and décolletage changed?",
      options: [
        { text: "No change - Still firm", score: 100 },
        { text: "Slight loosening", score: 70 },
        { text: "Noticeable crepiness or lines", score: 40 },
        { text: "Significant crepiness and sagging", score: 10 }
      ]
    },
    {
      id: "hand-skin",
      category: "Hands",
      question: "Have your hands become more veiny or thin-skinned?",
      options: [
        { text: "No change", score: 100 },
        { text: "Slight changes", score: 70 },
        { text: "Noticeable changes", score: 40 },
        { text: "Dramatic changes - Very aged appearance", score: 10 }
      ]
    },
    {
      id: "skin-bounce",
      category: "Elasticity",
      question: "When you pinch your skin, how quickly does it bounce back?",
      options: [
        { text: "Immediately - Excellent elasticity", score: 100 },
        { text: "Quickly - Good elasticity", score: 70 },
        { text: "Slowly - Poor elasticity", score: 40 },
        { text: "Very slowly - Skin stays tented", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Well-maintained collagen and elasticity" },
    good: { min: 60, max: 84, description: "Age-appropriate with minor changes" },
    fair: { min: 35, max: 59, description: "Moderate collagen loss - intervention beneficial" },
    poor: { min: 0, max: 34, description: "Significant collagen loss - comprehensive treatment recommended" }
  }
};

const agingAcceleration: AssessmentConfig = {
  id: "aging-acceleration",
  name: "Aging Acceleration Assessment",
  description: "Tracking visible aging changes during menopause transition",
  pillar: "beauty",
  questions: [
    {
      id: "perceived-age",
      category: "Overall Appearance",
      question: "Do you feel you look older than before menopause started?",
      options: [
        { text: "No - I look the same", score: 100 },
        { text: "Slightly older", score: 70 },
        { text: "Noticeably older", score: 40 },
        { text: "Significantly older - Dramatic change", score: 10 }
      ]
    },
    {
      id: "facial-volume-menopause",
      category: "Facial Volume",
      question: "Have you lost facial volume (hollowing in cheeks, temples, under eyes)?",
      options: [
        { text: "No loss", score: 100 },
        { text: "Slight loss", score: 70 },
        { text: "Moderate loss", score: 40 },
        { text: "Significant loss - Gaunt appearance", score: 10 }
      ]
    },
    {
      id: "overall-vitality",
      category: "Vitality",
      question: "How would you rate your overall appearance of vitality and health?",
      options: [
        { text: "Vibrant and healthy", score: 100 },
        { text: "Generally healthy", score: 70 },
        { text: "Somewhat tired or worn", score: 40 },
        { text: "Tired and aged appearance", score: 10 }
      ]
    },
    {
      id: "rapid-change",
      category: "Rate of Change",
      question: "How rapidly have these aging changes occurred?",
      options: [
        { text: "No rapid changes", score: 100 },
        { text: "Gradual changes over years", score: 70 },
        { text: "Noticeable changes in months", score: 40 },
        { text: "Dramatic changes in short time", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal aging acceleration" },
    good: { min: 60, max: 84, description: "Normal aging pace" },
    fair: { min: 35, max: 59, description: "Accelerated aging - intervention recommended" },
    poor: { min: 0, max: 34, description: "Rapid aging - comprehensive anti-aging protocol needed" }
  }
};

const sleepDisruption: AssessmentConfig = {
  id: "sleep-disruption",
  name: "Menopause Sleep Disruption",
  description: "Assessing sleep problems related to hormonal changes",
  pillar: "brain",
  questions: [
    {
      id: "night-waking-frequency",
      category: "Night Waking",
      question: "How often do you wake up during the night due to menopause symptoms?",
      options: [
        { text: "Rarely - I sleep through", score: 100 },
        { text: "1-2 times per week", score: 65 },
        { text: "3-5 times per week", score: 35 },
        { text: "Every night, multiple times", score: 10 }
      ]
    },
    {
      id: "hot-flush-sleep",
      category: "Hot Flushes",
      question: "Do hot flushes or night sweats wake you from sleep?",
      options: [
        { text: "Never", score: 100 },
        { text: "Occasionally", score: 65 },
        { text: "Frequently", score: 35 },
        { text: "Nightly", score: 10 }
      ]
    },
    {
      id: "sleep-quality-menopause",
      category: "Quality",
      question: "How restorative is your sleep during this transition?",
      options: [
        { text: "Very restorative - Wake refreshed", score: 100 },
        { text: "Somewhat restorative", score: 65 },
        { text: "Not very restorative", score: 35 },
        { text: "Not restorative at all - Wake exhausted", score: 10 }
      ]
    },
    {
      id: "daytime-impact-sleep",
      category: "Daytime Function",
      question: "How much does poor sleep affect your daytime functioning?",
      options: [
        { text: "Not at all", score: 100 },
        { text: "Slightly - Minor fatigue", score: 65 },
        { text: "Moderately - Significant fatigue", score: 35 },
        { text: "Severely - Can barely function", score: 10 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Minimal sleep disruption" },
    good: { min: 60, max: 84, description: "Mild sleep issues - manageable" },
    fair: { min: 35, max: 59, description: "Moderate sleep disruption - intervention needed" },
    poor: { min: 0, max: 34, description: "Severe sleep problems - medical evaluation recommended" }
  }
};

// PERFORMANCE-SPECIFIC ASSESSMENTS

const cognitivePeak: AssessmentConfig = {
  id: "cognitive-peak",
  name: "Cognitive Peak Performance",
  description: "Assessing executive function and mental performance optimization",
  pillar: "brain",
  questions: [
    {
      id: "peak-focus-duration",
      category: "Focus",
      question: "What is your maximum sustained focus period for complex work?",
      options: [
        { text: "4+ hours of deep work", score: 100 },
        { text: "2-4 hours", score: 75 },
        { text: "1-2 hours", score: 50 },
        { text: "Less than 1 hour", score: 25 }
      ]
    },
    {
      id: "cognitive-flexibility",
      category: "Mental Agility",
      question: "How quickly can you switch between different complex tasks?",
      options: [
        { text: "Instantly - No mental lag", score: 100 },
        { text: "Quickly - Minor adjustment needed", score: 75 },
        { text: "Moderately - Takes effort to switch", score: 50 },
        { text: "Slowly - Significant difficulty switching", score: 25 }
      ]
    },
    {
      id: "problem-solving-speed",
      category: "Problem Solving",
      question: "How efficiently do you solve complex, novel problems?",
      options: [
        { text: "Very efficiently - Quick insights", score: 100 },
        { text: "Efficiently - Normal pace", score: 75 },
        { text: "Slowly - Takes considerable time", score: 50 },
        { text: "Very slowly - Struggle with complexity", score: 25 }
      ]
    },
    {
      id: "learning-speed",
      category: "Learning",
      question: "How quickly do you master new complex skills or information?",
      options: [
        { text: "Very quickly - Rapid mastery", score: 100 },
        { text: "Quickly - Above average", score: 75 },
        { text: "Average pace", score: 50 },
        { text: "Slowly - Below average", score: 25 }
      ]
    },
    {
      id: "mental-stamina",
      category: "Stamina",
      question: "How well do you maintain peak cognitive performance throughout the day?",
      options: [
        { text: "Excellent - Consistent all day", score: 100 },
        { text: "Good - Minor afternoon dip", score: 75 },
        { text: "Fair - Significant decline", score: 50 },
        { text: "Poor - Early fatigue", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Peak cognitive performance - elite level" },
    good: { min: 70, max: 84, description: "Strong performance - high achiever level" },
    fair: { min: 50, max: 69, description: "Moderate performance - optimization potential" },
    poor: { min: 0, max: 49, description: "Suboptimal performance - significant enhancement possible" }
  }
};

const mentalResilience: AssessmentConfig = {
  id: "mental-resilience",
  name: "Mental Resilience Assessment",
  description: "Evaluating stress response and psychological hardiness",
  pillar: "brain",
  questions: [
    {
      id: "pressure-performance",
      category: "Under Pressure",
      question: "How well do you perform under high-pressure situations?",
      options: [
        { text: "Thrive - Pressure enhances performance", score: 100 },
        { text: "Perform well - Handle pressure effectively", score: 75 },
        { text: "Adequate - Pressure impacts performance", score: 50 },
        { text: "Struggle - Pressure significantly impairs performance", score: 25 }
      ]
    },
    {
      id: "setback-recovery",
      category: "Recovery",
      question: "How quickly do you bounce back from setbacks or failures?",
      options: [
        { text: "Very quickly - Within hours", score: 100 },
        { text: "Quickly - Within a day", score: 75 },
        { text: "Slowly - Takes several days", score: 50 },
        { text: "Very slowly - Takes weeks", score: 25 }
      ]
    },
    {
      id: "stress-adaptation",
      category: "Adaptation",
      question: "How well do you adapt to unexpected changes or challenges?",
      options: [
        { text: "Excellent - Adapt instantly", score: 100 },
        { text: "Good - Adapt fairly quickly", score: 75 },
        { text: "Fair - Takes time to adapt", score: 50 },
        { text: "Poor - Struggle to adapt", score: 25 }
      ]
    },
    {
      id: "emotional-regulation-stress",
      category: "Emotional Control",
      question: "How well can you maintain emotional control under stress?",
      options: [
        { text: "Excellent - Always composed", score: 100 },
        { text: "Good - Usually composed", score: 75 },
        { text: "Fair - Sometimes lose composure", score: 50 },
        { text: "Poor - Frequently lose composure", score: 25 }
      ]
    },
    {
      id: "perseverance",
      category: "Perseverance",
      question: "How persistent are you when facing difficult, long-term challenges?",
      options: [
        { text: "Highly persistent - Never give up", score: 100 },
        { text: "Persistent - Stay committed", score: 75 },
        { text: "Moderately persistent - Sometimes give up", score: 50 },
        { text: "Low persistence - Often give up", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Exceptional mental resilience" },
    good: { min: 70, max: 84, description: "Strong resilience - handle most challenges well" },
    fair: { min: 50, max: 69, description: "Moderate resilience - improvement opportunities" },
    poor: { min: 0, max: 49, description: "Low resilience - resilience training highly beneficial" }
  }
};

const focusOptimization: AssessmentConfig = {
  id: "focus-optimization",
  name: "Focus Optimization Assessment",
  description: "Assessing attention control and concentration capacity",
  pillar: "brain",
  questions: [
    {
      id: "distraction-resistance",
      category: "Distraction Control",
      question: "How resistant are you to distractions in your environment?",
      options: [
        { text: "Highly resistant - Rarely distracted", score: 100 },
        { text: "Resistant - Occasionally distracted", score: 75 },
        { text: "Somewhat resistant - Often distracted", score: 50 },
        { text: "Low resistance - Constantly distracted", score: 25 }
      ]
    },
    {
      id: "attention-switching-control",
      category: "Attention Control",
      question: "Can you voluntarily control where your attention goes?",
      options: [
        { text: "Complete control - Direct attention at will", score: 100 },
        { text: "Good control - Usually can direct attention", score: 75 },
        { text: "Fair control - Sometimes attention wanders", score: 50 },
        { text: "Poor control - Attention constantly wanders", score: 25 }
      ]
    },
    {
      id: "flow-state-frequency",
      category: "Flow States",
      question: "How often do you achieve 'flow' states (deep immersion in work)?",
      options: [
        { text: "Daily or multiple times per day", score: 100 },
        { text: "Several times per week", score: 75 },
        { text: "Occasionally - Once a week or less", score: 50 },
        { text: "Rarely or never", score: 25 }
      ]
    },
    {
      id: "multitasking-resistance",
      category: "Single-tasking",
      question: "How well can you resist the urge to multitask?",
      options: [
        { text: "Excellent - Single-task by default", score: 100 },
        { text: "Good - Usually single-task", score: 75 },
        { text: "Fair - Often multitask", score: 50 },
        { text: "Poor - Constantly multitasking", score: 25 }
      ]
    },
    {
      id: "deep-work-capacity",
      category: "Deep Work",
      question: "What percentage of your work time is spent in deep, focused work?",
      options: [
        { text: "Over 60%", score: 100 },
        { text: "40-60%", score: 75 },
        { text: "20-40%", score: 50 },
        { text: "Less than 20%", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Exceptional focus and attention control" },
    good: { min: 70, max: 84, description: "Strong focus abilities" },
    fair: { min: 50, max: 69, description: "Moderate focus - significant optimization potential" },
    poor: { min: 0, max: 49, description: "Focus challenges - training highly beneficial" }
  }
};

const energyOptimization: AssessmentConfig = {
  id: "energy-optimization",
  name: "Energy Optimization Assessment",
  description: "Assessing metabolic efficiency and sustained energy for performance",
  pillar: "body",
  questions: [
    {
      id: "morning-peak-performance",
      category: "Morning Energy",
      question: "How quickly do you reach peak performance after waking?",
      options: [
        { text: "Immediately - Peak performance within 30 min", score: 100 },
        { text: "Quickly - Peak within 1 hour", score: 75 },
        { text: "Slowly - Takes 2-3 hours", score: 50 },
        { text: "Very slowly - Takes half the day", score: 25 }
      ]
    },
    {
      id: "energy-consistency",
      category: "Consistency",
      question: "How consistent is your energy throughout the day?",
      options: [
        { text: "Very consistent - Flat, sustained energy", score: 100 },
        { text: "Mostly consistent - Minor variations", score: 75 },
        { text: "Somewhat inconsistent - Noticeable peaks and valleys", score: 50 },
        { text: "Very inconsistent - Extreme energy swings", score: 25 }
      ]
    },
    {
      id: "workout-recovery",
      category: "Recovery",
      question: "How quickly do you recover energy after intense physical activity?",
      options: [
        { text: "Very quickly - Within 1-2 hours", score: 100 },
        { text: "Quickly - Same day recovery", score: 75 },
        { text: "Slowly - Need full day", score: 50 },
        { text: "Very slowly - Multiple days", score: 25 }
      ]
    },
    {
      id: "mental-physical-energy",
      category: "Energy Balance",
      question: "Is your mental and physical energy well-balanced?",
      options: [
        { text: "Perfectly balanced - Both high", score: 100 },
        { text: "Well balanced - Both good", score: 75 },
        { text: "Imbalanced - One higher than other", score: 50 },
        { text: "Both low or very imbalanced", score: 25 }
      ]
    },
    {
      id: "performance-endurance",
      category: "Endurance",
      question: "How long can you maintain peak performance?",
      options: [
        { text: "8+ hours of peak performance", score: 100 },
        { text: "6-8 hours", score: 75 },
        { text: "4-6 hours", score: 50 },
        { text: "Less than 4 hours", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Optimal energy systems - peak performance state" },
    good: { min: 70, max: 84, description: "Good energy - minor optimization possible" },
    fair: { min: 50, max: 69, description: "Moderate energy - significant optimization potential" },
    poor: { min: 0, max: 49, description: "Suboptimal energy - metabolic optimization needed" }
  }
};

const hormoneOptimization: AssessmentConfig = {
  id: "hormone-optimization",
  name: "Hormone Optimization Assessment",
  description: "Evaluating hormonal balance indicators for peak performance",
  pillar: "body",
  questions: [
    {
      id: "libido-drive",
      category: "Sex Hormones",
      question: "How would you rate your libido and sexual drive?",
      options: [
        { text: "Excellent - Strong, healthy libido", score: 100 },
        { text: "Good - Normal libido", score: 75 },
        { text: "Low - Noticeably decreased", score: 50 },
        { text: "Very low or absent", score: 25 }
      ]
    },
    {
      id: "muscle-building-capacity",
      category: "Anabolic Hormones",
      question: "How easily do you build or maintain muscle mass?",
      options: [
        { text: "Very easily - Rapid gains", score: 100 },
        { text: "Fairly easily - Steady progress", score: 75 },
        { text: "With difficulty - Slow progress", score: 50 },
        { text: "Very difficult - No progress or loss", score: 25 }
      ]
    },
    {
      id: "body-composition",
      category: "Metabolic Hormones",
      question: "How easily do you maintain optimal body composition?",
      options: [
        { text: "Very easily - Lean year-round", score: 100 },
        { text: "Fairly easily - Minor fluctuations", score: 75 },
        { text: "With difficulty - Constant battle", score: 50 },
        { text: "Very difficult - Gaining unwanted fat", score: 25 }
      ]
    },
    {
      id: "mood-stability-hormones",
      category: "Mood Hormones",
      question: "How stable is your mood and motivation?",
      options: [
        { text: "Very stable - Consistently positive and driven", score: 100 },
        { text: "Stable - Generally good", score: 75 },
        { text: "Somewhat unstable - Noticeable fluctuations", score: 50 },
        { text: "Unstable - Significant mood swings", score: 25 }
      ]
    },
    {
      id: "stress-response-hormones",
      category: "Stress Hormones",
      question: "How well do you handle stress without feeling burnt out?",
      options: [
        { text: "Excellent - Stress doesn't affect me", score: 100 },
        { text: "Good - Handle stress well", score: 75 },
        { text: "Fair - Stress wears me down", score: 50 },
        { text: "Poor - Chronically stressed/burnt out", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Optimal hormonal balance" },
    good: { min: 70, max: 84, description: "Good hormonal health - minor optimization possible" },
    fair: { min: 50, max: 69, description: "Hormonal imbalance indicators - optimization beneficial" },
    poor: { min: 0, max: 49, description: "Significant hormonal imbalance - testing and intervention recommended" }
  }
};

const cellularVitality: AssessmentConfig = {
  id: "cellular-vitality",
  name: "Cellular Vitality Assessment",
  description: "Assessing cellular health and biological aging markers",
  pillar: "beauty",
  questions: [
    {
      id: "recovery-speed-cellular",
      category: "Recovery",
      question: "How quickly does your body recover from physical stress (workouts, injuries)?",
      options: [
        { text: "Very quickly - Within 24 hours", score: 100 },
        { text: "Quickly - 1-2 days", score: 75 },
        { text: "Slowly - 3-5 days", score: 50 },
        { text: "Very slowly - Week or more", score: 25 }
      ]
    },
    {
      id: "inflammation-markers",
      category: "Inflammation",
      question: "Do you experience signs of chronic inflammation (joint pain, puffiness, skin issues)?",
      options: [
        { text: "No signs - Feel great", score: 100 },
        { text: "Minimal signs - Rare occurrence", score: 75 },
        { text: "Moderate signs - Regular occurrence", score: 50 },
        { text: "Significant signs - Daily issues", score: 25 }
      ]
    },
    {
      id: "cellular-energy",
      category: "Mitochondrial Function",
      question: "How would you describe your baseline energy and vitality?",
      options: [
        { text: "Exceptional - Feel vibrant and alive", score: 100 },
        { text: "Good - Generally energetic", score: 75 },
        { text: "Fair - Often tired", score: 50 },
        { text: "Poor - Chronically fatigued", score: 25 }
      ]
    },
    {
      id: "biological-age-perception",
      category: "Biological Age",
      question: "Do you feel younger or older than your chronological age?",
      options: [
        { text: "Much younger - 5+ years", score: 100 },
        { text: "Somewhat younger - 1-5 years", score: 75 },
        { text: "Same age", score: 50 },
        { text: "Older than my age", score: 25 }
      ]
    },
    {
      id: "cellular-resilience",
      category: "Resilience",
      question: "How resilient do you feel to environmental stressors (pollution, UV, stress)?",
      options: [
        { text: "Very resilient - Minimal impact", score: 100 },
        { text: "Resilient - Handle well", score: 75 },
        { text: "Somewhat resilient - Noticeable impact", score: 50 },
        { text: "Low resilience - Significant impact", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Exceptional cellular health - slow biological aging" },
    good: { min: 70, max: 84, description: "Good cellular health - healthy aging" },
    fair: { min: 50, max: 69, description: "Moderate cellular stress - optimization beneficial" },
    poor: { min: 0, max: 49, description: "Significant cellular stress - comprehensive longevity protocol needed" }
  }
};

const skinPerformance: AssessmentConfig = {
  id: "skin-performance",
  name: "Skin Performance Assessment",
  description: "Evaluating skin barrier function and protective capacity",
  pillar: "beauty",
  questions: [
    {
      id: "barrier-integrity",
      category: "Barrier Function",
      question: "How well does your skin tolerate environmental stressors (weather, products)?",
      options: [
        { text: "Excellent tolerance - Never reactive", score: 100 },
        { text: "Good tolerance - Rarely reactive", score: 75 },
        { text: "Fair tolerance - Sometimes reactive", score: 50 },
        { text: "Poor tolerance - Frequently reactive", score: 25 }
      ]
    },
    {
      id: "healing-capacity",
      category: "Healing",
      question: "How quickly do minor skin injuries (cuts, blemishes) heal?",
      options: [
        { text: "Very quickly - Days", score: 100 },
        { text: "Quickly - About a week", score: 75 },
        { text: "Slowly - 1-2 weeks", score: 50 },
        { text: "Very slowly - Weeks or longer", score: 25 }
      ]
    },
    {
      id: "moisture-retention",
      category: "Hydration",
      question: "How well does your skin retain moisture throughout the day?",
      options: [
        { text: "Excellent - Stays hydrated", score: 100 },
        { text: "Good - Slight dryness by evening", score: 75 },
        { text: "Fair - Becomes dry midday", score: 50 },
        { text: "Poor - Dry immediately", score: 25 }
      ]
    },
    {
      id: "sun-damage-resistance",
      category: "UV Protection",
      question: "How resistant is your skin to sun damage (beyond sunscreen)?",
      options: [
        { text: "High resistance - Rarely burns, minimal damage", score: 100 },
        { text: "Good resistance - Occasional sensitivity", score: 75 },
        { text: "Low resistance - Burns easily", score: 50 },
        { text: "Very low resistance - Extreme sensitivity", score: 25 }
      ]
    },
    {
      id: "antioxidant-status",
      category: "Antioxidant Defense",
      question: "How vibrant and protected does your skin appear?",
      options: [
        { text: "Very vibrant - Glowing, protected", score: 100 },
        { text: "Vibrant - Generally healthy", score: 75 },
        { text: "Dull - Lacks protection", score: 50 },
        { text: "Very dull - Appears stressed", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Optimal skin performance and protection" },
    good: { min: 70, max: 84, description: "Good skin function - minor optimization possible" },
    fair: { min: 50, max: 69, description: "Compromised skin barrier - targeted support needed" },
    poor: { min: 0, max: 49, description: "Significant barrier dysfunction - comprehensive skin protocol needed" }
  }
};

const recoveryAppearance: AssessmentConfig = {
  id: "recovery-appearance",
  name: "Recovery & Appearance Assessment",
  description: "Tracking visible recovery and vitality markers",
  pillar: "beauty",
  questions: [
    {
      id: "under-eye-appearance",
      category: "Eye Area",
      question: "How do the areas under your eyes look?",
      options: [
        { text: "Bright and smooth - No dark circles", score: 100 },
        { text: "Generally good - Minimal darkness", score: 75 },
        { text: "Noticeable dark circles or puffiness", score: 50 },
        { text: "Significant dark circles, bags, or hollowing", score: 25 }
      ]
    },
    {
      id: "facial-puffiness",
      category: "Inflammation",
      question: "How much facial puffiness or inflammation do you experience?",
      options: [
        { text: "None - Defined facial contours", score: 100 },
        { text: "Minimal - Slight morning puffiness", score: 75 },
        { text: "Moderate - Regular puffiness", score: 50 },
        { text: "Significant - Chronic puffiness", score: 25 }
      ]
    },
    {
      id: "complexion-clarity",
      category: "Clarity",
      question: "How clear and even is your complexion?",
      options: [
        { text: "Very clear - Even tone, no blemishes", score: 100 },
        { text: "Clear - Minor imperfections", score: 75 },
        { text: "Somewhat clear - Noticeable issues", score: 50 },
        { text: "Not clear - Significant concerns", score: 25 }
      ]
    },
    {
      id: "overnight-recovery-appearance",
      category: "Recovery",
      question: "How refreshed does your face look after a night's sleep?",
      options: [
        { text: "Very refreshed - Rested appearance", score: 100 },
        { text: "Refreshed - Look well-rested", score: 75 },
        { text: "Somewhat refreshed - Still look tired", score: 50 },
        { text: "Not refreshed - Look exhausted", score: 25 }
      ]
    },
    {
      id: "vital-appearance",
      category: "Vitality",
      question: "Overall, how vital and alive do you appear?",
      options: [
        { text: "Very vital - Radiant and energized", score: 100 },
        { text: "Vital - Healthy appearance", score: 75 },
        { text: "Somewhat vital - Average appearance", score: 50 },
        { text: "Not vital - Fatigued appearance", score: 25 }
      ]
    }
  ],
  scoringGuidance: {
    excellent: { min: 85, max: 100, description: "Excellent recovery - vibrant appearance" },
    good: { min: 70, max: 84, description: "Good recovery - healthy appearance" },
    fair: { min: 50, max: 69, description: "Suboptimal recovery - improvement needed" },
    poor: { min: 0, max: 49, description: "Poor recovery - comprehensive protocol needed" }
  }
};

// Export all assessments as a map
export const assessmentConfigs: Record<string, AssessmentConfig> = {
  "cognitive-function": cognitiveFunction,
  "brain-fog": brainFog,
  "sleep": sleepQuality,
  "energy-levels": energyLevels,
  "physical-performance": physicalPerformance,
  "pain-assessment": painAssessment,
  "stress-assessment": stressAssessment,
  "mood-tracking": moodTracking,
  "anxiety-assessment": anxietyAssessment,
  "skin-health": skinHealth,
  "hair-vitality": hairVitality,
  "aging-concerns": agingConcerns,
  "hot-flushes": hotFlushes,
  "memory-changes": memoryChanges,
  "weight-changes": weightChanges,
  "muscle-maintenance": muscleMaintenance,
  "energy-fluctuations": energyFluctuations,
  "mood-changes": moodChanges,
  "hormone-symptoms": hormoneSymptoms,
  "skin-changes": skinChanges,
  "collagen-loss": collagenLoss,
  "aging-acceleration": agingAcceleration,
  "sleep-disruption": sleepDisruption,
  "cognitive-peak": cognitivePeak,
  "mental-resilience": mentalResilience,
  "focus-optimization": focusOptimization,
  "energy-optimization": energyOptimization,
  "hormone-optimization": hormoneOptimization,
  "cellular-vitality": cellularVitality,
  "skin-performance": skinPerformance,
  "recovery-appearance": recoveryAppearance
};
