// Energy Loop Score Calculation Engine
// Weighted scoring system optimized for women's physiology

export interface EnergyInputs {
  // Wearable/Daily Score Data
  sleepHours?: number;
  remPercentage?: number;
  deepSleepHours?: number;
  hrv?: number;
  restingHeartRate?: number;
  activeMinutes?: number;
  steps?: number;
  
  // Manual Check-in Data
  energyRating?: number; // 1-10
  sleepQuality?: number; // 1-5
  stressLevel?: number; // 1-5
  movementCompleted?: boolean;
  
  // Nutrition Data
  mealQuality?: number;
  nutritionScore?: number;
  
  // Hormonal Data (from MenoMap)
  menoStage?: string;
  cycleDay?: number;
}

export interface EnergySegmentScore {
  score: number; // 0-100
  dataQuality: 'high' | 'medium' | 'low';
  dataSources: string[];
}

export interface EnergyLoopScore {
  composite: number; // 0-100
  segments: {
    sleepRecovery: EnergySegmentScore;
    stressLoad: EnergySegmentScore;
    nutrition: EnergySegmentScore;
    movementQuality: EnergySegmentScore;
    hormonalRhythm: EnergySegmentScore;
  };
  loopCompletion: number; // % of segments with data
  overallDataQuality: 'high' | 'medium' | 'low';
}

// Segment weights (totals 100%)
const WEIGHTS = {
  sleepRecovery: 0.30,    // 30%
  stressLoad: 0.25,       // 25%
  nutrition: 0.20,        // 20%
  movementQuality: 0.15,  // 15%
  hormonalRhythm: 0.10    // 10%
};

export function calculateSleepRecovery(inputs: EnergyInputs): EnergySegmentScore {
  const sources: string[] = [];
  let score = 0;
  let dataPoints = 0;
  let quality: 'high' | 'medium' | 'low' = 'low';

  // Wearable data (higher quality)
  if (inputs.sleepHours !== undefined) {
    sources.push('wearable');
    const hoursScore = Math.min(100, (inputs.sleepHours / 8) * 100);
    score += hoursScore;
    dataPoints++;
    
    if (inputs.remPercentage !== undefined) {
      const remScore = Math.min(100, (inputs.remPercentage / 25) * 100);
      score += remScore;
      dataPoints++;
    }
    
    if (inputs.deepSleepHours !== undefined) {
      const deepScore = Math.min(100, (inputs.deepSleepHours / 2) * 100);
      score += deepScore;
      dataPoints++;
    }
    
    quality = dataPoints >= 2 ? 'high' : 'medium';
  }
  
  // Manual check-in (lower quality)
  if (inputs.sleepQuality !== undefined && dataPoints === 0) {
    sources.push('manual');
    score = (inputs.sleepQuality / 5) * 100;
    dataPoints = 1;
    quality = 'medium';
  }

  return {
    score: dataPoints > 0 ? score / dataPoints : 0,
    dataQuality: quality,
    dataSources: sources
  };
}

export function calculateStressLoad(inputs: EnergyInputs): EnergySegmentScore {
  const sources: string[] = [];
  let score = 0;
  let dataPoints = 0;
  let quality: 'high' | 'medium' | 'low' = 'low';

  // Wearable data (higher quality)
  if (inputs.hrv !== undefined) {
    sources.push('wearable');
    // Higher HRV = better (less stress)
    // Normalize: 20-100ms range, optimal ~60+
    const hrvScore = Math.min(100, (inputs.hrv / 60) * 100);
    score += hrvScore;
    dataPoints++;
    
    if (inputs.restingHeartRate !== undefined) {
      // Lower RHR = better (less stress)
      // Normalize: 60-100bpm range, optimal ~60
      const rhrScore = Math.max(0, 100 - ((inputs.restingHeartRate - 60) * 2.5));
      score += rhrScore;
      dataPoints++;
    }
    
    quality = 'high';
  }
  
  // Manual check-in (inverted: lower stress level = higher score)
  if (inputs.stressLevel !== undefined && dataPoints === 0) {
    sources.push('manual');
    score = ((6 - inputs.stressLevel) / 5) * 100;
    dataPoints = 1;
    quality = 'medium';
  }

  return {
    score: dataPoints > 0 ? score / dataPoints : 0,
    dataQuality: quality,
    dataSources: sources
  };
}

