import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, TrendingUp, CheckCircle, Lightbulb } from "lucide-react";
import { AssessmentSuggestion } from "@/utils/assessmentSuggestionEngine";

interface SuggestedAssessmentsCardProps {
  suggestions: AssessmentSuggestion[];
  onTakeAssessment: (assessmentId: string) => void;
}

export function SuggestedAssessmentsCard({ suggestions, onTakeAssessment }: SuggestedAssessmentsCardProps) {
  if (suggestions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Assessment Profile Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You've completed all recommended assessments based on your current health profile. 
            Continue tracking your progress and retake assessments periodically to monitor changes.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Recommended Additional Assessments
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          Based on your current results, these assessments would provide valuable additional insights
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.assessmentId}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{suggestion.assessmentName}</h4>
                    <Badge 
                      variant={suggestion.priority === 'high' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {suggestion.priority} priority
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {suggestion.pillar}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                    <span>{suggestion.reason}</span>
                  </p>
                  
                  <div className="bg-muted/30 rounded p-3 mb-3">
                    <p className="text-xs font-medium mb-1">What you'll learn:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {suggestion.expectedInsights.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={() => onTakeAssessment(suggestion.assessmentId)}
                  size="sm"
                  className="flex-shrink-0"
                >
                  Take Assessment
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
            <span>
              <strong>Tip:</strong> Taking these assessments will help us generate more accurate, 
              personalized protocol recommendations and identify root causes affecting multiple symptoms.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
