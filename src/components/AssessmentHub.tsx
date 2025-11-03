import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Heart, Zap, Sparkles, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";

interface AssessmentStatus {
  id: string;
  name: string;
  pillar: string;
  completed: boolean;
  latestScore?: number;
  latestDate?: string;
  icon: any;
}

interface AssessmentHubProps {
  completedAssessments: Array<{
    symptom_type: string;
    overall_score: number;
    completed_at: string;
  }>;
}

const pillarIcons: Record<string, any> = {
  brain: Brain,
  body: Heart,
  balance: Zap,
  beauty: Sparkles
};

const availableAssessments: AssessmentStatus[] = [
  { id: 'cognitive-function', name: 'Cognitive Function', pillar: 'brain', completed: false, icon: Brain },
  { id: 'brain-fog', name: 'Brain Fog', pillar: 'brain', completed: false, icon: Brain },
  { id: 'sleep', name: 'Sleep Quality', pillar: 'brain', completed: false, icon: Clock },
  { id: 'body-composition', name: 'Body Composition', pillar: 'body', completed: false, icon: Heart },
  { id: 'energy-levels', name: 'Energy Levels', pillar: 'body', completed: false, icon: Zap },
  { id: 'physical-performance', name: 'Physical Performance', pillar: 'body', completed: false, icon: Heart },
  { id: 'hormone-symptoms', name: 'Hormone Symptoms', pillar: 'balance', completed: false, icon: Sparkles },
  { id: 'stress-assessment', name: 'Stress Assessment', pillar: 'balance', completed: false, icon: Zap },
];

export function AssessmentHub({ completedAssessments }: AssessmentHubProps) {
  const navigate = useNavigate();

  // Map completed assessments to available assessments
  const assessmentsWithStatus = availableAssessments.map(assessment => {
    const completed = completedAssessments.find(c => c.symptom_type === assessment.id);
    return {
      ...assessment,
      completed: !!completed,
      latestScore: completed?.overall_score,
      latestDate: completed?.completed_at
    };
  });

  const completedCount = assessmentsWithStatus.filter(a => a.completed).length;
  const totalCount = assessmentsWithStatus.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Assessment Hub</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Complete assessments to unlock personalized insights
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">{completedCount}/{totalCount}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessmentsWithStatus.map((assessment) => {
            const Icon = assessment.icon;
            return (
              <div 
                key={assessment.id}
                className="border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                onClick={() => navigate(assessment.completed ? `/assessment/${assessment.id}/results` : `/assessment/${assessment.id}`)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className="h-4 w-4 text-primary" />
                      <h4 className="font-semibold text-sm">{assessment.name}</h4>
                    </div>
                    <Badge variant="outline" className="text-xs mb-2">
                      {assessment.pillar}
                    </Badge>
                    {assessment.completed && assessment.latestScore && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground">
                          Score: <span className="font-semibold">{Math.round(assessment.latestScore)}/100</span>
                        </p>
                        {assessment.latestDate && (
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(assessment.latestDate), 'MMM d, yyyy')}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  {assessment.completed ? (
                    <Button size="sm" variant="outline" className="flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" />
                      View Results
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-shrink-0">
                      Take Assessment
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
