// Energy Pattern Detection & Correlation Analysis

export interface DetectedPattern {
  type: 'correlation' | 'trend' | 'anomaly';
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'critical';
  confidence: number; // 0-100
  triggerData: any;
  suggestions: string[];
}

export interface CorrelationData {
  metric1: string;
  metric2: string;
  values1: number[];
  values2: number[];
  dates: string[];
}

// Calculate Pearson correlation coefficient
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length < 2) return 0;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

export function detectHRVEnergyPattern(
  hrvData: { date: string; value: number }[],
  energyData: { date: string; value: number }[]
): DetectedPattern | null {
  if (hrvData.length < 3 || energyData.length < 3) return null;
  
  // Align data by date
  const aligned = hrvData
    .map(hrv => ({
      hrv: hrv.value,
      energy: energyData.find(e => e.date === hrv.date)?.value
    }))
    .filter(d => d.energy !== undefined) as { hrv: number; energy: number }[];
  
  if (aligned.length < 3) return null;
  
  const correlation = calculateCorrelation(
    aligned.map(d => d.hrv),
    aligned.map(d => d.energy)
  );
  
  if (Math.abs(correlation) > 0.6) {
    const isPositive = correlation > 0;
    return {
      type: 'correlation',
      title: isPositive ? 'HRV Tracks Your Energy' : 'HRV-Energy Mismatch',
      description: isPositive
        ? `Your HRV and energy levels are strongly aligned (${Math.round(correlation * 100)}% correlation). Higher HRV days consistently lead to better energy.`
        : `Your HRV and energy show an unexpected inverse relationship. This may indicate overtraining or insufficient recovery.`,
      severity: isPositive ? 'info' : 'warning',
      confidence: Math.abs(correlation) * 100,
      triggerData: { correlation, sampleSize: aligned.length },
      suggestions: isPositive
        ? ['Continue monitoring HRV as your energy predictor', 'Focus on habits that improve HRV']
        : ['Consider rest days when HRV drops', 'Review training intensity', 'Check for hidden stressors']
    };
  }
  
  return null;
}

export function detectSleepEnergyPattern(
  sleepData: { date: string; hours: number; quality?: number }[],
  energyData: { date: string; value: number }[]
): DetectedPattern | null {
  if (sleepData.length < 5 || energyData.length < 5) return null;
  
  // Check for consecutive days of poor sleep (<6 hours)
  const poorSleepStreak = sleepData.filter(s => s.hours < 6).length;
  const avgEnergy = energyData.slice(-7).reduce((sum, e) => sum + e.value, 0) / Math.min(7, energyData.length);
  
  if (poorSleepStreak >= 3 && avgEnergy < 60) {
    return {
      type: 'trend',
      title: 'Sleep Debt Accumulating',
      description: `You've had ${poorSleepStreak} nights with less than 6 hours of sleep. Your average energy has dropped to ${Math.round(avgEnergy)}/100.`,
      severity: 'critical',
      confidence: 85,
      triggerData: { poorSleepStreak, avgEnergy },
      suggestions: [
        'Prioritize 7-8 hours of sleep tonight',
        'Create a wind-down routine 1 hour before bed',
        'Consider magnesium glycinate supplement',
        'Limit screen time after 8 PM'
      ]
    };
  }
  
  // Check for sleep quality correlation
  const qualityData = sleepData.filter(s => s.quality !== undefined);
  if (qualityData.length >= 3) {
    const aligned = qualityData
      .map(sleep => ({
        quality: sleep.quality!,
        energy: energyData.find(e => e.date === sleep.date)?.value
      }))
      .filter(d => d.energy !== undefined) as { quality: number; energy: number }[];
    
    const correlation = calculateCorrelation(
      aligned.map(d => d.quality),
      aligned.map(d => d.energy)
    );
    
    if (correlation > 0.7) {
      return {
        type: 'correlation',
        title: 'Sleep Quality Is Your Energy Lever',
        description: `Sleep quality predicts ${Math.round(correlation * 100)}% of your next-day energy. Focus on quality over quantity.`,
        severity: 'info',
        confidence: correlation * 100,
        triggerData: { correlation, sampleSize: aligned.length },
        suggestions: [
          'Track what improves sleep quality (e.g., no alcohol, cool room)',
          'Use sleep-tracking insights to optimize your routine'
        ]
      };
    }
  }
  
  return null;
}

