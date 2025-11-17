import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, LucideIcon } from 'lucide-react';
import { generateNutritionPillarAnalysis } from '@/utils/nutritionPillarAnalysisGenerator';

interface NutritionPillarAnalysisCardProps {
  pillarName: string;
  score: number;
  maxScore: number;
  percentage: number;
  status: 'excellent' | 'good' | 'needs-improvement' | 'critical';
  icon: LucideIcon;
  color: string;
  assessmentData: any;
  defaultOpen?: boolean;
}

export const NutritionPillarAnalysisCard = ({
  pillarName,
  score,
  maxScore,
  percentage,
  status,
  icon: Icon,
  color,
  assessmentData,
  defaultOpen = false,
}: NutritionPillarAnalysisCardProps) => {
  
  const getScoreLabel = (status: string) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'needs-improvement': return 'Needs Work';
      case 'critical': return 'Critical';
      default: return 'Fair';
    }
  };

  const getScoreColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs-improvement': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'needs-improvement': return 'outline';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const analysis = generateNutritionPillarAnalysis(pillarName, assessmentData, score);

  return (
    <Collapsible defaultOpen={defaultOpen}>
      <Card className="border-l-4 hover:shadow-md transition-shadow" style={{ borderLeftColor: color }}>
        <CollapsibleTrigger className="w-full">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-3 rounded-lg bg-secondary/50">
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{pillarName}</h3>
                    <Badge variant={getBadgeVariant(status)} className="ml-auto">
                      {getScoreLabel(status)}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mb-2">
                    <Progress value={percentage} className="flex-1" />
                    <span className={`text-sm font-medium ${getScoreColor(status)}`}>
                      {score}/{maxScore}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform ui-expanded:rotate-180" />
              </div>
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="px-6 pb-6 pt-0 space-y-4">
            {/* Impact Statement */}
            <div className="bg-secondary/30 p-4 rounded-lg border-l-2" style={{ borderLeftColor: color }}>
              <p className="text-sm font-medium text-foreground">{analysis.impactStatement}</p>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Evidence-Based Recommendations
              </h4>
              <ul className="space-y-2">
                {analysis.recommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground pl-4 border-l-2 border-secondary">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Wins */}
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
              <h4 className="text-sm font-semibold mb-2 text-primary">Quick Wins - Start Today</h4>
              <ul className="space-y-1.5">
                {analysis.quickWins.map((win, idx) => (
                  <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-primary font-bold mt-0.5">•</span>
                    <span>{win}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};