export function calculateNutrition(inputs: EnergyInputs): EnergySegmentScore {
  const sources: string[] = [];
  let score = 0;
  let quality: 'high' | 'medium' | 'low' = 'low';

  if (inputs.nutritionScore !== undefined) {
    sources.push('nutrition_log');
    score = inputs.nutritionScore;
    quality = 'high';
  } else if (inputs.mealQuality !== undefined) {
    sources.push('manual');
    score = inputs.mealQuality;
    quality = 'medium';
  }

  return {
    score,
    dataQuality: quality,
    dataSources: sources
  };
}

export function calculateMovementQuality(inputs: EnergyInputs): EnergySegmentScore {
  const sources: string[] = [];
  let score = 0;
  let dataPoints = 0;
  let quality: 'high' | 'medium' | 'low' = 'low';

  // Wearable data
  if (inputs.steps !== undefined) {
    sources.push('wearable');
    // Target: 8000-10000 steps
    const stepsScore = Math.min(100, (inputs.steps / 8000) * 100);
    score += stepsScore;
    dataPoints++;
    
    if (inputs.activeMinutes !== undefined) {
      // Target: 30+ minutes
      const activeScore = Math.min(100, (inputs.activeMinutes / 30) * 100);
      score += activeScore;
      dataPoints++;
    }
    
    quality = dataPoints >= 2 ? 'high' : 'medium';
  }
  
  // Manual check-in
  if (inputs.movementCompleted !== undefined && dataPoints === 0) {
    sources.push('manual');
    score = inputs.movementCompleted ? 80 : 40;
    dataPoints = 1;
    quality = 'low';
  }

  return {
    score: dataPoints > 0 ? score / dataPoints : 0,
    dataQuality: quality,
    dataSources: sources
  };
}

export function calculateHormonalRhythm(inputs: EnergyInputs): EnergySegmentScore {
  const sources: string[] = [];
  let score = 75; // Default neutral score
  let quality: 'high' | 'medium' | 'low' = 'low';

  if (inputs.menoStage) {
    sources.push('menomap');
    
    // Adjust score based on menopause stage
    const stageAdjustments: Record<string, number> = {
      'pre': 85,
      'early-peri': 75,
      'mid-peri': 65,
      'late-peri': 60,
      'post': 70
    };
    
    score = stageAdjustments[inputs.menoStage] || 75;
    quality = 'high';
  } else if (inputs.cycleDay !== undefined) {
    sources.push('cycle_tracking');
    
    // Adjust score based on cycle phase
    // Days 1-5 (menstrual): 65
    // Days 6-14 (follicular): 85
    // Days 15-28 (luteal): 70
    if (inputs.cycleDay <= 5) {
      score = 65;
    } else if (inputs.cycleDay <= 14) {
      score = 85;
    } else {
      score = 70;
    }
    
    quality = 'medium';
  }

  return {
    score,
    dataQuality: quality,
    dataSources: sources
  };
}

export function calculateEnergyLoop(inputs: EnergyInputs): EnergyLoopScore {
  const segments = {
    sleepRecovery: calculateSleepRecovery(inputs),
    stressLoad: calculateStressLoad(inputs),
    nutrition: calculateNutrition(inputs),
    movementQuality: calculateMovementQuality(inputs),
    hormonalRhythm: calculateHormonalRhythm(inputs)
  };

  // Calculate weighted composite score
  const composite = 
    segments.sleepRecovery.score * WEIGHTS.sleepRecovery +
    segments.stressLoad.score * WEIGHTS.stressLoad +
    segments.nutrition.score * WEIGHTS.nutrition +
    segments.movementQuality.score * WEIGHTS.movementQuality +
    segments.hormonalRhythm.score * WEIGHTS.hormonalRhythm;

  // Calculate loop completion percentage
  const segmentsWithData = Object.values(segments).filter(
    s => s.dataSources.length > 0
  ).length;
  const loopCompletion = (segmentsWithData / 5) * 100;

  // Determine overall data quality
  const highQuality = Object.values(segments).filter(s => s.dataQuality === 'high').length;
  const mediumQuality = Object.values(segments).filter(s => s.dataQuality === 'medium').length;
  
  let overallDataQuality: 'high' | 'medium' | 'low' = 'low';
  if (highQuality >= 3) overallDataQuality = 'high';
  else if (highQuality + mediumQuality >= 3) overallDataQuality = 'medium';

  return {
    composite: Math.round(composite * 100) / 100,
    segments,
    loopCompletion: Math.round(loopCompletion * 100) / 100,
    overallDataQuality
  };
}

export function calculateEnergyVariability(scores: number[], days: number = 7): number {
  if (scores.length < 2) return 0;
  
  // Calculate standard deviation
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Convert to 0-100 scale (lower variability = higher score)
  // StdDev of 0 = 100, StdDev of 30+ = 0
  return Math.max(0, 100 - (stdDev * 3.33));
}
