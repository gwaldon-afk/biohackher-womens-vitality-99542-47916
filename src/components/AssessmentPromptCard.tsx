import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight, Sparkles, Utensils, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface AssessmentStatus {
  lis_completed: boolean;
  nutrition_completed: boolean;
  hormone_completed: boolean;
}

const ASSESSMENTS = [
  {
    key: 'lis' as const,
    name: 'LIS Assessment',
    description: 'Discover your Biological Age',
    icon: Sparkles,
    route: '/lis-assessment',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    key: 'nutrition' as const,
    name: 'Longevity Nutrition',
    description: 'Discover your Metabolic Age',
    icon: Utensils,
    route: '/longevity-nutrition',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    key: 'hormone' as const,
    name: 'Hormone Compass',
    description: 'Discover your Hormone Age',
    icon: Heart,
    route: '/menomap/assessment',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
];

export function AssessmentPromptCard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: progress, isLoading } = useQuery({
    queryKey: ['assessment-progress', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('lis_completed, nutrition_completed, hormone_completed')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching assessment progress:', error);
        return null;
      }
      
      return data as AssessmentStatus | null;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return null;
  }

  // Check completion status for each assessment
  const getCompletionStatus = (key: 'lis' | 'nutrition' | 'hormone'): boolean => {
    if (!progress) return false;
    
    switch (key) {
      case 'lis': return progress.lis_completed || false;
      case 'nutrition': return progress.nutrition_completed || false;
      case 'hormone': return progress.hormone_completed || false;
      default: return false;
    }
  };

  const incompleteAssessments = ASSESSMENTS.filter(a => !getCompletionStatus(a.key));
  const completedCount = ASSESSMENTS.length - incompleteAssessments.length;

  // All assessments completed - don't show the card
  if (incompleteAssessments.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Complete Your Health Profile
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Take remaining assessments to unlock your full personalized 90-day plan
            </p>
          </div>
          <Badge variant="secondary">
            {completedCount}/3 Complete
          </Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {ASSESSMENTS.map((assessment) => {
            const isCompleted = getCompletionStatus(assessment.key);
            const Icon = assessment.icon;

            return (
              <div
                key={assessment.key}
                className={`relative p-4 rounded-lg border transition-all ${
                  isCompleted 
                    ? 'bg-primary/5 border-primary/30' 
                    : 'bg-background border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer'
                }`}
                onClick={() => !isCompleted && navigate(assessment.route)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${assessment.bgColor}`}>
                    <Icon className={`h-5 w-5 ${assessment.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{assessment.name}</span>
                      {isCompleted && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {assessment.description}
                    </p>
                  </div>
                  {!isCompleted && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {incompleteAssessments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              onClick={() => navigate(incompleteAssessments[0].route)}
              className="w-full"
            >
              Start {incompleteAssessments[0].name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
