-- Add more toolkit items to existing categories

-- Get category IDs first for reference
-- Therapies category items
INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'sauna-therapy',
  'Infrared Sauna Therapy',
  'Heat therapy using infrared light to promote detoxification and cardiovascular health',
  'Infrared sauna therapy uses infrared heaters to emit infrared light experienced as radiant heat which is absorbed by the surface of the skin. Regular sauna use has been associated with improved cardiovascular function, enhanced detoxification through sweating, reduced inflammation, and stress relief.',
  '["inflammation", "stress", "muscle-pain", "fatigue", "poor-circulation"]',
  '["body", "balance"]',
  '[{"condition": "pregnancy", "severity": "high"}, {"condition": "cardiovascular disease", "severity": "medium"}, {"condition": "dehydration", "severity": "medium"}]',
  'gold',
  '[{"name": "Standard Session", "duration": "20-30 minutes", "frequency": "3-4x per week", "temperature": "45-60°C"}, {"name": "Gentle Protocol", "duration": "15-20 minutes", "frequency": "2-3x per week", "temperature": "40-50°C"}]',
  '["Improved cardiovascular function", "Enhanced detoxification", "Reduced inflammation", "Muscle relaxation", "Stress relief"]',
  '[{"title": "Cardiovascular and other health benefits of sauna bathing", "authors": "Laukkanen et al.", "year": 2018, "journal": "Mayo Clinic Proceedings", "doi": "10.1016/j.mayocp.2018.04.008"}]',
  4,
  true
FROM toolkit_categories tc WHERE tc.slug = 'therapies';

INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'breathwork',
  'Breathwork & Pranayama',
  'Controlled breathing techniques to reduce stress and improve oxygen efficiency',
  'Breathwork encompasses various breathing techniques including box breathing, alternate nostril breathing, and Wim Hof method. These practices influence the autonomic nervous system, helping to reduce stress, improve focus, enhance immune function, and promote emotional regulation.',
  '["stress", "anxiety", "sleep", "focus", "energy"]',
  '["brain", "balance"]',
  '[{"condition": "severe respiratory issues", "severity": "high"}, {"condition": "recent surgery", "severity": "medium"}]',
  'gold',
  '[{"name": "Box Breathing", "duration": "5-10 minutes", "frequency": "2-3x daily", "steps": "Inhale 4s, hold 4s, exhale 4s, hold 4s"}, {"name": "Wim Hof Method", "duration": "10-15 minutes", "frequency": "Once daily", "steps": "30 deep breaths, retention, recovery breath"}]',
  '["Reduced stress and anxiety", "Improved focus", "Enhanced immune function", "Better sleep quality", "Emotional regulation"]',
  '[{"title": "Breathwork Interventions for Adults with Clinically Diagnosed Anxiety Disorders", "authors": "Hopper et al.", "year": 2019, "journal": "Journal of Evidence-Based Integrative Medicine", "doi": "10.1177/2515690X19890029"}]',
  5,
  true
FROM toolkit_categories tc WHERE tc.slug = 'therapies';

-- Sleep category items
INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'sleep-environment-optimization',
  'Sleep Environment Optimization',
  'Creating an ideal sleep environment for optimal rest and recovery',
  'The sleep environment plays a crucial role in sleep quality. This includes controlling temperature (16-19°C optimal), minimizing light exposure (blackout curtains, red lights), reducing noise (white noise machines), and selecting appropriate bedding materials. Research shows that environmental factors significantly impact both sleep onset and sleep maintenance.',
  '["sleep", "insomnia", "restlessness", "fatigue"]',
  '["body", "brain"]',
  '[]',
  'gold',
  '[{"name": "Temperature Control", "target": "16-19°C", "timing": "1 hour before bed"}, {"name": "Light Blocking", "method": "Blackout curtains + eye mask", "timing": "Evening onwards"}, {"name": "Sound Management", "method": "White noise or earplugs", "timing": "Throughout night"}]',
  '["Faster sleep onset", "Improved sleep duration", "Enhanced sleep quality", "Reduced nighttime awakenings", "Better next-day performance"]',
  '[{"title": "The temperature dependence of sleep", "authors": "Harding et al.", "year": 2019, "journal": "Frontiers in Neuroscience", "doi": "10.3389/fnins.2019.00336"}]',
  4,
  true
