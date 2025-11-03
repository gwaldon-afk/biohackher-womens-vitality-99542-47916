import { Heart, Activity, Moon, TrendingUp, Users, Brain, Sparkles, LucideIcon } from 'lucide-react';

export interface PillarAnalysis {
  name: string;
  displayName: string;
  analysisName: string;
  icon: LucideIcon;
  color: string;
  score: number;
}

const pillarMetadata: Record<string, { icon: LucideIcon; color: string; displayName: string; analysisName: string }> = {
  // Guest assessment pillar names
  'Body': { icon: Activity, color: '#f97316', displayName: 'Body & Physical Health', analysisName: 'Activity' },
  'Balance': { icon: Heart, color: '#ef4444', displayName: 'Balance & Mental Health', analysisName: 'Stress' },
  'Brain': { icon: Brain, color: '#a855f7', displayName: 'Brain & Cognition', analysisName: 'Brain' },
  'Beauty': { icon: Sparkles, color: '#ec4899', displayName: 'Beauty & Vitality', analysisName: 'Nutrition' },
  // Standard LIS pillar names  
  'sleep': { icon: Moon, color: '#6366f1', displayName: 'Sleep', analysisName: 'Sleep' },
  'stress': { icon: Heart, color: '#ef4444', displayName: 'Stress', analysisName: 'Stress' },
  'activity': { icon: Activity, color: '#f97316', displayName: 'Activity', analysisName: 'Activity' },
  'nutrition': { icon: TrendingUp, color: '#22c55e', displayName: 'Nutrition', analysisName: 'Nutrition' },
  'social': { icon: Users, color: '#ec4899', displayName: 'Social', analysisName: 'Social' },
  'cognitive': { icon: Brain, color: '#a855f7', displayName: 'Cognitive', analysisName: 'Brain' },
};

export const generatePillarAnalysis = (
  pillarScores: Record<string, number>
): PillarAnalysis[] => {
  const analyses: PillarAnalysis[] = [];

  for (const [pillarKey, score] of Object.entries(pillarScores)) {
    const metadata = pillarMetadata[pillarKey];
    
    if (metadata) {
      analyses.push({
        name: pillarKey,
        displayName: metadata.displayName,
        analysisName: metadata.analysisName,
        icon: metadata.icon,
        color: metadata.color,
        score: score
      });
    }
  }

  return analyses;
};

export const getPillarDisplayName = (pillarKey: string): string => {
  return pillarMetadata[pillarKey]?.displayName || pillarKey;
};

export const getPillarAnalysisName = (pillarKey: string): string => {
  return pillarMetadata[pillarKey]?.analysisName || pillarKey;
};
