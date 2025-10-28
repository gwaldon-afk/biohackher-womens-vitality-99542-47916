interface EvidenceContext {
  query: {
    related_pillars?: string[];
    related_toolkit_items?: string[];
    related_symptoms?: string[];
    custom_tags?: string[];
    is_women_specific?: boolean;
  };
  title: string;
  summary: string;
}

export const evidenceMap: Record<string, EvidenceContext> = {
  // Assessment Evidence
  'assessment:smoking-cessation': {
    query: { 
      related_pillars: ['body', 'brain'],
      related_symptoms: ['cardiovascular_risk', 'cognitive_decline']
    },
    title: 'Smoking Cessation Timeline',
    summary: 'Research shows cardiovascular benefits begin within 20 minutes of quitting, with major improvements occurring within the first year. Long-term cessation significantly reduces risk of heart disease, stroke, and cognitive decline.'
  },
  
  // Biohacking Toolkit
  'toolkit:cold-therapy': {
    query: { related_toolkit_items: ['cold-therapy', 'cold-exposure'] },
    title: 'Cold Therapy Benefits',
    summary: 'Cold exposure activates brown adipose tissue, improves metabolic health, and may enhance immune function through hormetic stress responses.'
  },
  
  'toolkit:intermittent-fasting': {
    query: { related_toolkit_items: ['intermittent-fasting', 'time-restricted-eating'] },
    title: 'Intermittent Fasting',
    summary: 'Time-restricted eating protocols show benefits for metabolic health, autophagy activation, and may support longevity through cellular repair mechanisms.'
  },
  
  'toolkit:strength-training': {
    query: { related_toolkit_items: ['strength-training', 'resistance-exercise'] },
    title: 'Strength Training for Longevity',
    summary: 'Resistance training preserves muscle mass, bone density, and metabolic health - all critical factors for healthy aging and longevity, especially for women.'
  },
  
  'toolkit:hiit': {
    query: { related_toolkit_items: ['hiit', 'high-intensity-interval-training'] },
    title: 'HIIT Training Benefits',
    summary: 'High-intensity interval training improves cardiovascular fitness, mitochondrial function, and metabolic health with time-efficient workouts.'
  },
  
  'toolkit:yoga': {
    query: { related_toolkit_items: ['yoga', 'mind-body'] },
    title: 'Yoga for Health & Longevity',
    summary: 'Yoga combines movement, breathwork, and mindfulness to reduce stress, improve flexibility, balance, and support healthy aging.'
  },
  
  'toolkit:meditation': {
    query: { related_pillars: ['brain', 'balance'] },
    title: 'Meditation & Brain Health',
    summary: 'Regular meditation practice is associated with reduced stress, improved focus, and may support brain structure and cognitive function as we age.'
  },
  
  'toolkit:sleep-optimization': {
    query: { related_pillars: ['brain', 'body'] },
    title: 'Sleep Optimization',
    summary: 'Quality sleep is foundational for longevity, supporting memory consolidation, cellular repair, immune function, and metabolic health.'
  },
  
  'toolkit:breathwork': {
    query: { related_pillars: ['balance', 'brain'] },
    title: 'Breathwork Techniques',
    summary: 'Controlled breathing practices can modulate the nervous system, reduce stress, improve HRV, and support overall wellbeing.'
  },
  
  'toolkit:sauna': {
    query: { related_toolkit_items: ['sauna', 'heat-therapy'] },
    title: 'Sauna & Heat Therapy',
    summary: 'Regular sauna use is associated with reduced cardiovascular risk, improved longevity, and activation of heat shock proteins that support cellular health.'
  },
  
  // Foods
  'food:blueberries': {
    query: { 
      related_symptoms: ['cognitive_decline'],
      custom_tags: ['berries', 'antioxidants']
    },
    title: 'Blueberries & Cognitive Health',
    summary: 'Anthocyanins in blueberries have been shown to support cognitive function and may slow age-related cognitive decline through anti-inflammatory and antioxidant mechanisms.'
  },
  
  'food:strawberries': {
    query: { 
      related_pillars: ['body'],
      custom_tags: ['berries', 'cardiovascular']
    },
    title: 'Strawberries & Heart Health',
    summary: 'Regular strawberry consumption is associated with reduced cardiovascular risk, particularly in women. Studies show 3+ servings per week can reduce heart attack risk by up to 32%.'
  },
  
  'food:spinach': {
    query: { 
      related_pillars: ['brain', 'body'],
      custom_tags: ['leafy-greens', 'nitrates']
    },
    title: 'Spinach & Longevity',
    summary: 'Dark leafy greens like spinach are rich in nitrates, folate, and antioxidants. Research shows regular consumption supports cognitive health, bone density, and cardiovascular function.'
  },
  
  'food:dark-leafy-greens': {
    query: { 
      related_pillars: ['body', 'brain'],
      custom_tags: ['vegetables', 'nutrition']
    },
    title: 'Dark Leafy Greens',
    summary: 'Rich in vitamins K, C, folate, and phytonutrients, dark leafy greens are associated with reduced cardiovascular risk and slower cognitive aging.'
  },
  
  'food:salmon': {
    query: { 
      related_pillars: ['brain', 'body'],
      custom_tags: ['omega-3', 'fish']
    },
    title: 'Salmon & Omega-3 Benefits',
    summary: 'Omega-3 fatty acids in salmon support brain health, reduce inflammation, and protect cardiovascular function. Essential for healthy aging.'
  },
  
  'food:nuts': {
    query: { 
      related_pillars: ['body', 'brain'],
      custom_tags: ['nuts', 'healthy-fats']
    },
    title: 'Nuts for Longevity',
    summary: 'Regular nut consumption is associated with reduced mortality risk and improved cardiovascular health. Rich in healthy fats, protein, and micronutrients.'
  },
  
  // Menstrual Health
  'hormone-compass:follicular': {
    query: { 
      is_women_specific: true,
      custom_tags: ['menstrual-cycle', 'follicular-phase']
    },
    title: 'Follicular Phase Optimization',
    summary: 'Research shows the follicular phase is ideal for higher-intensity training and skill acquisition due to rising estrogen levels that support strength, recovery, and neuroplasticity.'
  },
  
  'hormone-compass:luteal': {
    query: { 
      is_women_specific: true,
      custom_tags: ['menstrual-cycle', 'luteal-phase']
    },
    title: 'Luteal Phase Adaptation',
    summary: 'During the luteal phase, progesterone rises and may affect energy, recovery, and thermoregulation. Adapting training intensity can optimize performance and wellbeing.'
  },
  
  'hormone-compass:menopause': {
    query: { 
      is_women_specific: true,
      custom_tags: ['menopause', 'hormone-therapy']
    },
    title: 'Menopause & Health Optimization',
    summary: 'Evidence-based strategies for managing menopausal transition include strength training for bone density, cardiovascular exercise, and individualized approaches to hormone therapy.'
  },
  
  // Goals & Protocols
  'intervention:sleep-optimization': {
    query: { 
      related_pillars: ['brain', 'body'],
      related_symptoms: ['sleep_disruption', 'fatigue']
    },
    title: 'Sleep Optimization',
    summary: 'Quality sleep is foundational for cognitive function, metabolic health, and longevity. Research supports consistent sleep schedules, dark environments, and temperature regulation.'
  },
  
  'intervention:stress-management': {
    query: { 
      related_pillars: ['brain', 'balance'],
      related_symptoms: ['stress', 'anxiety']
    },
    title: 'Stress Management Techniques',
    summary: 'Chronic stress accelerates aging through multiple pathways. Evidence-based techniques include mindfulness, breathwork, and nature exposure to modulate the stress response.'
  },
};

export const getEvidenceContext = (key: string): EvidenceContext | null => {
  return evidenceMap[key] || null;
};
