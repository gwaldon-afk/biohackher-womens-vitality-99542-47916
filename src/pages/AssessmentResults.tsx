import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, Info, Brain, Heart, Activity, Sparkles } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAssessments } from "@/hooks/useAssessments";

const AssessmentResults = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getAssessment } = useAssessments();
  
  const state = location.state as {
    score: number;
    answers: Record<string, number>;
    assessmentName: string;
    assessmentDescription: string;
    scoringGuidance: any;
    scoreCategory: string;
    categoryDescription: string;
    pillar: string;
  };

  useEffect(() => {
    if (!state || !state.score) {
      navigate('/pillars');
    }
  }, [state, navigate]);

  if (!state || !symptomId) {
    return null;
  }

  const assessmentConfig = symptomId ? getAssessment(symptomId) : null;
  const { score, answers, assessmentName, scoringGuidance, scoreCategory, categoryDescription, pillar } = state;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'excellent':
        return 'bg-green-500';
      case 'good':
        return 'bg-blue-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'poor':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'excellent':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'good':
        return <TrendingUp className="h-8 w-8 text-blue-500" />;
      case 'fair':
        return <Info className="h-8 w-8 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="h-8 w-8 text-red-500" />;
      default:
        return <Info className="h-8 w-8" />;
    }
  };

  const getPillarIcon = (pillarName: string) => {
    switch (pillarName) {
      case 'brain':
        return <Brain className="h-6 w-6" />;
      case 'body':
        return <Activity className="h-6 w-6" />;
      case 'balance':
        return <Heart className="h-6 w-6" />;
      case 'beauty':
        return <Sparkles className="h-6 w-6" />;
      default:
        return <Activity className="h-6 w-6" />;
    }
  };

  // Calculate category breakdown
  const categoryScores = assessmentConfig?.questions.reduce((acc, q) => {
    const answer = answers[q.id];
    if (answer !== undefined) {
      if (!acc[q.category]) {
        acc[q.category] = { total: 0, count: 0 };
      }
      acc[q.category].total += answer;
      acc[q.category].count += 1;
    }
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const categoryAverages = Object.entries(categoryScores || {}).map(([category, data]) => ({
    category,
    score: data.total / data.count
  })).sort((a, b) => b.score - a.score);

  // Identify strengths and areas for improvement
  const strengths = categoryAverages.filter(c => c.score >= 75).map(c => c.category);
  const areasForImprovement = categoryAverages.filter(c => c.score < 60).map(c => c.category);

  const getRecommendations = () => {
    const recs = [];
    
    if (scoreCategory === 'poor' || scoreCategory === 'fair') {
      recs.push({
        title: 'Comprehensive Assessment',
        description: 'Consider consulting with a healthcare professional for a detailed evaluation and personalized treatment plan.',
        priority: 'high' as const
      });
    }

    areasForImprovement.forEach(area => {
      recs.push({
        title: `Focus on ${area}`,
        description: `This area shows the most room for improvement. Targeted interventions could significantly enhance your overall score.`,
        priority: 'high' as const
      });
    });

    if (scoreCategory === 'good' || scoreCategory === 'fair') {
      recs.push({
        title: 'Lifestyle Optimization',
        description: 'Small consistent changes in daily habits can lead to significant improvements over time.',
        priority: 'medium' as const
      });
    }

    if (strengths.length > 0) {
      recs.push({
        title: 'Maintain Your Strengths',
        description: `You're doing well in: ${strengths.join(', ')}. Continue these positive habits to maintain your progress.`,
        priority: 'low' as const
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/pillars')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Pillars
          </Button>

          {/* Overall Score Card */}
          <Card className="mb-8 overflow-hidden">
            <div className={`h-2 ${getCategoryColor(scoreCategory)}`} />
            <CardHeader className="text-center pb-4">
              <div className="flex items-center justify-center mb-4">
                {getPillarIcon(pillar)}
              </div>
              <CardTitle className="text-2xl mb-2">{assessmentName}</CardTitle>
              <p className="text-muted-foreground text-sm">{state.assessmentDescription}</p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex justify-center mb-4">
                {getCategoryIcon(scoreCategory)}
              </div>
              <div className="text-6xl font-bold mb-2">{Math.round(score)}</div>
              <Badge 
                variant="secondary" 
                className={`text-lg px-4 py-1 mb-4 ${getCategoryColor(scoreCategory)} text-white`}
              >
                {scoreCategory.charAt(0).toUpperCase() + scoreCategory.slice(1)}
              </Badge>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {categoryDescription}
              </p>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          {categoryAverages.length > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryAverages.map(({ category, score: catScore }) => (
                    <div key={category}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{category}</span>
                        <span className="text-muted-foreground">{Math.round(catScore)}/100</span>
                      </div>
                      <Progress value={catScore} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Detailed Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {strengths.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center text-green-600">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Strengths
                    </h3>
                    <ul className="space-y-2">
                      {strengths.map(strength => (
                        <li key={strength} className="flex items-start">
                          <span className="text-green-500 mr-2">•</span>
                          <span>{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {areasForImprovement.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center text-yellow-600">
                      <TrendingUp className="mr-2 h-5 w-5" />
                      Priority Focus Areas
                    </h3>
                    <ul className="space-y-2">
                      {areasForImprovement.map(area => (
                        <li key={area} className="flex items-start">
                          <span className="text-yellow-500 mr-2">•</span>
                          <span>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Recommendations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Personalized Action Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendations.map((rec, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      rec.priority === 'high' 
                        ? 'border-red-500 bg-red-50 dark:bg-red-950/20' 
                        : rec.priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                        : 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{rec.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {rec.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Scoring Guide */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Understanding Your Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    <h4 className="font-semibold">Excellent ({scoringGuidance.excellent.min}-{scoringGuidance.excellent.max})</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{scoringGuidance.excellent.description}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">Good ({scoringGuidance.good.min}-{scoringGuidance.good.max})</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{scoringGuidance.good.description}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-5 w-5 text-yellow-600" />
                    <h4 className="font-semibold">Fair ({scoringGuidance.fair.min}-{scoringGuidance.fair.max})</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{scoringGuidance.fair.description}</p>
                </div>
                
                <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <h4 className="font-semibold">Poor ({scoringGuidance.poor.min}-{scoringGuidance.poor.max})</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{scoringGuidance.poor.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/pillars')}
                  className="w-full"
                >
                  Explore Other Assessments
                </Button>
                {user && (
                  <Button 
                    onClick={() => navigate('/assessment-history')}
                    variant="outline"
                    className="w-full"
                  >
                    View Assessment History
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/biohacking-toolkit')}
                  variant="outline"
                  className="w-full"
                >
                  Explore Evidence-Based Solutions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
