import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Lock, TrendingUp, Activity, Brain, Heart, Users, Moon, AlertCircle, TrendingDown, Mail, Share2, Target, Home, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import LISInputForm from '@/components/LISInputForm';
import FirstTimeDailyScoreWelcome from '@/components/FirstTimeDailyScoreWelcome';
import { useLISData } from '@/hooks/useLISData';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { LISRadarChart, getScoreColor, getScoreCategory } from '@/components/LISRadarChart';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState, useMemo } from 'react';
import { AssessmentAIAnalysisCard } from '@/components/AssessmentAIAnalysisCard';
import { useProtocolGeneration } from '@/hooks/useProtocolGeneration';
import { useProtocols } from '@/hooks/useProtocols';
import { LISPillarAnalysisCard } from '@/components/LISPillarAnalysisCard';
import { generatePillarAnalysis } from '@/utils/pillarAnalysisGenerator';
import { EmailShareDialog } from '@/components/EmailShareDialog';
import { ProtocolSelectionDialog } from '@/components/ProtocolSelectionDialog';
import { useProtocolRecommendations } from '@/hooks/useProtocolRecommendations';
import { CreateGoalFromAssessmentDialog } from '@/components/goals/CreateGoalFromAssessmentDialog';
import ShopYourProtocolButton from '@/components/ShopYourProtocolButton';
import { MethodologyDisclaimer } from '@/components/assessment/MethodologyDisclaimer';
import { InlineProtocolPreview } from '@/components/assessment/InlineProtocolPreview';

