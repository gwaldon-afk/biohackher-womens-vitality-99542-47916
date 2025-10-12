import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    
    // Generate category-specific recommendations based on areas for improvement
    areasForImprovement.forEach(area => {
      const areaLower = area.toLowerCase();
      
      // Memory-related recommendations
      if (areaLower.includes('memory')) {
        recs.push({
          title: t('assessmentResults.recommendations.memory.title'),
          description: t('assessmentResults.recommendations.memory.description'),
          priority: 'high' as const
        });
      }
      
      // Focus/Attention recommendations
      if (areaLower.includes('focus') || areaLower.includes('attention') || areaLower.includes('concentration')) {
        recs.push({
          title: t('assessmentResults.recommendations.focus.title'),
          description: t('assessmentResults.recommendations.focus.description'),
          priority: 'high' as const
        });
      }
      
      // Anxiety/Stress recommendations
      if (areaLower.includes('anxiety') || areaLower.includes('stress') || areaLower.includes('worry') || areaLower.includes('tension')) {
        recs.push({
          title: t('assessmentResults.recommendations.anxiety.title'),
          description: t('assessmentResults.recommendations.anxiety.description'),
          priority: 'high' as const
        });
      }
      
      // Mood/Emotional recommendations
      if (areaLower.includes('mood') || areaLower.includes('emotion') || areaLower.includes('feeling')) {
        recs.push({
          title: t('assessmentResults.recommendations.mood.title'),
          description: t('assessmentResults.recommendations.mood.description'),
          priority: 'high' as const
        });
      }
      
      // Sleep recommendations
      if (areaLower.includes('sleep') || areaLower.includes('rest') || areaLower.includes('fatigue')) {
        recs.push({
          title: t('assessmentResults.recommendations.sleep.title'),
          description: t('assessmentResults.recommendations.sleep.description'),
          priority: 'high' as const
        });
      }
      
      // Energy recommendations
      if (areaLower.includes('energy') || areaLower.includes('vitality') || areaLower.includes('tiredness')) {
        recs.push({
          title: t('assessmentResults.recommendations.energy.title'),
          description: t('assessmentResults.recommendations.energy.description'),
          priority: 'high' as const
        });
      }
      
      // Physical/Pain recommendations  
      if (areaLower.includes('pain') || areaLower.includes('physical') || areaLower.includes('discomfort') || areaLower.includes('mobility')) {
        recs.push({
          title: t('assessmentResults.recommendations.pain.title'),
          description: t('assessmentResults.recommendations.pain.description'),
          priority: 'high' as const
        });
      }
      
      // Cognitive/Processing recommendations
      if (areaLower.includes('processing') || areaLower.includes('thinking') || areaLower.includes('clarity') || areaLower.includes('fog')) {
        recs.push({
          title: t('assessmentResults.recommendations.cognitive.title'),
          description: t('assessmentResults.recommendations.cognitive.description'),
          priority: 'high' as const
        });
      }
    });

    // Professional support recommendation for poor/fair scores
    if (scoreCategory === 'poor' || scoreCategory === 'fair') {
      recs.push({
        title: t('assessmentResults.recommendations.professional.title'),
        description: t('assessmentResults.recommendations.professional.description'),
        priority: 'high' as const
      });
    }

    // Maintenance recommendation for strengths
    if (strengths.length > 0) {
      recs.push({
        title: t('assessmentResults.recommendations.maintain.title'),
        description: t('assessmentResults.recommendations.maintain.description', { strengths: strengths.join(', ') }),
        priority: 'medium' as const
      });
    }

    // If no specific recs were added, provide general guidance
    if (recs.length === 0) {
      recs.push({
        title: t('assessmentResults.recommendations.general.title'),
        description: t('assessmentResults.recommendations.general.description'),
        priority: 'medium' as const
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

  // Generate and save personalised recommendations for authenticated users
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
            description: t('assessmentResults.errors.saveFailed')
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
            {t('assessmentResults.backToPillars')}
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
                {t(`assessmentResults.categories.${scoreCategory}`)}
              </Badge>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {categoryDescription}
              </p>
            </CardContent>
          </Card>

          {/* What Your Results Mean */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('assessmentResults.whatResultsMean')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {scoreCategory === 'poor' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      {t('assessmentResults.categoryDescriptions.poor', { assessmentName: assessmentName.toLowerCase() })}
                    </p>
                    {areasForImprovement.length > 0 && (
                      <p className="text-base leading-relaxed">
                        {t('assessmentResults.categoryDescriptions.poorAreas', { areas: areasForImprovement.join(', ') })}
                      </p>
                    )}
                  </div>
                )}
                
                {scoreCategory === 'fair' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      {t('assessmentResults.categoryDescriptions.fair', { assessmentName: assessmentName.toLowerCase() })}
                    </p>
                    {areasForImprovement.length > 0 && (
                      <p className="text-base leading-relaxed">
                        {t('assessmentResults.categoryDescriptions.fairFocus', { areas: areasForImprovement.join(', ') })}
                      </p>
                    )}
                    {strengths.length > 0 && (
                      <p className="text-base leading-relaxed">
                        {t('assessmentResults.categoryDescriptions.fairStrengths', { strengths: strengths.join(', ') })}
                      </p>
                    )}
                  </div>
                )}
                
                {scoreCategory === 'good' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      {t('assessmentResults.categoryDescriptions.good', { assessmentName: assessmentName.toLowerCase() })}
                    </p>
                    {strengths.length > 0 && (
                      <p className="text-base leading-relaxed">
                        {t('assessmentResults.categoryDescriptions.goodStrengths', { strengths: strengths.join(', ') })}
                      </p>
                    )}
                    {areasForImprovement.length > 0 && (
                      <p className="text-base leading-relaxed">
                        {t('assessmentResults.categoryDescriptions.goodAreas', { areas: areasForImprovement.join(', ') })}
                      </p>
                    )}
                  </div>
                )}
                
                {scoreCategory === 'excellent' && (
                  <div className="space-y-4">
                    <p className="text-base leading-relaxed">
                      {t('assessmentResults.categoryDescriptions.excellent', { assessmentName: assessmentName.toLowerCase() })}
                    </p>
                    {strengths.length > 0 && (
                      <p className="text-base leading-relaxed">
                        {t('assessmentResults.categoryDescriptions.excellentStrengths', { strengths: strengths.join(', ') })}
                      </p>
                    )}
                    <p className="text-base leading-relaxed">
                      {t('assessmentResults.categoryDescriptions.excellentMaintain')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Detailed Analysis */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('assessmentResults.detailedAnalysis')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {strengths.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center text-green-600">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      {t('assessmentResults.strengths')}
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
                      {t('assessmentResults.priorityFocusAreas')}
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

          {/* Personalised Recommendations */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{t('assessmentResults.personalisedActionPlan')}</CardTitle>
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
                            {t(`assessmentResults.priority.${rec.priority}`)}
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
              <CardTitle>{t('assessmentResults.understandingYourScore')}</CardTitle>
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
                  <CardTitle>{t('assessmentResults.recommendedToolkitItems')}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {t('assessmentResults.toolkit.description')}
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
                            {t('assessmentResults.toolkit.learnMore')} <ExternalLink className="ml-2 h-3 w-3" />
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

          {/* Unlock More Features CTA for Guest Users */}
          {!user && (
            <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">Track Your Progress & Unlock Full Analysis</CardTitle>
                <p className="text-muted-foreground">
                  You've completed one assessment. Create a free account to unlock:
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Save Your Assessment History</p>
                      <p className="text-sm text-muted-foreground">Track changes over time and see your progress</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Personalised Protocol Recommendations</p>
                      <p className="text-sm text-muted-foreground">Get AI-powered insights tailored to your results</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Track Multiple Health Metrics</p>
                      <p className="text-sm text-muted-foreground">Monitor your journey across all health pillars</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Access Your Health Assistant</p>
                      <p className="text-sm text-muted-foreground">Get personalised guidance and recommendations</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/auth?mode=signup')}
                    className="w-full"
                    size="lg"
                  >
                    Create Free Account
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth?mode=login')}
                    variant="outline"
                    className="w-full"
                  >
                    Already have an account? Sign In
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle>{t('assessmentResults.nextSteps')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={() => navigate('/pillars')}
                  className="w-full"
                >
                  {t('assessmentResults.nextStepsButtons.exploreAssessments')}
                </Button>
                {user && (
                  <Button 
                    onClick={() => navigate('/assessment-history')}
                    variant="outline"
                    className="w-full"
                  >
                    {t('assessmentResults.nextStepsButtons.viewHistory')}
                  </Button>
                )}
                <Button 
                  onClick={() => navigate('/biohacking-toolkit')}
                  variant="outline"
                  className="w-full"
                >
                  {t('assessmentResults.nextStepsButtons.exploreToolkit')}
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
