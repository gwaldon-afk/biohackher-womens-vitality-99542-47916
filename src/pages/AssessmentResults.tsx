import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, TrendingUp, CheckCircle2, AlertTriangle, Info, Brain, Heart, Activity, Sparkles, ExternalLink, Lock } from "lucide-react";
import Navigation from "@/components/Navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAssessments } from "@/hooks/useAssessments";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAllToolkitItems, searchToolkitItemsBySymptoms } from "@/services/toolkitService";
import { searchProductsBySymptoms } from "@/services/productService";
import { generateUserRecommendations, saveUserRecommendations } from "@/services/recommendationEngine";
import { useToast } from "@/hooks/use-toast";
import EvidenceBadge from "@/components/EvidenceBadge";
import { useAssessmentFlowStore } from "@/stores/assessmentFlowStore";
import { ProgressiveHealthOverview } from "@/components/ProgressiveHealthOverview";
import { ProgressiveHealthOverviewLocked } from "@/components/ProgressiveHealthOverviewLocked";
import { SymptomAssessment as SymptomAssessmentType } from "@/types/assessments";
import { generateProtocolFromSymptom, updateUserProfileAfterAssessment } from "@/services/assessmentProtocolService";
import { AssessmentAIAnalysisCard } from "@/components/AssessmentAIAnalysisCard";
import { ProtocolSelectionDialog } from "@/components/ProtocolSelectionDialog";
import { useProtocolRecommendations } from "@/hooks/useProtocolRecommendations";

