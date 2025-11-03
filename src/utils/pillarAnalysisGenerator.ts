import { Heart, Activity, Moon, TrendingUp, Users, Brain, LucideIcon } from 'lucide-react';

export interface PillarAnalysis {
  name: string;
  icon: LucideIcon;
  color: string;
  score: number;
}

const pillarMetadata: Record<string, { icon: LucideIcon; color: string; displayName: string }> = {
  'Balance': { icon: Heart, color: '#ef4444', displayName: 'Stress' },
  'Body': { icon: Activity, color: '#f97316', displayName: 'Activity' },
  'sleep': { icon: Moon, color: '#6366f1', displayName: 'Sleep' },
  'nutrition': { icon: TrendingUp, color: '#22c55e', displayName: 'Nutrition' },
  'social': { icon: Users, color: '#ec4899', displayName: 'Social' },
  'Brain': { icon: Brain, color: '#a855f7', displayName: 'Brain' },
  // Alternate naming conventions
  'Stress': { icon: Heart, color: '#ef4444', displayName: 'Stress' },
  'Activity': { icon: Activity, color: '#f97316', displayName: 'Activity' },
  'Sleep': { icon: Moon, color: '#6366f1', displayName: 'Sleep' },
  'Nutrition': { icon: TrendingUp, color: '#22c55e', displayName: 'Nutrition' },
  'Social': { icon: Users, color: '#ec4899', displayName: 'Social' },
  'Cognitive': { icon: Brain, color: '#a855f7', displayName: 'Brain' },
};

export const generatePillarAnalysis = (
  pillarScores: Record<string, number>
): PillarAnalysis[] => {
  const analyses: PillarAnalysis[] = [];

  for (const [pillarKey, score] of Object.entries(pillarScores)) {
    const metadata = pillarMetadata[pillarKey];
    
    if (metadata) {
      analyses.push({
        name: metadata.displayName,
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