FROM toolkit_categories tc WHERE tc.slug = 'sleep';

INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'sleep-timing-chronotherapy',
  'Sleep Timing & Chronotherapy',
  'Aligning sleep schedule with your natural circadian rhythm',
  'Chronotherapy involves adjusting sleep timing to align with your body''s natural circadian rhythm. This includes maintaining consistent sleep-wake times, strategic light exposure, and meal timing. Research shows that circadian alignment is crucial for metabolic health, mental performance, and longevity.',
  '["sleep", "jet-lag", "shift-work", "fatigue", "mood"]',
  '["body", "brain", "balance"]',
  '[]',
  'silver',
  '[{"name": "Consistent Schedule", "bedtime": "Within 30 min same time daily", "wake": "Within 30 min same time daily"}, {"name": "Morning Light", "duration": "10-30 minutes", "timing": "Within 1 hour of waking", "source": "Natural sunlight or 10,000 lux light box"}, {"name": "Evening Wind-Down", "start": "2-3 hours before bed", "activities": "Dim lights, avoid screens, relaxation"}]',
  '["Improved sleep quality", "Enhanced daytime alertness", "Better mood regulation", "Improved metabolic health", "Stronger circadian rhythm"]',
  '[{"title": "Circadian Rhythm Sleep Disorders", "authors": "Abbott et al.", "year": 2020, "journal": "Sleep Medicine Clinics", "doi": "10.1016/j.jsmc.2020.05.002"}]',
  5,
  true
FROM toolkit_categories tc WHERE tc.slug = 'sleep';

-- Nutrition category items
INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'time-restricted-eating',
  'Time-Restricted Eating (Intermittent Fasting)',
  'Limiting daily eating window to promote metabolic health and longevity',
  'Time-restricted eating (TRE) involves consuming all calories within a consistent daily window, typically 8-12 hours. Research shows this eating pattern can improve insulin sensitivity, support cellular autophagy, reduce inflammation, and promote healthy aging. The most sustainable approach is aligning eating windows with circadian rhythms.',
  '["weight-management", "energy", "blood-sugar", "inflammation", "brain-fog"]',
  '["body", "balance", "brain"]',
  '[{"condition": "pregnancy or breastfeeding", "severity": "high"}, {"condition": "history of eating disorders", "severity": "high"}, {"condition": "diabetes on medication", "severity": "medium"}, {"condition": "underweight", "severity": "medium"}]',
  'gold',
  '[{"name": "16:8 Protocol", "eating_window": "8 hours", "fasting_window": "16 hours", "example": "12pm-8pm eating"}, {"name": "14:10 Protocol", "eating_window": "10 hours", "fasting_window": "14 hours", "example": "8am-6pm eating"}, {"name": "Circadian Aligned", "eating_window": "10-12 hours", "timing": "Earlier in day", "example": "7am-5pm or 8am-6pm"}]',
  '["Improved insulin sensitivity", "Enhanced autophagy", "Reduced inflammation", "Weight management", "Improved cognitive function", "Better sleep quality"]',
  '[{"title": "Time-restricted eating to prevent and manage chronic metabolic diseases", "authors": "Wilkinson et al.", "year": 2020, "journal": "Annual Review of Nutrition", "doi": "10.1146/annurev-nutr-082018-124320"}]',
  1,
  true
FROM toolkit_categories tc WHERE tc.slug = 'nutrition';

INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'protein-optimization',
  'Protein Intake Optimization',
  'Strategic protein consumption for muscle maintenance, satiety, and metabolic health',
  'Protein is essential for maintaining muscle mass, especially important as we age. Research shows that distributing protein evenly throughout the day and consuming adequate amounts (1.2-1.6g per kg body weight for adults) supports muscle protein synthesis, metabolic health, and satiety. Leucine-rich sources are particularly effective for triggering muscle building.',
  '["muscle-loss", "fatigue", "weight-management", "recovery", "aging"]',
  '["body", "balance"]',
  '[{"condition": "kidney disease", "severity": "high"}, {"condition": "certain metabolic disorders", "severity": "medium"}]',
  'gold',
  '[{"name": "Daily Target", "amount": "1.2-1.6g per kg body weight", "distribution": "Spread across 3-4 meals"}, {"name": "Per Meal", "amount": "25-40g protein", "timing": "Every 4-5 hours", "leucine_target": "2.5-3g per meal"}, {"name": "Post-Exercise", "amount": "20-40g", "timing": "Within 2 hours", "source": "High-quality complete protein"}]',
  '["Maintained muscle mass", "Improved satiety", "Enhanced recovery", "Better metabolic health", "Reduced age-related muscle loss", "Improved body composition"]',
  '[{"title": "Protein distribution patterns and muscle protein synthesis", "authors": "Mamerow et al.", "year": 2014, "journal": "Journal of Nutrition", "doi": "10.3945/jn.113.185280"}]',
  2,
  true
FROM toolkit_categories tc WHERE tc.slug = 'nutrition';

-- Coaching category items
INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'stress-management-techniques',
  'Evidence-Based Stress Management',
  'Practical techniques to reduce chronic stress and build resilience',
  'Chronic stress impacts health, accelerates aging, and impairs cognitive function. Evidence-based stress management includes techniques like progressive muscle relaxation, mindfulness meditation, cognitive reframing, and time management strategies. Research shows these approaches can reduce cortisol levels, improve immune function, and enhance overall well-being.',
  '["stress", "anxiety", "sleep", "fatigue", "mood", "focus"]',
  '["brain", "balance"]',
  '[]',
  'gold',
  '[{"name": "Progressive Muscle Relaxation", "duration": "10-20 minutes", "frequency": "Daily", "method": "Tense and release muscle groups sequentially"}, {"name": "Box Breathing", "duration": "5 minutes", "frequency": "2-3x daily or as needed", "pattern": "4-4-4-4 seconds"}, {"name": "Cognitive Reframing", "practice": "Daily journaling", "method": "Identify stressors, challenge negative thoughts, reframe positively"}]',
  '["Reduced cortisol levels", "Improved sleep quality", "Enhanced emotional regulation", "Better stress resilience", "Improved cognitive function", "Reduced inflammation"]',
  '[{"title": "Stress management interventions for police officers and recruits", "authors": "Patterson et al.", "year": 2014, "journal": "Cochrane Database of Systematic Reviews", "doi": "10.1002/14651858.CD009687.pub2"}]',
  1,
  true
FROM toolkit_categories tc WHERE tc.slug = 'coaching';

INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'habit-stacking-behavior-change',
  'Habit Stacking & Behavior Change',
  'Evidence-based strategies for building lasting healthy habits',
  'Habit stacking involves linking new desired behaviors to existing habits, making them easier to adopt and maintain. Based on behavioral psychology research, this approach leverages existing neural pathways to build new ones. Combined with implementation intentions ("if-then" planning) and environmental design, habit stacking creates sustainable behavior change.',
  '["consistency", "motivation", "goal-achievement", "lifestyle-change"]',
  '["balance", "brain"]',
  '[]',
  'silver',
  '[{"name": "Identify Anchor Habits", "examples": "Morning coffee, brushing teeth, meals", "action": "List 5-10 daily habits you do consistently"}, {"name": "Stack New Behaviors", "formula": "After [EXISTING HABIT], I will [NEW BEHAVIOR]", "start": "Choose 1-2 new habits to start"}, {"name": "Implementation Intentions", "format": "If [SITUATION], then I will [BEHAVIOR]", "example": "If I feel stressed at 3pm, then I will do 5 minutes of breathing"}]',
  '["Higher success rate for new habits", "Reduced decision fatigue", "Automatic behavior execution", "Sustainable lifestyle changes", "Improved consistency", "Better goal achievement"]',
  '[{"title": "Implementation intentions and habit formation", "authors": "Gollwitzer & Sheeran", "year": 2006, "journal": "Advances in Experimental Social Psychology", "doi": "10.1016/S0065-2601(06)38002-1"}]',
  2,
  true
