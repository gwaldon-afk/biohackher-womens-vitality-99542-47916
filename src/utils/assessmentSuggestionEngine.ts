export interface AssessmentSuggestion {
  assessmentId: string;
  assessmentName: string;
  pillar: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  expectedInsights: string[];
}

interface Assessment {
  symptom_type: string;
  overall_score: number;
  score_category: string;
  primary_issues?: string[];
}

/**
 * Analyzes completed assessments and suggests additional ones based on patterns
 */
export function getSuggestedAdditionalAssessments(
  completedAssessments: Assessment[],
  allAvailableAssessmentIds: string[]
): AssessmentSuggestion[] {
  const suggestions: AssessmentSuggestion[] = [];
  const completed = new Set(completedAssessments.map(a => a.symptom_type));
  
  const poorScores = completedAssessments.filter(a => a.score_category === 'poor' || a.score_category === 'fair');
  const allSymptoms = completedAssessments.flatMap(a => a.primary_issues || []);
  
  // RULE 1: Energy Issues → Check hormones, sleep, cellular health
  if (poorScores.some(a => ['energy-levels', 'energy-fluctuations'].includes(a.symptom_type))) {
    if (!completed.has('hormone-symptoms')) {
      suggestions.push({
        assessmentId: 'hormone-symptoms',
        assessmentName: 'Hormone Symptoms Assessment',
        pillar: 'Balance',
        priority: 'high',
        reason: 'Low energy is often linked to hormonal imbalances',
        expectedInsights: [
          'Identify hormonal factors affecting energy',
          'Understand metabolic rate fluctuations',
          'Detect thyroid-related energy issues'
        ]
      });
    }
    if (!completed.has('sleep')) {
      suggestions.push({
        assessmentId: 'sleep',
        assessmentName: 'Sleep Quality Assessment',
        pillar: 'Brain',
        priority: 'high',
        reason: 'Poor sleep quality directly impacts daytime energy',
        expectedInsights: [
          'Identify sleep architecture issues',
          'Understand recovery quality',
          'Detect circadian rhythm disruptions'
        ]
      });
    }
    if (!completed.has('body-composition')) {
      suggestions.push({
        assessmentId: 'body-composition',
        assessmentName: 'Body Composition Assessment',
        pillar: 'Body',
        priority: 'medium',
        reason: 'Metabolic health and body composition affect sustained energy',
        expectedInsights: [
          'Assess metabolic efficiency',
          'Identify nutritional factors',
          'Understand muscle health impacts'
        ]
      });
    }
  }
  
  // RULE 2: Cognitive Issues → Check brain-specific, sleep, hormones
  if (poorScores.some(a => ['cognitive-function', 'brain-fog'].includes(a.symptom_type))) {
    if (!completed.has('sleep')) {
      suggestions.push({
        assessmentId: 'sleep',
        assessmentName: 'Sleep Quality Assessment',
        pillar: 'Brain',
        priority: 'high',
        reason: 'Sleep is critical for memory consolidation and cognitive function',
        expectedInsights: [
          'Assess impact on cognitive recovery',
          'Identify brain detoxification during sleep',
          'Understand REM sleep quality'
        ]
      });
    }
    if (!completed.has('hormone-symptoms')) {
      suggestions.push({
        assessmentId: 'hormone-symptoms',
        assessmentName: 'Hormone Symptoms Assessment',
        pillar: 'Balance',
        priority: 'medium',
        reason: 'Hormonal imbalances (thyroid, cortisol) can cause brain fog',
        expectedInsights: [
          'Detect hormone-related cognitive impacts',
          'Identify thyroid effects on mental clarity',
          'Understand stress hormone influences'
        ]
      });
    }
    if (!completed.has('stress-assessment')) {
      suggestions.push({
        assessmentId: 'stress-assessment',
        assessmentName: 'Stress Assessment',
        pillar: 'Balance',
        priority: 'medium',
        reason: 'Chronic stress impairs cognitive function and focus',
        expectedInsights: [
          'Identify stress-cognition connection',
          'Understand cortisol effects on brain',
          'Assess recovery capacity'
        ]
      });
    }
  }
  
  // RULE 3: Sleep Issues → Check hormones, stress, energy
  if (poorScores.some(a => ['sleep'].includes(a.symptom_type))) {
    if (!completed.has('stress-assessment')) {
      suggestions.push({
        assessmentId: 'stress-assessment',
        assessmentName: 'Stress Assessment',
        pillar: 'Balance',
        priority: 'high',
        reason: 'Chronic stress and high cortisol disrupt sleep patterns',
        expectedInsights: [
          'Identify stress-sleep connection',
          'Understand HPA axis dysregulation',
          'Detect cortisol rhythm disruptions'
        ]
      });
    }
    if (!completed.has('hormone-symptoms')) {
      suggestions.push({
        assessmentId: 'hormone-symptoms',
        assessmentName: 'Hormone Symptoms Assessment',
        pillar: 'Balance',
        priority: 'high',
        reason: 'Hormones regulate sleep-wake cycles',
        expectedInsights: [
          'Assess melatonin production',
          'Understand hormone timing issues',
          'Identify progesterone effects on sleep'
        ]
      });
    }
  }
  
  // RULE 4: Hormonal Symptoms → Check related assessments
  if (poorScores.some(a => ['hormone-symptoms'].includes(a.symptom_type))) {
    if (!completed.has('energy-levels')) {
      suggestions.push({
        assessmentId: 'energy-levels',
        assessmentName: 'Energy Levels Assessment',
        pillar: 'Body',
        priority: 'high',
        reason: 'Hormonal imbalances significantly impact energy levels',
        expectedInsights: [
          'Understand hormone-energy connection',
          'Identify metabolic impacts',
          'Assess thyroid function indicators'
        ]
      });
    }
    if (!completed.has('cognitive-function')) {
      suggestions.push({
        assessmentId: 'cognitive-function',
        assessmentName: 'Cognitive Function Assessment',
        pillar: 'Brain',
        priority: 'medium',
        reason: 'Hormonal fluctuations affect cognitive performance',
        expectedInsights: [
          'Understand hormone-cognition link',
          'Identify memory impacts',
          'Assess mental clarity factors'
        ]
      });
    }
  }
  
  // RULE 5: Physical Performance Issues → Check body composition, energy
  if (poorScores.some(a => ['physical-performance'].includes(a.symptom_type))) {
    if (!completed.has('body-composition')) {
      suggestions.push({
        assessmentId: 'body-composition',
        assessmentName: 'Body Composition Assessment',
        pillar: 'Body',
        priority: 'high',
        reason: 'Body composition directly affects physical performance',
        expectedInsights: [
          'Assess muscle-to-fat ratio',
          'Identify metabolic factors',
          'Understand structural health'
        ]
      });
    }
    if (!completed.has('energy-levels')) {
      suggestions.push({
        assessmentId: 'energy-levels',
        assessmentName: 'Energy Levels Assessment',
        pillar: 'Body',
        priority: 'medium',
        reason: 'Energy capacity affects performance and recovery',
        expectedInsights: [
          'Assess endurance capacity',
          'Identify recovery factors',
          'Understand mitochondrial function'
        ]
      });
    }
  }
  
  // RULE 6: Stress/Anxiety → Check related mental health
  if (poorScores.some(a => ['stress-assessment'].includes(a.symptom_type)) || 
      allSymptoms.some(s => s.includes('anxiety') || s.includes('stress'))) {
    if (!completed.has('sleep')) {
      suggestions.push({
        assessmentId: 'sleep',
        assessmentName: 'Sleep Quality Assessment',
        pillar: 'Brain',
        priority: 'high',
        reason: 'Poor stress management disrupts sleep quality',
        expectedInsights: [
          'Identify stress-sleep patterns',
          'Understand cortisol impacts',
          'Assess recovery quality'
        ]
      });
    }
    if (!completed.has('cognitive-function')) {
      suggestions.push({
        assessmentId: 'cognitive-function',
        assessmentName: 'Cognitive Function Assessment',
        pillar: 'Brain',
        priority: 'medium',
        reason: 'Chronic stress impairs cognitive performance',
        expectedInsights: [
          'Assess stress impact on focus',
          'Identify memory effects',
          'Understand mental resilience'
        ]
      });
    }
  }
  
  // Sort by priority and remove duplicates, limit to top 6
  const uniqueSuggestions = suggestions.filter((sugg, index, self) =>
    !completed.has(sugg.assessmentId) &&
    index === self.findIndex(s => s.assessmentId === sugg.assessmentId)
  );
  
  return uniqueSuggestions
    .sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    })
    .slice(0, 6);
}
