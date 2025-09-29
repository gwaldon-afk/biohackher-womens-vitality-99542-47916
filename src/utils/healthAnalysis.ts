interface SymptomAssessment {
  id: string;
  symptom_type: string;
  overall_score: number;
  score_category: string;
  completed_at: string;
  primary_issues: string[];
  recommendations?: {
    immediate?: string[];
    lifestyle?: string[];
    professional?: string[];
  };
}

export const getSymptomName = (symptomId: string) => {
  const nameMap: Record<string, string> = {
    'brain-fog': 'Brain Fog',
    'brain-brain-fog-assessment': 'Brain Fog',
    'energy': 'Energy & Fatigue',
    'joint-pain': 'Joint Pain',
    'sleep': 'Sleep Quality',
    'gut': 'Digestive Health',
    'hot-flashes': 'Hot Flashes',
    'memory-focus': 'Memory & Focus',
    'mobility': 'Mobility',
    'bloating': 'Bloating',
    'anxiety': 'Anxiety',
    'weight': 'Weight Management',
    'hair': 'Hair Health',
    'headache': 'Headaches'
  };
  return nameMap[symptomId] || symptomId;
};

export const getOverallHealthAnalysis = (symptomAssessments: SymptomAssessment[]) => {
  if (symptomAssessments.length === 0) return {
    status: 'No Data',
    score: 0,
    breakdown: { excellent: 0, good: 0, fair: 0, poor: 0 },
    analysis: 'Complete your first symptom assessment to get your personalized health analysis and recommendations.'
  };

  const avgScore = symptomAssessments.reduce((sum, a) => sum + a.overall_score, 0) / symptomAssessments.length;
  const breakdown = {
    excellent: symptomAssessments.filter(a => a.score_category === 'excellent').length,
    good: symptomAssessments.filter(a => a.score_category === 'good').length,
    fair: symptomAssessments.filter(a => a.score_category === 'fair').length,
    poor: symptomAssessments.filter(a => a.score_category === 'poor').length
  };

  let status = avgScore >= 80 ? 'Excellent' : avgScore >= 65 ? 'Good' : avgScore >= 50 ? 'Fair' : 'Needs Attention';

  // Generate comprehensive analysis text
  let analysis = '';
  const totalPositive = breakdown.excellent + breakdown.good;
  const totalConcerning = breakdown.fair + breakdown.poor;
  const domainNames = symptomAssessments.map(a => getSymptomName(a.symptom_type)).join(', ');

  if (avgScore >= 80) {
    analysis = `Your comprehensive health analysis reveals exceptional wellness management across ${domainNames}, with an outstanding overall score of ${Math.round(avgScore)}/100. This places you in the optimal health category, with ${totalPositive} areas performing excellently.`;
  } else if (avgScore >= 65) {
    analysis = `Your health profile demonstrates strong overall wellness with a score of ${Math.round(avgScore)}/100 across ${domainNames}. You have ${totalPositive} areas performing well, indicating effective health management strategies are in place.`;
    if (totalConcerning > 0) {
      analysis += ` However, ${totalConcerning} area${totalConcerning > 1 ? 's require' : ' requires'} focused attention to optimize your overall wellbeing.`;
    }
  } else if (avgScore >= 50) {
    analysis = `Your comprehensive health analysis shows a mixed wellness profile with a score of ${Math.round(avgScore)}/100, indicating both areas of strength and significant opportunities for improvement across ${domainNames}.`;
    if (totalPositive > 0) {
      analysis += ` Your success in ${totalPositive} area${totalPositive > 1 ? 's' : ''} demonstrates your capability for effective health management.`;
    }
    if (breakdown.poor > 0) {
      analysis += ` ${breakdown.poor} area${breakdown.poor > 1 ? 's show' : ' shows'} significant concern and should be your primary focus.`;
    }
  } else {
    analysis = `Your current health analysis indicates significant challenges across ${domainNames}, with an overall score of ${Math.round(avgScore)}/100. This comprehensive assessment suggests that targeted health intervention and professional guidance would be highly beneficial.`;
    if (totalPositive > 0) {
      analysis += ` However, your success in ${totalPositive} area${totalPositive > 1 ? 's' : ''} shows that positive change is achievable with the right approach.`;
    }
  }

  return { status, score: Math.round(avgScore), breakdown, analysis };
};

export const getTopRecommendations = (symptomAssessments: SymptomAssessment[], limit = 3) => {
  if (symptomAssessments.length === 0) return [];

  // Prioritize recommendations from poor and fair categories
  const priorityAssessments = symptomAssessments
    .filter(a => a.score_category === 'poor' || a.score_category === 'fair')
    .sort((a, b) => {
      if (a.score_category === 'poor' && b.score_category === 'fair') return -1;
      if (a.score_category === 'fair' && b.score_category === 'poor') return 1;
      return a.overall_score - b.overall_score;
    });

  const recommendations: Array<{
    area: string;
    recommendation: string;
    priority: 'high' | 'medium';
  }> = [];

  priorityAssessments.slice(0, limit).forEach(assessment => {
    const immediateRecs = assessment.recommendations?.immediate || [];
    if (immediateRecs.length > 0) {
      recommendations.push({
        area: getSymptomName(assessment.symptom_type),
        recommendation: immediateRecs[0],
        priority: assessment.score_category === 'poor' ? 'high' : 'medium'
      });
    }
  });

  return recommendations;
};