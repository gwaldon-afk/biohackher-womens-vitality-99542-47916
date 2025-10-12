import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, Info, Brain, Heart, Activity, Sparkles, ExternalLink } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAssessments } from "@/hooks/useAssessments";
import { useQuery } from "@tanstack/react-query";
import { getAllToolkitItems, searchToolkitItemsBySymptoms } from "@/services/toolkitService";
import { searchProductsBySymptoms } from "@/services/productService";
import { generateUserRecommendations, saveUserRecommendations } from "@/services/recommendationEngine";
import { useToast } from "@/hooks/use-toast";
import EvidenceBadge from "@/components/EvidenceBadge";

const AssessmentResults = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { getAssessment } = useAssessments();
  const { toast } = useToast();
  const [savingRecommendations, setSavingRecommendations] = useState(false);
  
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

  // Extract symptoms from poor-scoring categories for recommendation matching
  const symptomTags = areasForImprovement.map(area => 
    area.toLowerCase().replace(/\s+/g, '-')
  );

  // Fetch toolkit recommendations based on symptoms
  const { data: toolkitItems, isLoading: loadingToolkit } = useQuery({
    queryKey: ['toolkit-recommendations', symptomTags],
    queryFn: () => symptomTags.length > 0 
      ? searchToolkitItemsBySymptoms(symptomTags)
      : getAllToolkitItems(),
    enabled: !!state
  });

  // Fetch product recommendations based on symptoms
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['product-recommendations', symptomTags],
    queryFn: () => searchProductsBySymptoms(symptomTags),
    enabled: symptomTags.length > 0
  });

  // Generate and save personalized recommendations for authenticated users
  useEffect(() => {
    if (user && toolkitItems && toolkitItems.length > 0 && !savingRecommendations) {
      setSavingRecommendations(true);
      generateUserRecommendations(user.id, toolkitItems, symptomTags, null)
        .then(recs => saveUserRecommendations(recs))
        .catch(error => {
          console.error('Error saving recommendations:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to save personalized recommendations"
          });
        })
        .finally(() => setSavingRecommendations(false));
    }
  }, [user, toolkitItems, symptomTags, savingRecommendations, toast]);

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

          {/* What Your Results Mean */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What Your Results Mean</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {scoreCategory === 'poor' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      Your assessment indicates significant challenges with {assessmentName.toLowerCase()} that are likely impacting your daily quality of life. 
                      These results suggest that professional support could be highly beneficial in developing targeted strategies for improvement.
                    </p>
                    {areasForImprovement.length > 0 && (
                      <p className="text-base leading-relaxed">
                        The areas showing the greatest impact are: <strong>{areasForImprovement.join(', ')}</strong>. 
                        Addressing these specific aspects could lead to substantial improvements in your overall wellbeing.
                      </p>
                    )}
                  </div>
                )}
                
                {scoreCategory === 'fair' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      Your results show that {assessmentName.toLowerCase()} is affecting various aspects of your life to a moderate degree. 
                      While you're managing some areas well, there's meaningful room for improvement that could significantly enhance your daily experience.
                    </p>
                    {areasForImprovement.length > 0 && (
                      <p className="text-base leading-relaxed">
                        Focus particularly on: <strong>{areasForImprovement.join(', ')}</strong>. 
                        Targeted interventions in these areas, combined with the toolkit recommendations below, can help you move toward optimal wellbeing.
                      </p>
                    )}
                    {strengths.length > 0 && (
                      <p className="text-base leading-relaxed">
                        You're already doing well with: <strong>{strengths.join(', ')}</strong>. 
                        These strengths can serve as a foundation as you work on other areas.
                      </p>
                    )}
                  </div>
                )}
                
                {scoreCategory === 'good' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      Your assessment shows that you're managing {assessmentName.toLowerCase()} well overall. 
                      You've developed effective strategies that are working for you, though there are still opportunities for optimization.
                    </p>
                    {strengths.length > 0 && (
                      <p className="text-base leading-relaxed">
                        Your particular strengths lie in: <strong>{strengths.join(', ')}</strong>. 
                        Maintaining these positive habits while addressing minor areas for improvement can help you reach excellent outcomes.
                      </p>
                    )}
                    {areasForImprovement.length > 0 && (
                      <p className="text-base leading-relaxed">
                        Small refinements in: <strong>{areasForImprovement.join(', ')}</strong> could elevate your results to the excellent range.
                      </p>
                    )}
                  </div>
                )}
                
                {scoreCategory === 'excellent' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      Outstanding results! You've developed highly effective strategies for managing {assessmentName.toLowerCase()}. 
                      Your approach is working exceptionally well, and you're experiencing optimal outcomes in this area of health.
                    </p>
                    {strengths.length > 0 && (
                      <p className="text-base leading-relaxed">
                        You excel particularly in: <strong>{strengths.join(', ')}</strong>. 
                        These successful strategies could be valuable templates for optimizing other areas of your health journey.
                      </p>
                    )}
                    <p className="text-base leading-relaxed">
                      Focus on maintaining these positive habits and consider exploring the evidence-based tools below to sustain and further enhance your wellbeing.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

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

          {/* Evidence-Based Solutions */}
          {symptomTags.length > 0 && (
            <>
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Recommended Toolkit Items</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Evidence-based biohacking tools tailored to your assessment results
                  </p>
                </CardHeader>
                <CardContent>
                  {loadingToolkit ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="border rounded-lg p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-5/6" />
                        </div>
                      ))}
                    </div>
                  ) : toolkitItems && toolkitItems.length > 0 ? (
                    <div className="space-y-4">
                      {toolkitItems.slice(0, 5).map((item) => (
                        <div 
                          key={item.id} 
                          className="border rounded-lg p-4 hover:border-primary transition-colors cursor-pointer"
                          onClick={() => navigate(`/${item.category.slug}?item=${item.slug}`)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{item.name}</h4>
                            {item.evidence_level && (
                              <EvidenceBadge level={item.evidence_level.charAt(0).toUpperCase() + item.evidence_level.slice(1) as "Gold" | "Silver" | "Bronze" | "Emerging"} />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                          {item.benefits && item.benefits.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-3">
                              {(item.benefits as string[]).slice(0, 3).map((benefit, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Button variant="outline" size="sm" className="w-full">
                            Learn More <ExternalLink className="ml-2 h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      {toolkitItems.length > 5 && (
                        <Button 
                          variant="link" 
                          onClick={() => navigate('/biohacking-toolkit')}
                          className="w-full"
                        >
                          View All {toolkitItems.length} Recommendations
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No specific recommendations found. Explore our full toolkit for general solutions.
                    </p>
                  )}
                </CardContent>
              </Card>

              {products && products.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Recommended Products</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Supplements and products that may support your health goals
                    </p>
                  </CardHeader>
                  <CardContent>
                    {loadingProducts ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <div key={i} className="border rounded-lg p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-full mb-2" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {products.slice(0, 3).map((product) => (
                          <div key={product.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold">{product.name}</h4>
                                {product.brand && (
                                  <p className="text-xs text-muted-foreground">{product.brand}</p>
                                )}
                              </div>
                              {product.evidence_level && (
                                <EvidenceBadge level={product.evidence_level.charAt(0).toUpperCase() + product.evidence_level.slice(1) as "Gold" | "Silver" | "Bronze" | "Emerging"} />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                            {product.benefits && (product.benefits as string[]).length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-3">
                                {(product.benefits as string[]).slice(0, 3).map((benefit, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => navigate('/shop')}
                              className="w-full"
                            >
                              View in Shop
                            </Button>
                          </div>
                        ))}
                        {products.length > 3 && (
                          <Button 
                            variant="link" 
                            onClick={() => navigate('/shop')}
                            className="w-full"
                          >
                            View All Products
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

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
                  Explore Full Toolkit
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
