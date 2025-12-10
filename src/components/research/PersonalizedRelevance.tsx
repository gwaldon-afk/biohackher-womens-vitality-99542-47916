import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, ChevronDown, ChevronUp, User, Target, TrendingUp } from "lucide-react";
import { useUserHealthContext, UserHealthContext } from "@/hooks/useUserHealthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface PersonalizedRelevanceProps {
  studyTitle: string;
  studyAbstract?: string;
  interventionName: string;
  pillar?: string;
  className?: string;
}

export function PersonalizedRelevance({
  studyTitle,
  studyAbstract,
  interventionName,
  pillar,
  className,
}: PersonalizedRelevanceProps) {
  const { data: healthContext, isLoading: contextLoading } = useUserHealthContext();
  const [personalization, setPersonalization] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate relevance score based on context matching
  const relevanceScore = calculateRelevanceScore(healthContext, pillar, interventionName);

  const generatePersonalization = async () => {
    if (!healthContext || personalization) return;
    
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('personalize-research', {
        body: {
          studyTitle,
          studyAbstract,
          interventionName,
          pillar,
          healthContext: {
            lisScore: healthContext.lisScore,
            priorityAreas: healthContext.priorityAreas,
            activeGoals: healthContext.activeGoals?.map(g => g.title),
            hormoneHealthLevel: healthContext.hormoneHealthLevel,
            nutritionScore: healthContext.nutritionScore,
            age: healthContext.chronologicalAge,
          },
        },
      });

      if (fnError) throw fnError;
      setPersonalization(data?.personalization || null);
      setExpanded(true);
    } catch (err) {
      console.error('Error generating personalization:', err);
      setError('Unable to generate personalized insights');
      // Fallback to static personalization
      setPersonalization(generateStaticPersonalization(healthContext, pillar, interventionName));
      setExpanded(true);
    } finally {
      setLoading(false);
    }
  };

  // Don't show if no user context
  if (!healthContext && !contextLoading) return null;

  return (
    <Card className={cn(
      "border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-background",
      className
    )}>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <div className="p-1.5 rounded-full bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Why This Matters For You</span>
                {relevanceScore !== null && (
                  <RelevanceBadge score={relevanceScore} />
                )}
              </div>
              
              {!personalization && !loading && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Get insights based on your health profile
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!personalization) {
                generatePersonalization();
              } else {
                setExpanded(!expanded);
              }
            }}
            disabled={loading || contextLoading}
            className="h-8"
          >
            {loading || contextLoading ? (
              <span className="text-xs">Analyzing...</span>
            ) : personalization ? (
              expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
            ) : (
              <span className="text-xs">Show Relevance</span>
            )}
          </Button>
        </div>

        {(loading || contextLoading) && (
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        )}

        {expanded && personalization && (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-foreground leading-relaxed">
              {personalization}
            </p>
            
            {/* Quick context indicators */}
            <div className="flex flex-wrap gap-2">
              {healthContext?.priorityAreas.some(area => 
                pillar?.toLowerCase().includes(area) || 
                interventionName.toLowerCase().includes(area)
              ) && (
                <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-1 rounded-full">
                  <Target className="h-3 w-3" />
                  <span>Matches your focus area</span>
                </div>
              )}
              {healthContext?.activeGoals?.some(g => 
                pillar?.toLowerCase().includes(g.pillarCategory.toLowerCase())
              ) && (
                <div className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-full">
                  <TrendingUp className="h-3 w-3" />
                  <span>Supports your goals</span>
                </div>
              )}
            </div>
          </div>
        )}

        {error && !personalization && (
          <p className="text-xs text-muted-foreground mt-2">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}

function RelevanceBadge({ score }: { score: number }) {
  let label: string;
  let colorClass: string;

  if (score >= 80) {
    label = "High Relevance";
    colorClass = "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
  } else if (score >= 50) {
    label = "Moderate";
    colorClass = "bg-amber-500/10 text-amber-600 border-amber-500/20";
  } else {
    label = "General";
    colorClass = "bg-muted text-muted-foreground";
  }

  return (
    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", colorClass)}>
      {label}
    </span>
  );
}

function calculateRelevanceScore(
  context: UserHealthContext | null | undefined,
  pillar?: string,
  interventionName?: string
): number | null {
  if (!context) return null;

  let score = 30; // Base score

  const lowerPillar = pillar?.toLowerCase() || '';
  const lowerIntervention = interventionName?.toLowerCase() || '';

  // Check if matches priority areas (+30)
  context.priorityAreas.forEach(area => {
    if (lowerPillar.includes(area) || lowerIntervention.includes(area)) {
      score += 30;
    }
  });

  // Check if matches active goals (+20)
  context.activeGoals?.forEach(goal => {
    if (lowerPillar.includes(goal.pillarCategory.toLowerCase())) {
      score += 20;
    }
  });

  // Boost for low scores in related areas (+20)
  if (context.lisPillarScores) {
    const pillarMap: Record<string, string> = {
      brain: 'cognitive',
      body: 'physical',
      balance: 'stress',
      beauty: 'nutrition',
    };
    const mappedPillar = pillarMap[lowerPillar] || lowerPillar;
    const pillarScore = context.lisPillarScores[mappedPillar as keyof typeof context.lisPillarScores];
    if (pillarScore && pillarScore < 60) {
      score += 20;
    }
  }

  return Math.min(score, 100);
}

function generateStaticPersonalization(
  context: UserHealthContext | null | undefined,
  pillar?: string,
  interventionName?: string
): string {
  if (!context) {
    return `This research on ${interventionName} provides evidence-based insights that may support your health journey.`;
  }

  const parts: string[] = [];

  // Priority area match
  const matchedArea = context.priorityAreas.find(area =>
    pillar?.toLowerCase().includes(area) || interventionName?.toLowerCase().includes(area)
  );
  if (matchedArea) {
    parts.push(`Based on your assessment results, ${matchedArea} is one of your focus areas.`);
  }

  // Goal match
  const matchedGoal = context.activeGoals?.find(g =>
    pillar?.toLowerCase().includes(g.pillarCategory.toLowerCase())
  );
  if (matchedGoal) {
    parts.push(`This directly supports your goal: "${matchedGoal.title}".`);
  }

  // LIS context
  if (context.lisScore && context.lisScore < 70) {
    parts.push(`With your current LIS score of ${Math.round(context.lisScore)}, interventions in this area could contribute to meaningful improvement.`);
  }

  if (parts.length === 0) {
    parts.push(`This research provides evidence-based insights on ${interventionName} that may support your overall wellness.`);
  }

  return parts.join(' ');
}

export default PersonalizedRelevance;