FROM toolkit_categories tc WHERE tc.slug = 'coaching';

-- Supplements category items
INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'omega-3-fatty-acids',
  'Omega-3 Fatty Acids (EPA/DHA)',
  'Essential fatty acids for brain health, inflammation reduction, and cardiovascular support',
  'Omega-3 fatty acids, particularly EPA and DHA from fish oil, are crucial for brain structure, cellular function, and inflammation modulation. Research consistently shows benefits for cardiovascular health, cognitive function, mood regulation, and reducing systemic inflammation. Quality and dosage are critical for effectiveness.',
  '["inflammation", "brain-fog", "mood", "joint-pain", "heart-health", "cognitive-decline"]',
  '["brain", "body", "balance"]',
  '[{"condition": "fish or shellfish allergy", "severity": "high"}, {"condition": "bleeding disorders or blood-thinning medications", "severity": "medium"}, {"condition": "upcoming surgery", "severity": "medium"}]',
  'gold',
  '[{"name": "General Health", "epa_dha_combined": "1000-2000mg daily", "timing": "With meals", "quality": "Third-party tested, molecularly distilled"}, {"name": "Therapeutic Dose", "epa_dha_combined": "2000-4000mg daily", "timing": "Split between meals", "indication": "High inflammation or mood support"}, {"name": "Maintenance", "epa_dha_combined": "500-1000mg daily", "timing": "With largest meal"}]',
  '["Reduced inflammation", "Improved cardiovascular health", "Enhanced cognitive function", "Better mood regulation", "Joint health support", "Neuroprotection"]',
  '[{"title": "Omega-3 fatty acids and cardiovascular disease", "authors": "Mozaffarian & Wu", "year": 2011, "journal": "Journal of the American College of Cardiology", "doi": "10.1016/j.jacc.2011.06.063"}]',
  1,
  true
FROM toolkit_categories tc WHERE tc.slug = 'supplements';

INSERT INTO toolkit_items (
  category_id,
  slug,
  name,
  description,
  detailed_description,
  target_symptoms,
  target_assessment_types,
  contraindications,
  evidence_level,
  protocols,
  benefits,
  research_citations,
  display_order,
  is_active
)
SELECT 
  tc.id,
  'vitamin-d3-k2',
  'Vitamin D3 + K2',
  'Essential vitamin combination for bone health, immune function, and longevity',
  'Vitamin D3 is crucial for immune function, bone health, mood regulation, and has emerging evidence for longevity benefits. Vitamin K2 directs calcium to bones and teeth rather than soft tissues, working synergistically with D3. Most people in northern latitudes are deficient, especially during winter months.',
  '["fatigue", "immunity", "bone-health", "mood", "muscle-weakness"]',
  '["body", "brain", "balance"]',
  '[{"condition": "hypercalcemia", "severity": "high"}, {"condition": "kidney stones history", "severity": "medium"}, {"condition": "warfarin or blood thinners", "severity": "medium"}]',
  'gold',
  '[{"name": "Maintenance Dose", "d3": "2000-4000 IU daily", "k2": "100-200mcg daily", "timing": "With fatty meal"}, {"name": "Deficiency Correction", "d3": "5000-10000 IU daily", "k2": "200mcg daily", "duration": "8-12 weeks, then retest", "monitoring": "Check vitamin D levels"}, {"name": "Winter Protocol", "d3": "4000-5000 IU daily", "k2": "200mcg daily", "timing": "October-March in northern latitudes"}]',
  '["Improved immune function", "Better bone density", "Enhanced mood", "Reduced inflammation", "Improved muscle function", "Cardiovascular protection"]',
  '[{"title": "Vitamin D and prevention of chronic diseases", "authors": "Holick", "year": 2013, "journal": "Mayo Clinic Proceedings", "doi": "10.1016/j.mayocp.2013.05.011"}]',
  2,
  true
FROM toolkit_categories tc WHERE tc.slug = 'supplements';