const LISResults = () => {
  const navigate = useNavigate();
  const { t, ready } = useTranslation();
  const { user, loading } = useAuth();
  const [searchParams] = useSearchParams();
  const isGuest = !user;
  const score = parseFloat(searchParams.get('score') || '0');
  const urlAge = searchParams.get('age');
  const lisData = useLISData();
  const { toast } = useToast();
  const { generateProtocolFromAssessments, loading: protocolGenerating } = useProtocolGeneration();
  const { protocols, loading: protocolsLoading } = useProtocols();
  
  // Check if this is a new baseline assessment
  const isNewBaseline = searchParams.get('isNewBaseline') === 'true';
  const urlPillarScoresParam = searchParams.get('pillarScores');
  const urlPillarScores = urlPillarScoresParam ? JSON.parse(decodeURIComponent(urlPillarScoresParam)) : null;
  
  // State for baseline data
  const [baselineData, setBaselineData] = useState<any>(null);
  const [chronologicalAge, setChronologicalAge] = useState<number>(
    urlAge ? parseInt(urlAge) : 0
  );
  const [protocolGenerated, setProtocolGenerated] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [protocolDialogOpen, setProtocolDialogOpen] = useState(false);
  const [currentRecommendationId, setCurrentRecommendationId] = useState<string | null>(null);
  const [generatedProtocol, setGeneratedProtocol] = useState<any>(null);
  const [generatingProtocol, setGeneratingProtocol] = useState(false);
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const { refetch: refetchRecommendations } = useProtocolRecommendations();
  
  // Check if user has an active protocol
  const hasActiveProtocol = protocols && protocols.length > 0;

  // Fetch baseline assessment data when isNewBaseline is true
  useEffect(() => {
    if (isNewBaseline && user) {
      const fetchBaseline = async () => {
        const { data, error } = await supabase
          .from('daily_scores')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_baseline', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (data && !error) {
          setBaselineData(data);
          setChronologicalAge(data.user_chronological_age || 0);
        }
      };
      fetchBaseline();
    }
  }, [isNewBaseline, user]);

  // Generate LIS-based protocol from pillar scores
  const generateLISProtocol = (pillarScores: any) => {
    // Sort pillars by score to identify areas needing most improvement
    const sortedPillars = Object.entries(pillarScores)
      .map(([name, score]) => ({ name, score: score as number }))
      .sort((a, b) => a.score - b.score);

    const immediate: any[] = [];
    const foundation: any[] = [];
    const optimization: any[] = [];

    // Add items based on lowest-scoring pillars
    sortedPillars.forEach((pillar, index) => {
      if (index === 0) { // Lowest scoring pillar - immediate actions
        if (pillar.name === 'sleep') {
          immediate.push({ name: 'Magnesium Glycinate', description: 'Supports deep sleep and relaxation', dosage: '400mg before bed', category: 'immediate' });
          immediate.push({ name: 'Sleep Hygiene Protocol', description: 'Cool room (65-68°F), complete darkness, no screens 1hr before bed', category: 'immediate' });
        } else if (pillar.name === 'stress') {
          immediate.push({ name: 'Ashwagandha', description: 'Adaptogen for cortisol regulation', dosage: '300mg twice daily', category: 'immediate' });
          immediate.push({ name: 'Daily Breathwork', description: '5 minutes box breathing (4-4-4-4)', category: 'immediate' });
        } else if (pillar.name === 'activity') {
          immediate.push({ name: 'Daily Movement', description: 'Minimum 30 minutes moderate activity', category: 'immediate' });
          immediate.push({ name: 'Strength Training', description: '2-3x per week, compound movements', category: 'immediate' });
        } else if (pillar.name === 'nutrition') {
          immediate.push({ name: 'Omega-3', description: 'EPA/DHA for inflammation', dosage: '2000mg daily', category: 'immediate' });
          immediate.push({ name: 'Anti-Inflammatory Diet', description: 'Focus on vegetables, healthy fats, clean protein', category: 'immediate' });
        } else if (pillar.name === 'social') {
          immediate.push({ name: 'Social Connection', description: 'Schedule 2-3 meaningful interactions per week', category: 'immediate' });
        } else if (pillar.name === 'cognitive') {
          immediate.push({ name: 'Cognitive Training', description: '15 minutes daily learning or puzzles', category: 'immediate' });
        }
      }

      if (pillar.score < 60) { // Foundation for any pillar scoring below 60
        foundation.push({ 
          name: `${pillar.name.charAt(0).toUpperCase() + pillar.name.slice(1)} Foundation Protocol`, 
          description: `Comprehensive support for ${pillar.name} optimization`,
          category: 'foundation'
        });
      }
    });

    // Optimization items for overall longevity
    optimization.push({ name: 'NAD+ Precursor (NMN)', description: 'Cellular energy and repair', dosage: '250-500mg daily', category: 'optimization' });
    optimization.push({ name: 'Resveratrol', description: 'Sirtuin activation for longevity', dosage: '500mg daily', category: 'optimization' });

    return { immediate, foundation, optimization };
  };

  const handleGenerateProtocol = async () => {
    if (!user) return;

    try {
      setGeneratingProtocol(true);
      const protocol = generateLISProtocol(pillarScores);
      
      // Save to protocol_recommendations table
      const { data: recommendation, error } = await supabase
        .from('protocol_recommendations')
        .insert({
          user_id: user.id,
          source_assessment_id: 'lis-baseline',
          source_type: 'lis',
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
        title: t('lisResults.toast.protocolGenerated'),
        description: t('lisResults.toast.protocolGeneratedDesc'),
      });
    } catch (error: any) {
      console.error('Error generating protocol:', error);
      toast({
        title: t('lisResults.toast.generationFailed'),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setGeneratingProtocol(false);
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
          name: 'LIS-Based Longevity Protocol',
          description: 'Personalized protocol based on your Longevity Impact Score assessment',
          source_recommendation_id: currentRecommendationId,
          source_type: 'lis',
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

      toast({
        title: t('lisResults.toast.protocolAdded'),
        description: t('lisResults.toast.protocolAddedDesc', { count: selectedItems.length }),
      });

      setProtocolDialogOpen(false);
      navigate('/my-protocol');
    } catch (error: any) {
      console.error('Error saving protocol:', error);
      toast({
        title: t('lisResults.toast.saveFailed'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Auto-load assessment data if URL parameters are missing
  useEffect(() => {
    const loadMissingAssessmentData = async () => {
      // Wait for auth to finish loading before making decisions
      if (loading) {
        console.log('Auth still loading, waiting...');
        return;
      }
      
      // Only run if URL params are missing (score is 0 and no pillar scores)
      if (score === 0 && !urlPillarScores) {
        if (user) {
          // Fetch from database for logged-in users
          const { data, error } = await supabase
            .from('daily_scores')
            .select('*')
            .eq('user_id', user.id)
            .eq('is_baseline', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (data && !error) {
            const pillarScores = {
              sleep: data.sleep_score,
              stress: data.stress_score,
              activity: data.physical_activity_score,
              nutrition: data.nutrition_score,
              social: data.social_connections_score,
              cognitive: data.cognitive_engagement_score
            };
            
            navigate(
              `/lis-results?score=${data.longevity_impact_score}&pillarScores=${encodeURIComponent(JSON.stringify(pillarScores))}&isNewBaseline=true`,
              { replace: true }
            );
          } else {
            toast({
              title: t('lisResults.toast.noAssessment'),
              description: t('lisResults.toast.noAssessmentDesc'),
            });
            navigate('/guest-lis-assessment');
          }
        } else {
          // Handle guest users
          const sessionId = localStorage.getItem('lis_guest_session_id');
          if (sessionId) {
            // Rehydrate from the guest assessment record and redirect back to /lis-results with URL params.
            const { data: guestAssessment, error } = await supabase
              .from('guest_lis_assessments')
              .select('*')
              .eq('session_id', sessionId)
              .maybeSingle();

            if (error || !guestAssessment) {
              toast({
                title: t('lisResults.toast.assessmentNotFound'),
                description: t('lisResults.toast.assessmentNotFoundDesc'),
              });
              navigate('/guest-lis-assessment');
              return;
            }

            const briefResults: any = (guestAssessment as any).brief_results;
            const assessmentData: any = (guestAssessment as any).assessment_data;
            const ps: any = briefResults?.pillarScores ?? {};

            const normalizedPillarScores = {
              sleep: ps.sleep ?? ps.Sleep ?? 0,
              stress: ps.stress ?? ps.Stress ?? 0,
              activity: ps.activity ?? ps.Body ?? ps.physical_activity ?? ps.PhysicalActivity ?? 0,
              nutrition: ps.nutrition ?? ps.Nutrition ?? 0,
              social: ps.social ?? ps.Social ?? 0,
              cognitive: ps.cognitive ?? ps.Brain ?? ps.cognitive_engagement ?? ps.Cognitive ?? 0,
            };

            const dob: string | undefined = assessmentData?.baselineData?.dateOfBirth;
            const age = dob
              ? (() => {
                  const birthDate = new Date(dob);
                  const today = new Date();
                  let years = today.getFullYear() - birthDate.getFullYear();
                  const monthDiff = today.getMonth() - birthDate.getMonth();
                  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    years--;
                  }
                  return years;
                })()
              : 0;

            const finalScore = briefResults?.finalScore ?? briefResults?.final_score ?? 0;

            navigate(
              `/lis-results?score=${finalScore}` +
                `&pillarScores=${encodeURIComponent(JSON.stringify(normalizedPillarScores))}` +
                `&isNewBaseline=true&isGuest=true` +
                (age ? `&age=${age}` : ''),
              { replace: true },
            );
          } else {
            toast({
              title: t('lisResults.toast.assessmentNotFound'),
              description: t('lisResults.toast.assessmentNotFoundDesc'),
            });
            navigate('/guest-lis-assessment');
          }
        }
      }
    };
    
    loadMissingAssessmentData();
  }, [score, urlPillarScores, user, loading, navigate, toast]);


  const calculateBiologicalAge = (lisScore: number, chronoAge: number): { 
    bioAge: number; 
    delta: number; 
    annualDeceleration: number;
    projections: {
      current5yr: number;
      current20yr: number;
      optimized5yr: number;
      optimized20yr: number;
      improvementGap5yr: number;
      improvementGap20yr: number;
    }
  } => {
    if (!chronoAge || !lisScore) {
      return { 
        bioAge: 0, 
        delta: 0, 
        annualDeceleration: 0,
        projections: {
          current5yr: 0,
          current20yr: 0,
          optimized5yr: 0,
          optimized20yr: 0,
          improvementGap5yr: 0,
          improvementGap20yr: 0
        }
      };
    }

    // Research-backed coefficients
    const baselineScore = 50; // Average population
    const scoreDelta = lisScore - baselineScore;
    const biologicalAgeDelta = (scoreDelta / 5) * -1; // Higher LIS = younger biological age
    
    const biologicalAge = chronoAge + biologicalAgeDelta;
    
    // Aging rate: 1.5 at LIS=0, 1.0 at LIS=50, 0.7 at LIS=100
    const annualDeceleration = 1.0 - ((lisScore - 50) / 100);
    const currentAgingRate = annualDeceleration;
    
    // Optimized scenario: LIS score of 85 (achievable with biohacking)
    const optimizedLIS = 85;
    const optimizedDeceleration = 1.0 - ((optimizedLIS - 50) / 100);
    const optimizedAgingRate = optimizedDeceleration;
    
    // Future projections
    const current5yr = biologicalAge + (currentAgingRate * 5);
    const current20yr = biologicalAge + (currentAgingRate * 20);
    const optimized5yr = biologicalAge + (optimizedAgingRate * 5);
    const optimized20yr = biologicalAge + (optimizedAgingRate * 20);

    return {
      bioAge: Math.round(biologicalAge * 10) / 10,
      delta: Math.round(biologicalAgeDelta * 10) / 10,
      annualDeceleration: Math.round(annualDeceleration * 1000) / 1000,
      projections: {
        current5yr: Math.round(current5yr * 10) / 10,
        current20yr: Math.round(current20yr * 10) / 10,
        optimized5yr: Math.round(optimized5yr * 10) / 10,
        optimized20yr: Math.round(optimized20yr * 10) / 10,
        improvementGap5yr: Math.round((current5yr - optimized5yr) * 10) / 10,
        improvementGap20yr: Math.round((current20yr - optimized20yr) * 10) / 10
      }
    };
  };

  const getTopStrengths = () => {
    const pillarScores = urlPillarScores || lisData.pillarScores;
    const sorted = Object.entries(pillarScores)
      .sort(([, a]: any, [, b]: any) => b - a)
      .slice(0, 3);
    return sorted;
  };

  const getTopImprovements = () => {
    const pillarScores = urlPillarScores || lisData.pillarScores;
    const sorted = Object.entries(pillarScores)
      .sort(([, a]: any, [, b]: any) => a - b)
      .slice(0, 3);
    return sorted;
  };

  // Calculate biological age data
  const displayScore = isNewBaseline && score ? score : (lisData.currentScore || score);
  const bioAgeData = chronologicalAge > 0 ? calculateBiologicalAge(displayScore, chronologicalAge) : null;

  // Generate pillar analyses
  const pillarScores = urlPillarScores || lisData.pillarScores;
  const pillarAnalyses = generatePillarAnalysis(pillarScores);

  // Memoize LIS protocol generation for inline preview
  const lisProtocol = useMemo(() => {
    if (!pillarScores) return { immediate: [], foundation: [], optimization: [] };
    return generateLISProtocol(pillarScores);
  }, [pillarScores]);

  // Share link functionality
  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}/lis-results?score=${displayScore}&pillarScores=${encodeURIComponent(JSON.stringify(pillarScores))}${chronologicalAge ? `&age=${chronologicalAge}` : ''}${user ? `&referrer=${user.id}` : ''}&shared=true`;
    
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: t('lisResults.toast.linkCopied'),
      description: t('lisResults.toast.linkCopiedDesc'),
    });
  };

  // Check if this is a shared link
  const isSharedLink = searchParams.get('shared') === 'true';

  // Wait for translations to be ready
  if (!ready) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container max-w-6xl mx-auto py-8 px-4 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-6xl mx-auto py-8 px-4">
      
      {/* Shared Link Banner */}
      {isSharedLink && (
        <Alert className="mb-6 bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/20">
          <Sparkles className="h-5 w-5 text-primary" />
          <AlertTitle>{t('lisResults.sharedBanner.title')}</AlertTitle>
          <AlertDescription>
            <p className="mb-3">{t('lisResults.sharedBanner.description')}</p>
            <Button 
              variant="outline" 
              className="border-primary/30 hover:bg-primary/10" 
              onClick={() => navigate('/guest-lis-assessment')}
            >
              {t('lisResults.sharedBanner.cta')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Heading Card */}
      <Card className="mb-6 text-center bg-gradient-to-br from-primary/10 via-secondary/5 to-background border-primary/20">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">{t('lisResults.pageTitle')}</CardTitle>
          <CardDescription>
            {t('lisResults.pageSubtitle')}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Score Display Card - NOW FIRST (LEFT) */}
        <Card className="flex flex-col justify-center bg-gradient-to-br from-primary/5 to-background border-primary/20">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-sm text-muted-foreground mb-2 font-medium">
              {t('lisResults.yourLISScore')}
            </div>
            <div 
              className="text-7xl font-bold mb-3"
              style={{ color: getScoreColor(displayScore) }}
            >
              {Math.round(displayScore)}
            </div>
            <div 
              className="text-xl font-semibold px-6 py-2 rounded-full border-2"
              style={{ 
                color: getScoreColor(displayScore),
                borderColor: getScoreColor(displayScore),
                backgroundColor: `${getScoreColor(displayScore)}10`
              }}
            >
              {getScoreCategory(displayScore)}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
              {t('lisResults.scoreDescription')}
            </p>
          </CardContent>
        </Card>

        {/* Radar Chart Card - NOW SECOND (RIGHT) */}
        <Card className="bg-gradient-to-br from-secondary/5 to-background border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">{t('lisResults.yourHealthPillars')}</CardTitle>
            <CardDescription className="text-xs">
              {t('lisResults.sixDimensions')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-2 pb-4">
            <LISRadarChart 
              pillarScores={pillarScores}
              compositeScore={displayScore}
              size={400}
            />
          </CardContent>
        </Card>
      </div>

      {/* Consolidated LIS Summary Card - Sentence-form narrative */}
      <Card className="mb-6 bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/20">
        <CardContent className="pt-6 space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('lisResults.summary.title')}
          </h3>
          
          {/* Primary Statement */}
          <p className="text-foreground leading-relaxed">
            {(() => {
              if (displayScore >= 80) {
                return t('lisResults.summary.excellent', { score: displayScore });
              } else if (displayScore >= 65) {
                return t('lisResults.summary.good', { score: displayScore });
              } else if (displayScore >= 50) {
                return t('lisResults.summary.fair', { score: displayScore });
              } else {
                return t('lisResults.summary.needsWork', { score: displayScore });
              }
            })()}
          </p>

          <div className="h-px bg-border my-2" />

          {/* Strengths Statement */}
          <p className="text-foreground leading-relaxed">
            {(() => {
              const topStrengths = getTopStrengths().slice(0, 2);
              if (topStrengths.length >= 2) {
                const [first, second] = topStrengths;
                return t('lisResults.summary.strengthsTwo', { first: first[0], firstScore: first[1], second: second[0], secondScore: second[1] });
              } else if (topStrengths.length === 1) {
                const [first] = topStrengths;
                return t('lisResults.summary.strengthsOne', { first: first[0], firstScore: first[1] });
              }
              return '';
            })()}
          </p>

          <div className="h-px bg-border my-2" />

          {/* Priority Statement */}
          <p className="text-foreground leading-relaxed">
            {(() => {
              const improvements = getTopImprovements().slice(0, 2);
              if (improvements.length >= 2) {
                const [first, second] = improvements;
                const potentialYears = Math.round((100 - displayScore) * 0.08);
                return t('lisResults.summary.priorityTwo', { first: first[0], firstScore: first[1], second: second[0], secondScore: second[1], years: potentialYears });
              } else if (improvements.length === 1) {
                const [first] = improvements;
                return t('lisResults.summary.priorityOne', { first: first[0], firstScore: first[1] });
              }
              return '';
            })()}
          </p>

          <div className="h-px bg-border my-2" />

          {/* Key Insight / Action Statement */}
          <div className="p-4 bg-background rounded-lg border border-primary/20">
            <p className="text-foreground leading-relaxed flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <span>
                {(() => {
                  const lowestPillar = getTopImprovements()[0];
                  const lowestScore = lowestPillar ? (lowestPillar[1] as number) : 0;
                  const lowestName = lowestPillar ? (lowestPillar[0] as string) : '';
                  const improvementAreas = getTopImprovements().filter((item) => (item[1] as number) < 50);
                  
                  if (improvementAreas.length >= 2) {
                    return t('lisResults.summary.insightInterconnected', { first: improvementAreas[0][0], second: improvementAreas[1][0], lowest: lowestName });
                  } else if (lowestScore < 40) {
                    return t('lisResults.summary.insightLowest', { pillar: lowestName });
                  } else if (lowestScore >= 60) {
                    return t('lisResults.summary.insightBalanced');
                  } else {
                    return t('lisResults.summary.insightFocus', { pillar: lowestName });
                  }
                })()}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Biological Age Card - For ALL users with age data */}
      {chronologicalAge > 0 && bioAgeData && (
        <Card className="p-8 mb-6 border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-secondary/5 to-background shadow-lg">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">{t('lisResults.bioAge.title')}</h3>
            
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
              {t('lisResults.bioAge.explanation')}
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">{t('lisResults.bioAge.chronological')}</div>
                <div className="text-4xl font-bold">{chronologicalAge}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('lisResults.bioAge.years')}</div>
              </div>

              <div className="p-4 bg-background rounded-lg border-2 border-primary">
                <div className="text-sm text-muted-foreground mb-1">{t('lisResults.bioAge.biological')}</div>
                <div className="text-4xl font-bold text-primary">{bioAgeData?.bioAge || 'N/A'}</div>
                <div className="text-xs text-muted-foreground mt-1">{t('lisResults.bioAge.years')}</div>
              </div>

              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">{t('lisResults.bioAge.ageDelta')}</div>
                <div className={`text-4xl font-bold ${bioAgeData?.delta && bioAgeData.delta > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {bioAgeData?.delta ? (bioAgeData.delta > 0 ? '+' : '') + bioAgeData.delta : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">{t('lisResults.bioAge.years')}</div>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                {t('lisResults.bioAge.agingRate', { 
                  score: displayScore.toFixed(1), 
                  rate: bioAgeData.annualDeceleration.toFixed(2),
                  comparison: bioAgeData.annualDeceleration < 1 ? t('lisResults.bioAge.slowerThan') : bioAgeData.annualDeceleration > 1 ? t('lisResults.bioAge.fasterThan') : t('lisResults.bioAge.sameAs')
                })}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {bioAgeData.delta < 0 
                  ? t('lisResults.bioAge.younger', { years: Math.abs(bioAgeData.delta) })
                  : bioAgeData.delta === 0 
                  ? t('lisResults.bioAge.same')
                  : t('lisResults.bioAge.older', { years: bioAgeData.delta })}
              </p>
            </div>

            {/* Future Projections */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-left">{t('lisResults.trajectory.title')}</h4>
              
              {/* 5 Year Projection */}
              <div className="p-5 bg-background rounded-lg border-2">
                <div className="mb-3">
                  <span className="font-semibold text-base">
                    {t('lisResults.trajectory.inYears', { years: 5, age: chronologicalAge + 5 })}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground mb-2">{t('lisResults.trajectory.currentTrajectory')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-orange-600">
                        {bioAgeData.projections.current5yr}
                      </span>
                      <span className="text-sm text-muted-foreground">{t('lisResults.trajectory.yearsBioAge')}</span>
                    </div>
                  </div>
                  
                  <div className="text-left border-l-2 border-primary/20 pl-4">
                    <p className="text-xs text-muted-foreground mb-2">{t('lisResults.trajectory.withBiohacking')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        {bioAgeData.projections.optimized5yr}
                      </span>
                      <span className="text-sm text-muted-foreground">{t('lisResults.trajectory.yearsBioAge')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded border border-green-500/20">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    {t('lisResults.trajectory.improvement5yr', { years: bioAgeData.projections.improvementGap5yr })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('lisResults.trajectory.reduction', { percent: ((bioAgeData.projections.current5yr - bioAgeData.projections.optimized5yr) / bioAgeData.projections.current5yr * 100).toFixed(0), years: 5 })}
                  </p>
                </div>
              </div>

              {/* 20 Year Projection */}
              <div className="p-5 bg-background rounded-lg border-2 border-primary">
                <div className="mb-3">
                  <span className="font-semibold text-base">
                    {t('lisResults.trajectory.inYears', { years: 20, age: chronologicalAge + 20 })}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground mb-2">{t('lisResults.trajectory.currentTrajectory')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-destructive">
                        {bioAgeData.projections.current20yr}
                      </span>
                      <span className="text-sm text-muted-foreground">{t('lisResults.trajectory.yearsBioAge')}</span>
                    </div>
                  </div>
                  
                  <div className="text-left border-l-2 border-primary/20 pl-4">
                    <p className="text-xs text-muted-foreground mb-2">{t('lisResults.trajectory.withBiohacking')}</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        {bioAgeData.projections.optimized20yr}
                      </span>
                      <span className="text-sm text-muted-foreground">{t('lisResults.trajectory.yearsBioAge')}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-primary/10 rounded border-2 border-green-500/30">
                  <p className="text-sm font-bold text-green-700 mb-1">
                    {t('lisResults.trajectory.transform20yr', { years: bioAgeData.projections.improvementGap20yr })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('lisResults.trajectory.extraYears', { years: bioAgeData.projections.improvementGap20yr })}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">
                  {t('lisResults.trajectory.calculationBasis', { rate: bioAgeData.annualDeceleration.toFixed(2) })}
                </p>
              </div>

              {/* Medium Disclaimer */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  {t('lisResults.trajectory.disclaimer')}
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Methodology Disclaimer */}
      <MethodologyDisclaimer assessmentType="lis" className="mb-6" />

      {/* Nutrition Preview Card - For Guests Only */}
      {isGuest && (
        <Card className="p-6 mb-6 border-2 border-primary/20 bg-gradient-to-br from-orange-500/5 to-background relative overflow-hidden">
          {/* Blur overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-background/70 z-10 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">{t('lisResults.nutritionPreview.title')}</h3>
              <p className="text-muted-foreground max-w-md">
                {t('lisResults.nutritionPreview.description')}
              </p>
              
              {/* Benefits list */}
              <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('lisResults.nutritionPreview.benefit1')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('lisResults.nutritionPreview.benefit2')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('lisResults.nutritionPreview.benefit3')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{t('lisResults.nutritionPreview.benefit4')}</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={() => {
                  const sessionId = localStorage.getItem('nutrition_guest_session');
                  const sessionParam = sessionId ? `&session=${encodeURIComponent(sessionId)}` : '';
                  navigate(`/auth?source=nutrition${sessionParam}`);
                }}
                className="text-lg px-8 py-6 h-auto"
              >
                {t('lisResults.nutritionPreview.cta')}
              </Button>
              
              <p className="text-xs text-muted-foreground">
                {t('lisResults.nutritionPreview.trial')}
              </p>
            </div>
          </div>
          
          {/* Preview content (blurred behind overlay) */}
          <div className="opacity-50">
            <div className="p-6 relative">
              {/* Subtle overlay to indicate disabled state */}
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] rounded-lg pointer-events-none z-10" />
              
              <div className="space-y-6 relative opacity-60">
                {/* Score Circle */}
                <div className="flex flex-col items-center space-y-2">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-foreground">11</div>
                    <div className="text-sm text-muted-foreground">out of 15</div>
                    <div className="text-2xl font-bold text-primary mt-1">Grade A</div>
                  </div>
                  <p className="text-sm text-center text-muted-foreground max-w-md">
                    Your daily anti-inflammatory nutrition score
                  </p>
                </div>

                {/* Demo Sliders */}
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center">
                    <span>💧 Hydration</span>
                    <span className="text-muted-foreground">3 glasses</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🥬 Vegetables & Greens</span>
                    <span className="text-muted-foreground">3 servings</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🍗 Protein Quality</span>
                    <span className="text-muted-foreground">Good sources</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Individual Pillar Analysis Cards - Accordion Version */}
      <div className="mb-6 p-6 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          {t('lisResults.pillarAnalysis.title')}
        </h2>
        <p className="text-muted-foreground mb-6">
          {t('lisResults.pillarAnalysis.description')}
        </p>
        
        <Accordion 
          type="multiple" 
          defaultValue={[pillarAnalyses.reduce((lowest, current) => 
            current.score < lowest.score ? current : lowest
          ).name]} 
          className="space-y-4"
        >
          {pillarAnalyses.map((pillar) => (
            <AccordionItem 
              key={pillar.name} 
              value={pillar.name}
              className="border rounded-lg overflow-hidden"
              style={{ borderLeftWidth: '4px', borderLeftColor: pillar.color }}
            >
              <AccordionTrigger className="px-6 py-4 hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
                <div className="flex items-center justify-between w-full pr-4">
                  {/* Left: Icon + Name + Badge */}
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg flex-shrink-0"
                      style={{ backgroundColor: `${pillar.color}20` }}
                    >
                      <pillar.icon className="h-5 w-5" style={{ color: pillar.color }} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-semibold text-base">{pillar.displayName}</h3>
                      <Badge 
                        variant={
                          pillar.score >= 80 ? 'default' : 
                          pillar.score >= 60 ? 'secondary' : 
                          pillar.score >= 40 ? 'outline' : 'destructive'
                        } 
                        className="mt-1"
                      >
                        {pillar.score >= 80 ? t('lisResults.pillarAnalysis.excellent') : 
                         pillar.score >= 60 ? t('lisResults.pillarAnalysis.good') : 
                         pillar.score >= 40 ? t('lisResults.pillarAnalysis.fair') : t('lisResults.pillarAnalysis.needsWork')}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Right: Score */}
                  <div className="text-right flex-shrink-0">
                    <div 
                      className={`text-2xl font-bold ${
                        pillar.score >= 80 ? 'text-green-600' : 
                        pillar.score >= 60 ? 'text-yellow-600' : 
                        pillar.score >= 40 ? 'text-orange-600' : 'text-red-600'
                      }`}
                    >
                      {pillar.score}
                    </div>
                    <div className="text-xs text-muted-foreground">/ 100</div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-6 pb-6">
                <div className="pt-4">
                  <Progress value={pillar.score} className="mb-4 h-2" />
                  
                  <LISPillarAnalysisCard
                    pillarName={pillar.name}
                    pillarDisplayName={pillar.displayName}
                    pillarAnalysisName={pillar.analysisName}
                    pillarScore={pillar.score}
                    icon={pillar.icon}
                    color={pillar.color}
                    overallLIS={displayScore}
                    userAge={chronologicalAge}
                    hideHeader={true}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* Inline Protocol Preview - For Logged In Users */}
      {user && (
        <InlineProtocolPreview
          protocolData={lisProtocol}
          sourceType="lis"
          sourceAssessmentId="lis-baseline"
          onProtocolSaved={() => refetchRecommendations()}
        />
      )}

      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Guest User - Prompt to Register */}
          {isGuest && (
            <Card className="border-2 border-primary bg-gradient-to-br from-primary/10 to-background">
              <CardContent className="pt-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">{t('lisResults.guestCta.title')}</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {t('lisResults.guestCta.description')}
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-w-2xl mx-auto mb-4">
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('lisResults.guestCta.benefit1')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('lisResults.guestCta.benefit2')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('lisResults.guestCta.benefit3')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('lisResults.guestCta.benefit4')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('lisResults.guestCta.benefit5')}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm">
                    <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>{t('lisResults.guestCta.benefit6')}</span>
                  </li>
                </ul>
                <Button 
                  onClick={() => {
                    if (user) {
                      handleGenerateProtocol();
                    } else {
                      const sessionId = localStorage.getItem('lis_guest_session_id');
                      const returnTo = encodeURIComponent('/lis-results');
                      const sessionParam = sessionId ? `&session=${encodeURIComponent(sessionId)}` : '';
                      navigate(`/auth?source=lis-results&returnTo=${returnTo}${sessionParam}`);
                    }
                  }} 
                  size="lg"
                  className="text-lg px-8 py-6 h-auto"
                  disabled={user && generatingProtocol}
                >
                  {user ? t('lisResults.guestCta.unlockProtocol') : t('lisResults.guestCta.createAccount')}
                </Button>
                <p className="text-xs text-muted-foreground">
                  {t('lisResults.guestCta.trial')}
                </p>
                
                {/* Email and Share Buttons for Guests */}
                <div className="flex gap-3 justify-center mt-4">
                  <Button 
                    variant="outline"
                    className="gap-2"
                    onClick={() => setEmailDialogOpen(true)}
                  >
                    <Mail className="w-4 h-4" />
                    {t('lisResults.guestCta.emailResults')}
                  </Button>
                  <Button 
                    variant="outline"
                    className="gap-2"
                    onClick={() => copyShareLink()}
                  >
                    <Share2 className="w-4 h-4" />
                    {t('lisResults.guestCta.copyShareLink')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Registered User - Show Comprehensive Insights */}
          {!isGuest && (
            <div className="mt-6 space-y-6">
              {/* View Protocol CTA */}
              {user && (
                <div className="flex flex-col items-center gap-3 mb-6">
                  <Button 
                    onClick={handleGenerateProtocol}
                    size="lg"
                    className="gap-2 w-full md:w-auto"
                    disabled={generatingProtocol}
                  >
                    <Sparkles className="w-5 h-5" />
                    {generatingProtocol ? t('lisResults.authenticated.generateProtocol') : t('lisResults.authenticated.reviewProtocol')}
                  </Button>
                  
                  {/* Create Goal from Assessment */}
                  <Button 
                    onClick={() => setGoalDialogOpen(true)}
                    variant="outline"
                    size="lg"
                    className="gap-2 w-full md:w-auto"
                  >
                    <Target className="w-5 h-5" />
                    {t('lisResults.authenticated.createGoal')}
                  </Button>
                  
                  {/* AI Deep Dive - Compact Button */}
                  <AssessmentAIAnalysisCard
                    assessmentType="lis"
                    assessmentId="longevity-impact-score"
                    score={score}
                    scoreCategory={getScoreCategory(score)}
                    answers={urlPillarScores || lisData.pillarScores}
                    metadata={{ 
                      pillarScores: urlPillarScores || lisData.pillarScores,
                      biologicalAge: bioAgeData?.bioAge,
                      chronologicalAge: chronologicalAge
                    }}
                    autoGenerate={false}
                    renderButton={(onClick, loading) => (
                      <Button 
                        onClick={onClick}
                        variant="outline"
                        size="sm"
                        className="gap-2 text-sm"
                        disabled={loading}
                      >
                        <Sparkles className="w-4 h-4" />
                        {loading ? t('lisResults.authenticated.generatingAI') : t('lisResults.authenticated.aiDeepDive')}
                      </Button>
                    )}
                  />
                  
                  {/* Email and Share Buttons for Authenticated Users */}
                  <div className="flex gap-3 justify-center mt-4">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => setEmailDialogOpen(true)}
                    >
                      <Mail className="w-4 h-4" />
                      {t('lisResults.authenticated.emailReport')}
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => copyShareLink()}
                    >
                      <Share2 className="w-4 h-4" />
                      {t('lisResults.authenticated.shareLink')}
                    </Button>
                  </div>
                </div>
              )}

              {/* Only show if user hasn't done any daily check-ins yet */}
              {lisData.dailyScores.length === 0 && (
                <Alert className="bg-success/5 border-success/20 mb-6">
                  <Activity className="h-5 w-5 text-success" />
                  <AlertTitle className="text-success">{t('lisResults.authenticated.continueTitle')}</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="text-sm mb-3">
                      {t('lisResults.authenticated.continueDescription')}
                    </p>
                    <ul className="space-y-2 text-sm mb-4">
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>{t('lisResults.authenticated.continueItem1')}</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>{t('lisResults.authenticated.continueItem2')}</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>{t('lisResults.authenticated.continueItem3')}</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>{t('lisResults.authenticated.continueItem4')}</span>
                      </li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                {lisData.dailyScores.length === 0 ? (
                  <>
                    <FirstTimeDailyScoreWelcome onScoreCalculated={() => {
                      lisData.refetch();
                      toast({
                        title: t('lisResults.toast.greatStart'),
                        description: t('lisResults.toast.greatStartDesc'),
                      });
                      // Optional: Auto-navigate after submission
                      setTimeout(() => navigate('/dashboard'), 2000);
                    }}>
                      <Button 
                        className="w-full"
                        size="lg"
                      >
                        <Activity className="h-5 w-5 mr-2" />
                        {t('lisResults.authenticated.submitFirst')}
                      </Button>
                    </FirstTimeDailyScoreWelcome>
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      variant="outline"
                      className="w-full"
                    >
                      {t('lisResults.authenticated.skipForNow')}
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full"
                    size="lg"
                  >
                    {t('lisResults.authenticated.viewDashboard')}
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shop Your Protocol CTA */}
      {!isGuest && (
        <div className="mb-6">
          <ShopYourProtocolButton 
            assessmentType="lis"
            itemCount={pillarAnalyses.filter(p => p.score < 70).length}
          />
        </div>
      )}

      {/* Subscription CTA for Registered Users */}
      {!isGuest && (
        <Alert className="bg-gradient-to-r from-primary/10 to-secondary/5 border-primary/20">
          <Lock className="h-5 w-5 text-primary" />
          <AlertTitle className="font-semibold">{t('lisResults.authenticated.freeTrialActive')}</AlertTitle>
          <AlertDescription>
            {t('lisResults.authenticated.freeTrialDescription')}
            <Button 
              variant="outline" 
              className="mt-2 w-full border-primary/30 hover:bg-primary/10" 
              onClick={() => navigate('/upgrade')}
            >
              {t('lisResults.authenticated.learnPlans')}
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Email Share Dialog */}
      <EmailShareDialog
        open={emailDialogOpen}
        onOpenChange={setEmailDialogOpen}
        score={displayScore}
        pillarScores={pillarScores}
        bioAge={bioAgeData?.bioAge}
        chronologicalAge={chronologicalAge}
        isGuest={isGuest}
        userEmail={user?.email}
        userId={user?.id}
      />

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
      
      {/* Create Goal from Assessment Dialog */}
      <CreateGoalFromAssessmentDialog
        open={goalDialogOpen}
        onOpenChange={setGoalDialogOpen}
        assessmentType="lis"
        assessmentData={{
          score: displayScore,
          lowestPillar: pillarAnalyses[0]?.displayName,
          lowestScore: pillarAnalyses[0]?.score,
        }}
      />
      
      {/* Bottom Return Button */}
      <div className="flex justify-center gap-4 mt-8 pb-8">
        <Button 
          onClick={() => window.history.length > 1 ? navigate(-1) : navigate(user ? '/today' : '/')} 
          size="lg"
        >
          {t('common.goBack')}
        </Button>
      </div>
    </div>
    </div>
  );
};

export default LISResults;
