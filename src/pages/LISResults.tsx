import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Sparkles, Lock, TrendingUp, Activity, Brain, Heart, Users, Moon, AlertCircle, TrendingDown } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import LISInputForm from '@/components/LISInputForm';
import FirstTimeDailyScoreWelcome from '@/components/FirstTimeDailyScoreWelcome';
import { useLISData } from '@/hooks/useLISData';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';
import { LISRadarChart, getScoreColor, getScoreCategory } from '@/components/LISRadarChart';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { AssessmentAIAnalysisCard } from '@/components/AssessmentAIAnalysisCard';
import { useProtocolGeneration } from '@/hooks/useProtocolGeneration';
import { useProtocols } from '@/hooks/useProtocols';
import { LISPillarAnalysisCard } from '@/components/LISPillarAnalysisCard';
import { generatePillarAnalysis } from '@/utils/pillarAnalysisGenerator';

const LISResults = () => {
  const navigate = useNavigate();
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

  // Auto-generate protocol if new baseline and no active protocol yet
  useEffect(() => {
    if (isNewBaseline && user && !protocolsLoading && !hasActiveProtocol && !protocolGenerated) {
      const generateProtocol = async () => {
        try {
          console.log('Auto-generating protocol from baseline LIS assessment...');
          await generateProtocolFromAssessments();
          setProtocolGenerated(true);
        } catch (error) {
          console.error('Failed to auto-generate protocol:', error);
        }
      };
      
      // Add a small delay to ensure assessment data is saved
      const timer = setTimeout(generateProtocol, 1500);
      return () => clearTimeout(timer);
    }
  }, [isNewBaseline, user, protocolsLoading, hasActiveProtocol, protocolGenerated, generateProtocolFromAssessments]);

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
              title: "No Assessment Found",
              description: "Please complete your baseline assessment first.",
            });
            navigate('/guest-lis-assessment');
          }
        } else {
          // Handle guest users
          const sessionId = localStorage.getItem('lis_guest_session_id');
          if (sessionId) {
            navigate(`/guest-lis-results/${sessionId}`);
          } else {
            toast({
              title: "Assessment Not Found",
              description: "Please complete the assessment to view results.",
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-6xl mx-auto py-8 px-4">
      {/* Heading Card */}
      <Card className="mb-6 text-center">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Longevity Impact Results</CardTitle>
          <CardDescription>
            Your personalized health assessment and longevity profile
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Score Display Card - NOW FIRST (LEFT) */}
        <Card className="flex flex-col justify-center">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-sm text-muted-foreground mb-2 font-medium">
              Your Longevity Impact Score
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
              A comprehensive measure of your current healthspan and longevity potential
            </p>
          </CardContent>
        </Card>

        {/* Radar Chart Card - NOW SECOND (RIGHT) */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg">Your Health Pillars</CardTitle>
            <CardDescription className="text-xs">
              Six key dimensions of longevity
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

      {/* Biological Age Card - For ALL users with age data */}
      {chronologicalAge > 0 && bioAgeData && (
        <Card className="p-8 mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Your Biological Age Estimate</h3>
            
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
              <strong>Biological age</strong> is an indicator of how well your body may be functioning at a cellular level. This assessment uses lifestyle factors to provide an indicative biological age estimate. <strong>Chronological age</strong> is simply the number of years you've been alive. Your lifestyle choices, stress levels, sleep quality, and nutrition can make your body function younger or older than your calendar age.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Chronological Age</div>
                <div className="text-4xl font-bold">{chronologicalAge}</div>
                <div className="text-xs text-muted-foreground mt-1">years</div>
              </div>

              <div className="p-4 bg-background rounded-lg border-2 border-primary">
                <div className="text-sm text-muted-foreground mb-1">Biological Age</div>
                <div className="text-4xl font-bold text-primary">{bioAgeData?.bioAge || 'N/A'}</div>
                <div className="text-xs text-muted-foreground mt-1">years</div>
              </div>

              <div className="p-4 bg-background rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Age Delta</div>
                <div className={`text-4xl font-bold ${bioAgeData?.delta && bioAgeData.delta > 0 ? 'text-destructive' : 'text-green-600'}`}>
                  {bioAgeData?.delta ? (bioAgeData.delta > 0 ? '+' : '') + bioAgeData.delta : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">years</div>
              </div>
            </div>

            <div className="p-4 bg-background rounded-lg mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                Based on your LIS score of {displayScore.toFixed(1)}, your lifestyle indicates you could be aging approximately{' '}
                <span className="font-bold text-foreground">
                  {bioAgeData.annualDeceleration.toFixed(2)}x
                </span>{' '}
                the normal rate ({bioAgeData.annualDeceleration < 1 ? 'slower than' : bioAgeData.annualDeceleration > 1 ? 'faster than' : 'same as'} average).
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {bioAgeData.delta < 0 
                  ? `🎉 Your biological age is ${Math.abs(bioAgeData.delta)} years younger than your chronological age!` 
                  : bioAgeData.delta === 0 
                  ? 'Your biological age matches your chronological age.' 
                  : `⚠️ Your biological age is ${bioAgeData.delta} years older than your chronological age.`}
              </p>
            </div>

            {/* Future Projections */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-left">Your Aging Trajectory</h4>
              
              {/* 5 Year Projection */}
              <div className="p-5 bg-background rounded-lg border-2">
                <div className="mb-3">
                  <span className="font-semibold text-base">
                    In 5 years you'll be {chronologicalAge + 5} years old
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground mb-2">Current Trajectory</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-orange-600">
                        {bioAgeData.projections.current5yr}
                      </span>
                      <span className="text-sm text-muted-foreground">years bio age</span>
                    </div>
                  </div>
                  
                  <div className="text-left border-l-2 border-primary/20 pl-4">
                    <p className="text-xs text-muted-foreground mb-2">With Biohacking</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        {bioAgeData.projections.optimized5yr}
                      </span>
                      <span className="text-sm text-muted-foreground">years bio age</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded border border-green-500/20">
                  <p className="text-sm font-medium text-green-700 mb-1">
                    💡 <span className="font-bold">Improvement Potential: {bioAgeData.projections.improvementGap5yr} years younger biological age</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    That's a {((bioAgeData.projections.current5yr - bioAgeData.projections.optimized5yr) / bioAgeData.projections.current5yr * 100).toFixed(0)}% reduction in biological aging over 5 years!
                  </p>
                </div>
              </div>

              {/* 20 Year Projection */}
              <div className="p-5 bg-background rounded-lg border-2 border-primary">
                <div className="mb-3">
                  <span className="font-semibold text-base">
                    In 20 years you'll be {chronologicalAge + 20} years old
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-left">
                    <p className="text-xs text-muted-foreground mb-2">Current Trajectory</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-destructive">
                        {bioAgeData.projections.current20yr}
                      </span>
                      <span className="text-sm text-muted-foreground">years bio age</span>
                    </div>
                  </div>
                  
                  <div className="text-left border-l-2 border-primary/20 pl-4">
                    <p className="text-xs text-muted-foreground mb-2">With Biohacking</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-green-600">
                        {bioAgeData.projections.optimized20yr}
                      </span>
                      <span className="text-sm text-muted-foreground">years bio age</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 p-3 bg-gradient-to-r from-green-500/10 to-primary/10 rounded border-2 border-green-500/30">
                  <p className="text-sm font-bold text-green-700 mb-1">
                    🚀 Transform Your Future: <span className="text-lg">{bioAgeData.projections.improvementGap20yr} years younger!</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    That's like turning back the clock by gaining {bioAgeData.projections.improvementGap20yr} extra years of vitality
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                <p className="text-xs text-muted-foreground mb-2">
                  <strong>Calculation basis:</strong> Optimized scenario assumes achieving an LIS score of 85 through evidence-based biohacking interventions. Your current aging rate: {bioAgeData.annualDeceleration.toFixed(2)}x per year.
                </p>
              </div>

              {/* Medium Disclaimer */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> Your Longevity Impact Score is an estimation based on self-reported lifestyle factors and health behaviors. While this assessment provides valuable insights into your longevity trajectory, it is not a substitute for clinical testing. For a more accurate cellular-level biological age measurement, we recommend taking a clinical test including comprehensive blood work, inflammation markers, metabolic panels, and hormonal assessments.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Nutrition Preview Card - For Guests Only */}
      {isGuest && (
        <Card className="p-6 mb-6 border-2 border-primary/20 bg-gradient-to-br from-orange-500/5 to-background relative overflow-hidden">
          {/* Blur overlay */}
          <div className="absolute inset-0 backdrop-blur-sm bg-background/70 z-10 rounded-lg flex items-center justify-center">
            <div className="text-center space-y-4 p-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-2">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Daily Nutrition Tracking</h3>
              <p className="text-muted-foreground max-w-md">
                Track your anti-inflammatory score every day, see how nutrition impacts your LIS, 
                and get personalized meal recommendations
              </p>
              
              {/* Benefits list */}
              <div className="grid grid-cols-1 gap-2 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Daily nutrition scoring (0-15 scale)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Track hydration, protein, vegetables, and more</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>See how daily choices affect your biological age</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>Build streaks and earn achievements</span>
                </div>
              </div>
              
              <Button 
                size="lg" 
                onClick={() => navigate('/auth?source=nutrition')}
                className="text-lg px-8 py-6 h-auto"
              >
                Sign Up to Start Tracking
              </Button>
              
              <p className="text-xs text-muted-foreground">
                Includes FREE 3-day trial
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

      {/* Individual Pillar Analysis Cards */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          Detailed Pillar Analysis
        </h2>
        <p className="text-muted-foreground mb-6">
          Deep dive into each longevity pillar with personalized insights and actionable recommendations.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {pillarAnalyses.map((pillar) => (
            <LISPillarAnalysisCard
              key={pillar.name}
              pillarName={pillar.name}
              pillarDisplayName={pillar.displayName}
              pillarAnalysisName={pillar.analysisName}
              pillarScore={pillar.score}
              icon={pillar.icon}
              color={pillar.color}
              overallLIS={displayScore}
              userAge={chronologicalAge}
            />
          ))}
        </div>
      </div>


      {/* AI Analysis Card - Button Triggered */}
      {!isGuest && (
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="mb-4">
                <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
                <h3 className="text-lg font-semibold mb-2">AI-Powered Deep Dive</h3>
                <p className="text-sm text-muted-foreground">
                  Get additional AI-driven pattern detection and personalized insights beyond your pillar analysis
                </p>
              </div>
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
              />
            </CardContent>
          </Card>
        </div>
      )}


      <Card className="mb-6">
        <CardContent className="pt-6">
          {/* Guest User - Prompt to Register */}
          {isGuest && (
            <Alert className="mt-6 border-primary">
              <Sparkles className="h-5 w-5" />
              <AlertTitle>Want Your Detailed Analysis?</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-4">
                  Register now to unlock your comprehensive longevity report including:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm mb-4">
                  <li>Detailed breakdown of each pillar score</li>
                  <li>Personalized recommendations for improvement</li>
                  <li>Track your progress over time</li>
                  <li>7-day free trial (no credit card required initially)</li>
                </ul>
                <Button onClick={() => navigate('/auth')} className="w-full">
                  Register for Detailed Analysis
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Registered User - Show Comprehensive Insights */}
          {!isGuest && (
            <div className="mt-6 space-y-6">
              {/* View Protocol CTA */}
              {user && (
                <div className="flex justify-center mb-6">
                  <Button 
                    onClick={() => navigate('/my-protocol')}
                    size="lg"
                    className="gap-2"
                    disabled={protocolGenerating || protocolsLoading}
                  >
                    <Sparkles className="w-5 h-5" />
                    {protocolGenerating ? 'Generating Your Protocol...' : 'View Your Personalized Protocol'}
                  </Button>
                </div>
              )}

              {/* Only show if user hasn't done any daily check-ins yet */}
              {lisData.dailyScores.length === 0 && (
                <Alert className="bg-success/5 border-success/20 mb-6">
                  <Activity className="h-5 w-5 text-success" />
                  <AlertTitle className="text-success">Continue with Daily Check-Ins</AlertTitle>
                  <AlertDescription className="mt-2">
                    <p className="text-sm mb-3">
                      You've completed your baseline assessment! Now start daily check-ins to track how your lifestyle changes impact your longevity score over time.
                    </p>
                    <ul className="space-y-2 text-sm mb-4">
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>Quick 2-minute daily check-ins</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>See real-time changes in your biological age</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>Discover which habits move the needle</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-success">✓</span>
                        <span>Get AI insights based on your patterns</span>
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
                        title: "Great Start! 🎉",
                        description: "Your first daily score has been recorded. You can now view your dashboard!",
                      });
                      // Optional: Auto-navigate after submission
                      setTimeout(() => navigate('/dashboard'), 2000);
                    }}>
                      <Button 
                        className="w-full"
                        size="lg"
                      >
                        <Activity className="h-5 w-5 mr-2" />
                        Submit Your First Daily Score Now
                      </Button>
                    </FirstTimeDailyScoreWelcome>
                    <Button 
                      onClick={() => navigate('/dashboard')} 
                      variant="outline"
                      className="w-full"
                    >
                      Skip for Now - View Dashboard
                    </Button>
                  </>
                ) : (
                  <Button 
                    onClick={() => navigate('/dashboard')} 
                    className="w-full"
                    size="lg"
                  >
                    View Your Dashboard
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subscription CTA for Registered Users */}
      {!isGuest && (
        <Alert>
          <Lock className="h-5 w-5" />
          <AlertTitle>Free Trial Active</AlertTitle>
          <AlertDescription>
            You're currently on a 7-day free trial. Continue tracking daily and we'll prompt you to subscribe before your trial ends.
            <Button variant="outline" className="mt-2 w-full" onClick={() => navigate('/upgrade')}>
              Learn About Subscription Plans
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
    </div>
  );
};

export default LISResults;