const AssessmentResults = () => {
  const { symptomId } = useParams<{ symptomId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { getAssessment } = useAssessments();
  const { toast } = useToast();
  const [savingRecommendations, setSavingRecommendations] = useState(false);
  const [addingToPlan, setAddingToPlan] = useState(false);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [currentRecommendationId, setCurrentRecommendationId] = useState<string | null>(null);
  const [generatedProtocol, setGeneratedProtocol] = useState<any>(null);
  const { refetch: refetchRecommendations } = useProtocolRecommendations();
  
  const state = location.state as {
    score: number;
    answers: Record<string, number>;
    assessmentName: string;
    assessmentDescription: string;
    scoringGuidance: any;
    scoreCategory: string;
    categoryDescription: string;
    pillar: string;
    // New flow properties
    isMultiAssessmentFlow?: boolean;
    hasMoreAssessments?: boolean;
    nextAssessmentId?: string;
    sessionId?: string;
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
  
  const flowStore = useAssessmentFlowStore();
  const isMultiFlow = state.isMultiAssessmentFlow || false;
  const hasMore = state.hasMoreAssessments || false;
  const nextId = state.nextAssessmentId;
  const sessionId = state.sessionId;
  const isFirstAssessment = flowStore.completedIds.length === 1;
  
  // Fetch all assessments for progressive analysis (if user has completed 2+)
  const { data: allUserAssessments = [] } = useQuery({
    queryKey: ['user-assessments-for-flow', user?.id, flowStore.completedIds],
    queryFn: async () => {
      if (!user || flowStore.completedIds.length < 2) return [];
      
      const { data, error } = await supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .in('symptom_type', flowStore.completedIds)
        .order('completed_at', { ascending: false });
      
      if (error) throw error;
      
      // Get most recent assessment for each symptom type
      const uniqueAssessments = data?.reduce((acc: SymptomAssessmentType[], current) => {
        if (!acc.find(item => item.symptom_type === current.symptom_type)) {
          acc.push(current as SymptomAssessmentType);
        }
        return acc;
      }, []);
      
      return uniqueAssessments || [];
    },
    enabled: !!user && flowStore.completedIds.length >= 2,
  });
  
  const showProgressiveAnalysis = flowStore.completedIds.length >= 2;
  
  const handleContinueToNext = () => {
    if (!nextId) return;
    
    // Special routing for brain assessments
    if (nextId === "cognitive-performance" || nextId === "menopause-brain-health") {
      const context = nextId === "cognitive-performance" ? "performance" : "menopause";
      navigate(`/brain-assessment?context=${context}&pillar=brain`);
    } else {
      navigate(`/assessment/${nextId}`);
    }
  };

  const handleSaveAndExit = () => {
    flowStore.clearFlow();
    navigate('/pillars');
  };

  const handleViewProfile = () => {
    flowStore.clearFlow();
    navigate('/dashboard');
  };

  const handleSetUpProfile = () => {
    // Pass session ID to auth page for claiming assessments after signup
    navigate(`/auth?assessmentSession=${sessionId}`);
  };

  const handleContinueWithoutSaving = () => {
    if (hasMore && nextId) {
      handleContinueToNext();
    } else {
      flowStore.clearFlow();
      navigate('/pillars');
    }
  };

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

  // Generate symptom protocol structure (without saving)
  const generateSymptomProtocolStructure = (symptomType: string, category: string) => {
    const items: any[] = [];
    const symptomLower = symptomType.toLowerCase();

    const immediate: any[] = [];
    const foundation: any[] = [];
    const optimization: any[] = [];

    // Only generate for poor/fair scores
    if (category === 'poor' || category === 'fair') {
      // Energy-related
      if (symptomLower.includes('energy') || symptomLower.includes('fatigue')) {
        immediate.push({
          name: 'Strategic Rest Breaks',
          description: '5-minute breaks every 90 minutes to prevent energy crashes',
          category: 'immediate'
        });
        foundation.push({
          name: 'Energy Optimization',
          description: 'CoQ10 + B-Complex for mitochondrial support',
          dosage: 'CoQ10 100-200mg, B-Complex as directed',
          category: 'foundation'
        });
      }

      // Sleep-related
      if (symptomLower.includes('sleep') || symptomLower.includes('insomnia')) {
        foundation.push({
          name: 'Sleep Protocol',
          description: 'Magnesium + L-Theanine before bed for sleep quality',
          dosage: 'Mag 300mg, L-Theanine 200mg',
          category: 'foundation'
        });
      }

      // Mood/anxiety
      if (symptomLower.includes('mood') || symptomLower.includes('anxiety') || symptomLower.includes('stress')) {
        immediate.push({
          name: 'Breathwork Practice',
          description: '4-7-8 breathing technique - Inhale 4s, hold 7s, exhale 8s',
          category: 'immediate'
        });
        foundation.push({
          name: 'Stress Resilience',
          description: 'Ashwagandha for cortisol regulation',
          dosage: '300-600mg standardized extract',
          category: 'foundation'
        });
      }

      // Brain fog/cognitive
      if (symptomLower.includes('brain') || symptomLower.includes('cognitive') || symptomLower.includes('fog')) {
        foundation.push({
          name: 'Cognitive Support',
          description: 'Omega-3 + Lion\'s Mane for brain health',
          dosage: 'Omega-3 2g, Lion\'s Mane 500-1000mg',
          category: 'foundation'
        });
      }

      // Pain/inflammation
      if (symptomLower.includes('pain') || symptomLower.includes('inflammation') || symptomLower.includes('joint')) {
        foundation.push({
          name: 'Anti-Inflammatory Protocol',
          description: 'Curcumin + Omega-3 for inflammation',
          dosage: 'Curcumin 500mg (w/ black pepper), Omega-3 2g',
          category: 'foundation'
        });
      }
    }

    return { immediate, foundation, optimization };
  };

  const handleAddToPlan = async () => {
    if (!user || !symptomId) return;

    setAddingToPlan(true);
    try {
      const protocol = generateSymptomProtocolStructure(symptomId, scoreCategory);

      // Save to protocol_recommendations table
      const { data: recommendation, error } = await supabase
        .from('protocol_recommendations')
        .insert({
          user_id: user.id,
          source_assessment_id: symptomId,
          source_type: 'symptom',
          protocol_data: protocol as any,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setCurrentRecommendationId(recommendation.id);
      setGeneratedProtocol(protocol);
      setProtocolDialogOpen(true);

      toast({
        title: "Protocol Generated!",
        description: "Review your personalized recommendations and select what works for you.",
      });
    } catch (error: any) {
      console.error('Error generating protocol:', error);
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingToPlan(false);
    }
  };

  const handleProtocolSelection = async (selectedItems: any[]) => {
    if (!user || !currentRecommendationId) return;

    try {
      // Create protocol entry
      const { data: protocol, error: protocolError } = await supabase
        .from('protocols')
        .insert({
          user_id: user.id,
          name: `${symptomId} Management Protocol`,
          description: `Personalized protocol for ${symptomId} based on assessment`,
          source_recommendation_id: currentRecommendationId,
          source_type: 'symptom',
          is_active: true
        })
        .select()
        .single();

      if (protocolError) throw protocolError;

      // Map category to item_type
      const itemTypeMap: Record<string, 'habit' | 'supplement' | 'exercise' | 'diet' | 'therapy'> = {
        'immediate': 'habit',
        'foundation': 'supplement',
        'optimization': 'supplement'
      };

      // Insert selected protocol items
      const protocolItems = selectedItems.map(item => ({
        protocol_id: protocol.id,
        name: item.name,
        description: item.description,
        dosage: item.dosage || null,
        frequency: 'daily' as const,
        time_of_day: ['morning'],
        item_type: itemTypeMap[item.category] || 'supplement',
        category: item.category,
        display_order: 0
      }));

      const { error: itemsError } = await supabase
        .from('protocol_items')
        .insert(protocolItems);

      if (itemsError) throw itemsError;

      // Update recommendation status
      const allSelected = selectedItems.length === (
        generatedProtocol.immediate.length + 
        generatedProtocol.foundation.length + 
        generatedProtocol.optimization.length
      );

      const { error: updateError } = await supabase
        .from('protocol_recommendations')
        .update({
          status: allSelected ? 'accepted' : 'partially_accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', currentRecommendationId);

      if (updateError) throw updateError;

      await refetchRecommendations();
      await updateUserProfileAfterAssessment(user.id, 'symptom', { symptomType: symptomId, score });

      toast({
        title: "Protocol Added!",
        description: `${selectedItems.length} items added to your plan`,
      });

      setProtocolDialogOpen(false);
      navigate('/my-protocol');
    } catch (error: any) {
      console.error('Error saving protocol:', error);
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

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

          {/* Progressive Health Analysis - Shows after 2+ assessments */}
          {showProgressiveAnalysis && (
            <div className="mb-8">
              {user ? (
                <ProgressiveHealthOverview
                  assessments={allUserAssessments}
                  totalInFlow={flowStore.assessmentQueue.length}
                  onContinueToNext={hasMore ? handleContinueToNext : undefined}
                  onViewFullAnalysis={() => navigate('/pillars?view=history&tab=overview')}
                />
              ) : (
                <ProgressiveHealthOverviewLocked
                  assessmentCount={flowStore.completedIds.length}
                  onCreateProfile={handleSetUpProfile}
                  onContinueWithout={handleContinueWithoutSaving}
                />
              )}
            </div>
          )}

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
                          {t('assessmentResults.toolkit.viewAll', { count: toolkitItems.length })}
                        </Button>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t('assessmentResults.toolkit.noResults')}
                    </p>
                  )}
                </CardContent>
              </Card>

              {products && products.length > 0 && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>{t('assessmentResults.recommendedProducts')}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {t('assessmentResults.products.description')}
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
                              {t('assessmentResults.products.viewInShop')}
                            </Button>
                          </div>
                        ))}
                        {products.length > 3 && (
                          <Button 
                            variant="link" 
                            onClick={() => navigate('/shop')}
                            className="w-full"
                          >
                            {t('assessmentResults.products.viewAll')}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* AI Analysis Card */}
          <AssessmentAIAnalysisCard
            assessmentType="symptom"
            assessmentId={symptomId || ''}
            score={score}
            scoreCategory={scoreCategory}
            answers={answers}
            autoGenerate={true}
          />

          {/* Add to My Plan CTA for authenticated users */}
          {user && (scoreCategory === 'poor' || scoreCategory === 'fair') && (
            <Card className="mb-8 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Add to My Plan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Convert these insights into actionable protocol items tailored to address your {symptomId} symptoms.
                </p>
                <Button 
                  onClick={handleAddToPlan}
                  disabled={addingToPlan}
                  size="lg"
                  className="w-full"
                >
                  {addingToPlan ? 'Generating Protocol...' : 'Review & Add to My Plan'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Unlock More Features CTA for Guest Users */}
          {!user && (
            <Card className="mb-8 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">{t('assessmentResults.guestCTA.title')}</CardTitle>
                <p className="text-muted-foreground">
                  {t('assessmentResults.guestCTA.subtitle')}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('assessmentResults.guestCTA.features.history.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('assessmentResults.guestCTA.features.history.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('assessmentResults.guestCTA.features.protocols.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('assessmentResults.guestCTA.features.protocols.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('assessmentResults.guestCTA.features.metrics.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('assessmentResults.guestCTA.features.metrics.description')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">{t('assessmentResults.guestCTA.features.assistant.title')}</p>
                      <p className="text-sm text-muted-foreground">{t('assessmentResults.guestCTA.features.assistant.description')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={() => navigate('/auth?mode=signup')}
                    className="w-full"
                    size="lg"
                  >
                    {t('assessmentResults.guestCTA.createAccount')}
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth?mode=login')}
                    variant="outline"
                    className="w-full"
                  >
                    {t('assessmentResults.guestCTA.signIn')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dynamic CTAs based on flow context */}
          {isMultiFlow && hasMore && (
            <>
              {user ? (
                // Authenticated user - show continue options
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5">
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold">Ready for your next assessment?</h3>
                    <p className="text-muted-foreground">
                      Continue building your complete health profile
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button size="lg" onClick={handleContinueToNext}>
                        Continue to Next Assessment
                      </Button>
                      <Button size="lg" variant="outline" onClick={handleSaveAndExit}>
                        Save & Return Later
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                // Guest user - show profile creation prompt
                <Card className="p-8 border-2 border-primary/50 bg-gradient-to-br from-primary/5 via-background to-primary/10">
                  <div className="text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
                      {isFirstAssessment ? (
                        <Sparkles className="w-8 h-8 text-primary" />
                      ) : (
                        <Lock className="w-8 h-8 text-primary" />
                      )}
                    </div>
                    
                    {/* Headline */}
                    <h2 className="text-2xl font-bold mb-3">
                      {isFirstAssessment 
                        ? "Great start! Ready to continue?" 
                        : "Save Your Progress & Continue"}
                    </h2>
                    
                    {/* Key message */}
                    <p className="text-lg text-muted-foreground mb-6 max-w-xl mx-auto">
                      {isFirstAssessment 
                        ? "To help build a full picture, let's save this to your profile before we continue." 
                        : "Set up your profile to save all your assessments and get personalized insights."}
                    </p>

                    {/* Value props - Compact version for first assessment */}
                    {isFirstAssessment ? (
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Save your results</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Track over time</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                          <span>Get insights</span>
                        </div>
                      </div>
                    ) : (
                      // Full value props for subsequent assessments
                      <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
                        <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                          <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-semibold mb-1">Track All Assessments</div>
                            <div className="text-sm text-muted-foreground">
                              Save all your results in one place
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                          <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-semibold mb-1">Personalized Insights</div>
                            <div className="text-sm text-muted-foreground">
                              Get AI-powered health recommendations
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                          <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                          <div>
                            <div className="font-semibold mb-1">Build Your Protocol</div>
                            <div className="text-sm text-muted-foreground">
                              Create a personalized action plan
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CTAs */}
                    <div className="space-y-3">
                      <Button
                        size="lg"
                        onClick={handleSetUpProfile}
                        className="text-lg px-8 py-6 h-auto w-full sm:w-auto min-w-[200px]"
                      >
                        {isFirstAssessment ? "Create Your Profile" : "Save & Continue"}
                      </Button>
                      
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Sparkles className="w-4 h-4" />
                        <span>Just your email • No payment required</span>
                      </div>
                      
                      <Button
                        variant="ghost"
                        onClick={handleContinueWithoutSaving}
                        className="w-full sm:w-auto text-muted-foreground"
                      >
                        Continue without saving
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {isMultiFlow && !hasMore && (
            // Last assessment - show completion
            <Card className="p-6 bg-gradient-to-r from-green-500/10 to-green-500/5">
              <div className="text-center space-y-4">
                <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                <h3 className="text-2xl font-semibold">Assessment Series Complete!</h3>
                <p className="text-muted-foreground">
                  You've completed all recommended assessments for this theme
                </p>
                <Button size="lg" onClick={handleViewProfile}>
                  View Your Complete Profile
                </Button>
              </div>
            </Card>
          )}

          {!isMultiFlow && (
            // Single assessment (current behavior)
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
          )}
        </div>
      </div>

      {/* Protocol Selection Dialog */}
      {generatedProtocol && (
        <ProtocolSelectionDialog
          open={protocolDialogOpen}
          onOpenChange={setProtocolDialogOpen}
          protocol={generatedProtocol}
          onSave={handleProtocolSelection}
          onCancel={() => setProtocolDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default AssessmentResults;
