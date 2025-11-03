import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, CheckCircle2, AlertTriangle, Lightbulb, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSymptomName } from "@/utils/healthAnalysis";

interface PersonalizedInsightsSummaryProps {
  assessments: Array<{
    symptom_type: string;
    overall_score: number;
    score_category: string;
    primary_issues?: string[];
  }>;
}

export function PersonalizedInsightsSummary({ assessments }: PersonalizedInsightsSummaryProps) {
  const navigate = useNavigate();

  if (assessments.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Your Personalized Health Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Begin Your Health Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Complete your first assessment to receive personalized insights, identify your strengths, 
              and discover targeted areas for improvement.
            </p>
            <Button onClick={() => navigate('/pillars')} size="lg">
              Take Your First Assessment
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate overall wellness score
  const avgScore = assessments.reduce((sum, a) => sum + a.overall_score, 0) / assessments.length;
  
  // Categorize assessments
  const excellentAreas = assessments.filter(a => a.score_category === 'excellent');
  const goodAreas = assessments.filter(a => a.score_category === 'good');
  const fairAreas = assessments.filter(a => a.score_category === 'fair');
  const poorAreas = assessments.filter(a => a.score_category === 'poor');
  
  const strengths = [...excellentAreas, ...goodAreas].slice(0, 3);
  const focusAreas = [...poorAreas, ...fairAreas].slice(0, 3);

  // Detect patterns
  const allIssues = assessments.flatMap(a => a.primary_issues || []);
  const issueFrequency = allIssues.reduce((acc, issue) => {
    acc[issue] = (acc[issue] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const commonPattern = Object.entries(issueFrequency)
    .filter(([_, count]) => count > 1)
    .sort(([, a], [, b]) => b - a)[0];

  // Determine wellness status
  let statusColor = 'text-green-600';
  let statusText = 'Excellent';
  if (avgScore < 80) { statusColor = 'text-blue-600'; statusText = 'Good'; }
  if (avgScore < 65) { statusColor = 'text-amber-600'; statusText = 'Fair'; }
  if (avgScore < 50) { statusColor = 'text-red-600'; statusText = 'Needs Attention'; }

  // Recommended next step
  let nextStep = "Continue your excellent health practices and maintain consistency.";
  if (poorAreas.length > 0) {
    nextStep = `Focus on improving ${getSymptomName(poorAreas[0].symptom_type)} with targeted protocols.`;
  } else if (fairAreas.length > 0) {
    nextStep = `Work on optimizing ${getSymptomName(fairAreas[0].symptom_type)} to boost overall wellness.`;
  } else if (assessments.length < 5) {
    nextStep = "Complete additional assessments to build a comprehensive health profile.";
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Your Personalized Health Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Wellness Score */}
        <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Overall Wellness Score</p>
            <p className={`text-3xl font-bold ${statusColor}`}>
              {Math.round(avgScore)}/100
            </p>
            <Badge variant="outline" className="mt-2">
              {statusText}
            </Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Assessments Completed</p>
            <p className="text-2xl font-bold">{assessments.length}</p>
          </div>
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              Your Top Strengths
            </h4>
            <div className="space-y-2">
              {strengths.map((area) => (
                <div key={area.symptom_type} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {Math.round(area.overall_score)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {getSymptomName(area.symptom_type)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Focus Areas */}
        {focusAreas.length > 0 && (
          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              Areas for Improvement
            </h4>
            <div className="space-y-2">
              {focusAreas.map((area) => (
                <div key={area.symptom_type} className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    {Math.round(area.overall_score)}
                  </Badge>
                  <span className="text-muted-foreground">
                    {getSymptomName(area.symptom_type)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Pattern */}
        {commonPattern && (
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              Key Pattern Detected
            </h4>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">{commonPattern[0].replace(/-/g, ' ')}</strong> appears 
              across {commonPattern[1]} symptoms, suggesting this may be a key factor to address for 
              broader health improvements.
            </p>
          </div>
        )}

        {/* Recommended Next Step */}
        <div className="p-4 bg-background rounded-lg border">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Recommended Next Step
          </h4>
          <p className="text-sm text-muted-foreground mb-3">{nextStep}</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/pillars')}
          >
            View All Assessments
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