export function detectMovementEnergyPattern(
  movementData: { date: string; active_minutes: number; steps?: number }[],
  energyData: { date: string; value: number }[]
): DetectedPattern | null {
  if (movementData.length < 5 || energyData.length < 5) return null;
  
  // Check for sedentary streak (3+ days with <15 active minutes)
  const sedentaryDays = movementData.filter(m => m.active_minutes < 15).length;
  
  if (sedentaryDays >= 3) {
    const avgEnergy = energyData.slice(-sedentaryDays).reduce((sum, e) => sum + e.value, 0) / sedentaryDays;
    
    return {
      type: 'trend',
      title: 'Movement Deficit Detected',
      description: `${sedentaryDays} days of minimal movement. Your energy is ${avgEnergy < 70 ? 'declining' : 'stable but could improve'}.`,
      severity: avgEnergy < 60 ? 'warning' : 'info',
      confidence: 75,
      triggerData: { sedentaryDays, avgEnergy },
      suggestions: [
        'Start with a 10-minute walk today',
        'Set hourly movement reminders',
        'Try desk exercises or stretching',
        'Schedule a workout for tomorrow'
      ]
    };
  }
  
  // Check for movement-energy correlation
  const aligned = movementData
    .map(move => ({
      movement: move.active_minutes,
      energy: energyData.find(e => e.date === move.date)?.value
    }))
    .filter(d => d.energy !== undefined) as { movement: number; energy: number }[];
  
  const correlation = calculateCorrelation(
    aligned.map(d => d.movement),
    aligned.map(d => d.energy)
  );
  
  if (correlation > 0.6) {
    return {
      type: 'correlation',
      title: 'Movement Fuels Your Energy',
      description: `Your active days correlate with ${Math.round(correlation * 100)}% higher energy. Keep moving!`,
      severity: 'info',
      confidence: correlation * 100,
      triggerData: { correlation, sampleSize: aligned.length },
      suggestions: [
        'Aim for 30+ active minutes daily',
        'Mix cardio and strength training',
        'Your body responds well to movement - use it as an energy tool'
      ]
    };
  }
  
  return null;
}

export function detectStressPattern(
  stressData: { date: string; level: number; hrv?: number }[],
  energyData: { date: string; value: number }[]
): DetectedPattern | null {
  if (stressData.length < 5) return null;
  
  // Check for prolonged high stress (5+ days at level 4-5)
  const highStressDays = stressData.filter(s => s.level >= 4).length;
  
  if (highStressDays >= 5) {
    const recentEnergy = energyData.slice(-5).reduce((sum, e) => sum + e.value, 0) / Math.min(5, energyData.length);
    
    return {
      type: 'anomaly',
      title: 'Chronic Stress Alert',
      description: `High stress for ${highStressDays} days. Energy at ${Math.round(recentEnergy)}/100. Your cortisol curve may be dysregulated.`,
      severity: 'critical',
      confidence: 90,
      triggerData: { highStressDays, recentEnergy },
      suggestions: [
        'Practice breathwork (box breathing: 4-4-4-4)',
        'Consider adaptogenic herbs (ashwagandha, rhodiola)',
        'Schedule a rest day or active recovery',
        'Try cold exposure (cold shower for 2 min)',
        'Seek professional support if stress persists'
      ]
    };
  }
  
  return null;
}

export function detectNutritionPattern(
  nutritionData: { date: string; score: number; meal_timing?: string }[],
  energyData: { date: string; value: number }[]
): DetectedPattern | null {
  if (nutritionData.length < 3) return null;
  
  const aligned = nutritionData
    .map(nutrition => ({
      nutrition: nutrition.score,
      energy: energyData.find(e => e.date === nutrition.date)?.value
    }))
    .filter(d => d.energy !== undefined) as { nutrition: number; energy: number }[];
  
  const correlation = calculateCorrelation(
    aligned.map(d => d.nutrition),
    aligned.map(d => d.energy)
  );
  
  if (correlation > 0.65) {
    return {
      type: 'correlation',
      title: 'Nutrition Directly Impacts Your Energy',
      description: `${Math.round(correlation * 100)}% correlation between meal quality and energy. Food is your fuel.`,
      severity: 'info',
      confidence: correlation * 100,
      triggerData: { correlation, sampleSize: aligned.length },
      suggestions: [
        'Focus on protein-rich breakfasts (30g within 90 min of waking)',
        'Avoid high-sugar meals if afternoon crashes occur',
        'Track which foods give you sustained energy'
      ]
    };
  }
  
  return null;
}

export function detectAllPatterns(
  historicalData: {
    energy: { date: string; value: number }[];
    hrv?: { date: string; value: number }[];
    sleep?: { date: string; hours: number; quality?: number }[];
    movement?: { date: string; active_minutes: number; steps?: number }[];
    stress?: { date: string; level: number; hrv?: number }[];
    nutrition?: { date: string; score: number; meal_timing?: string }[];
  }
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  
  if (historicalData.hrv && historicalData.hrv.length >= 3) {
    const pattern = detectHRVEnergyPattern(historicalData.hrv, historicalData.energy);
    if (pattern) patterns.push(pattern);
  }
  
  if (historicalData.sleep && historicalData.sleep.length >= 5) {
    const pattern = detectSleepEnergyPattern(historicalData.sleep, historicalData.energy);
    if (pattern) patterns.push(pattern);
  }
  
  if (historicalData.movement && historicalData.movement.length >= 5) {
    const pattern = detectMovementEnergyPattern(historicalData.movement, historicalData.energy);
    if (pattern) patterns.push(pattern);
  }
  
  if (historicalData.stress && historicalData.stress.length >= 5) {
    const pattern = detectStressPattern(historicalData.stress, historicalData.energy);
    if (pattern) patterns.push(pattern);
  }
  
  if (historicalData.nutrition && historicalData.nutrition.length >= 3) {
    const pattern = detectNutritionPattern(historicalData.nutrition, historicalData.energy);
    if (pattern) patterns.push(pattern);
  }
  
  // Sort by severity (critical > warning > info) and confidence
  return patterns.sort((a, b) => {
    const severityOrder = { critical: 3, warning: 2, info: 1 };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    return severityDiff !== 0 ? severityDiff : b.confidence - a.confidence;
  });
}
