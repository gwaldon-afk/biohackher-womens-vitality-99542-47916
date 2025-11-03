import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, AlertCircle, Sparkles, Lock } from 'lucide-react';
import { LISPillarAnalysisCard } from '@/components/LISPillarAnalysisCard';
import { generatePillarAnalysis } from '@/utils/pillarAnalysisGenerator';

interface BriefResults {
  finalScore: number;
  pillarScores: Record<string, number>;
  smokingPenalty: number;
}

interface BaselineData {
  dateOfBirth: string;
  age: number;
  heightCm: number;
  weightKg: number;
  bmi: number;
}

interface AssessmentData {
  baselineData: BaselineData;
  answers: Array<{
    questionId: string;
    answer: string;
    score: number;
    analysis: string;
  }>;
  timestamp: string;
}

export default function GuestLISResults() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<BriefResults | null>(null);
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [sessionId]);

  const fetchResults = async () => {
    if (!sessionId) {
      toast.error('Invalid session ID');
      navigate('/');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('guest_lis_assessments')
        .select('brief_results, assessment_data')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (error || !data) {
        toast.error('Assessment not found');
        navigate('/');
        return;
      }

      setResults(data.brief_results as unknown as BriefResults);
      setAssessmentData(data.assessment_data as unknown as AssessmentData);
    } catch (error) {
      console.error('Error fetching results:', error);
      toast.error('Failed to load results');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateBiologicalAge = (): { 
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
    if (!results || !assessmentData?.baselineData) {
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

    const chronologicalAge = assessmentData.baselineData.age || 
      (() => {
        const dob = assessmentData.baselineData.dateOfBirth;
        if (!dob) return 40; // Default fallback
        
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      })();
    const lisScore = results.finalScore;
    
    // Research-backed coefficients - CORRECTED FORMULA
    const baselineScore = 50; // Average population
    const scoreDelta = lisScore - baselineScore;
    const biologicalAgeDelta = (scoreDelta / 5) * -1; // Higher LIS = younger biological age
    
    const biologicalAge = chronologicalAge + biologicalAgeDelta;
    
    // FIXED: Low scores should ACCELERATE aging (>1.0), high scores should DECELERATE (<1.0)
    // Formula: 1.5 at LIS=0, 1.0 at LIS=50, 0.7 at LIS=100
    const annualDeceleration = 1.0 - ((lisScore - 50) / 100); // Corrected coefficient
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

  const getRiskCategory = (score: number): { label: string; color: string; description: string } => {
    if (score >= 80) {
      return {
        label: 'Optimal',
        color: 'bg-green-500',
        description: 'Your lifestyle choices are strongly supporting healthy longevity'
      };
    } else if (score >= 60) {
      return {
        label: 'Protective',
        color: 'bg-blue-500',
        description: 'Good foundation with opportunities for further optimization'
      };
    } else if (score >= 40) {
      return {
        label: 'Moderate Risk',
        color: 'bg-yellow-500',
        description: 'Several areas need attention to support healthy aging'
      };
    } else {
      return {
        label: 'High Risk',
        color: 'bg-red-500',
        description: 'Immediate lifestyle changes recommended for longevity optimization'
      };
    }
  };

  const getTopStrengths = () => {
    if (!results) return [];
    const sorted = Object.entries(results.pillarScores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    return sorted;
  };

  const getTopImprovements = () => {
    if (!results) return [];
    const sorted = Object.entries(results.pillarScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3);
    return sorted;
  };

  const getComprehensiveAnalysis = () => {
    if (!assessmentData || !results) return null;

    const riskCategory = getRiskCategory(results.finalScore);
    const topWeakness = getTopImprovements()[0];
    const topStrength = getTopStrengths()[0];
    const bioAgeData = calculateBiologicalAge();
    const ageingRate = bioAgeData.annualDeceleration; // Current aging rate (already calculated correctly)

    return {
      overview: `Your Longevity Impact Score of ${results.finalScore} places you in the ${riskCategory.label} category, suggesting ${
        results.finalScore >= 80 ? 'exceptional longevity habits that are significantly slowing your biological aging' :
        results.finalScore >= 60 ? 'good foundational habits with clear opportunities for optimization' :
        results.finalScore >= 40 ? 'moderate habits that could be enhanced to dramatically improve your healthspan' :
        'lifestyle patterns that need attention to reverse accelerated aging'
      }.`,
      biologicalAge: `Based on your habits, you're aging at approximately ${ageingRate.toFixed(2)}x the normal rate, which means ${
        ageingRate < 1 ? `you could effectively gain ${Math.round((1 - ageingRate) * 30)} healthy years over the next 30 years` :
        ageingRate > 1 ? `you could lose ${Math.round((ageingRate - 1) * 30)} potential healthy years over the next 30 years without intervention` :
        'you\'re aging at a standard rate with room for optimization'
      }.`,
      strengths: `Your ${topStrength[0]} score of ${Math.round(topStrength[1])}% shows strong habits in this pillar. This provides a solid foundation - maintaining this while improving other areas will compound your longevity gains.`,
      priorities: `${topWeakness[0]} (${Math.round(topWeakness[1])}%) represents your highest-impact improvement opportunity. Research shows that targeted interventions in your weakest pillar can shift your overall aging trajectory within 4-6 weeks and add years to your healthspan.`
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) return null;

  const riskCategory = getRiskCategory(results.finalScore);
  const bioAgeData = calculateBiologicalAge();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Longevity Impact Score</h1>
          <p className="text-muted-foreground">Based on science-backed lifestyle factors</p>
        </div>

        {/* Main Score Card */}
        <Card className="p-8 mb-6 text-center border-2">
          <div className="mb-6">
            <div className="text-7xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
              {results.finalScore}
            </div>
            <div className="text-2xl text-muted-foreground mb-4">out of 100</div>
            <Badge className={`${riskCategory.color} text-white text-lg px-6 py-2`}>
              {riskCategory.label}
            </Badge>
          </div>

          <Progress value={results.finalScore} className="h-3 mb-4" />

          <div className="space-y-4">
            {(() => {
              const analysis = getComprehensiveAnalysis();
              if (!analysis) return <p className="text-muted-foreground">Analysis unavailable</p>;
              
              return (
                <>
                  <div className="bg-muted/30 p-4 rounded-lg">
                    <h4 className="font-semibold text-sm mb-2 text-primary">Overall Assessment</h4>
                    <p className="text-sm text-muted-foreground mb-3">{analysis.overview}</p>
                    <p className="text-sm text-muted-foreground">{analysis.biologicalAge}</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-success/5 border border-success/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-success flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Your Strength
                      </h4>
                      <p className="text-xs text-muted-foreground">{analysis.strengths}</p>
                    </div>
                    
                    <div className="bg-warning/5 border border-warning/20 p-3 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2 text-warning flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Priority Focus
                      </h4>
                      <p className="text-xs text-muted-foreground">{analysis.priorities}</p>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          {results.smokingPenalty > 0 && (
            <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive font-medium">
                <AlertCircle className="w-5 h-5" />
                Smoking Penalty Applied: -{results.smokingPenalty} points
              </div>
            </div>
          )}

          {/* Short Disclaimer */}
          <div className="mt-6 p-4 bg-muted/50 border border-muted rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Note:</strong> This LIS assessment is a guide based on your responses. For accurate biological age measurement, we recommend comprehensive blood testing and biomarker analysis.
            </p>
          </div>
        </Card>

        {/* Biological Age Card */}
        {assessmentData?.baselineData && (
          <Card className="p-8 mb-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-4">Your Biological Age Estimate</h3>
              
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto mb-6">
                <strong>Biological age</strong> measures how well your body is functioning at a cellular level, while <strong>chronological age</strong> is simply the number of years you've been alive. Your lifestyle choices, stress levels, sleep quality, and nutrition can make your body function younger or older than your calendar age.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Chronological Age</div>
                  <div className="text-4xl font-bold">{assessmentData.baselineData.age}</div>
                  <div className="text-xs text-muted-foreground mt-1">years</div>
                </div>

                <div className="p-4 bg-background rounded-lg border-2 border-primary">
                  <div className="text-sm text-muted-foreground mb-1">Biological Age</div>
                  <div className="text-4xl font-bold text-primary">{bioAgeData.bioAge}</div>
                  <div className="text-xs text-muted-foreground mt-1">years</div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <div className="text-sm text-muted-foreground mb-1">Age Delta</div>
                  <div className={`text-4xl font-bold ${bioAgeData.delta > 0 ? 'text-destructive' : 'text-green-600'}`}>
                    {bioAgeData.delta > 0 ? '+' : ''}{bioAgeData.delta}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">years</div>
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg mb-6">
                <p className="text-sm text-muted-foreground mb-2">
                  Based on your LIS score of {results.finalScore}, your lifestyle is causing you to age approximately{' '}
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-base">In 5 Years</span>
                    <span className="text-sm text-muted-foreground">
                      You'll be {assessmentData.baselineData.age + 5} years old
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
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-base">In 20 Years</span>
                    <span className="text-sm text-muted-foreground">
                      You'll be {assessmentData.baselineData.age + 20} years old
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
              </div>

              {/* Medium Disclaimer */}
              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Important:</strong> Your Longevity Impact Score is an estimation based on self-reported lifestyle factors and health behaviors. While this assessment provides valuable insights into your longevity trajectory, it is not a substitute for clinical testing. For precise biological age determination, we recommend comprehensive blood work including inflammation markers, metabolic panels, and hormonal assessments.
                </p>
              </div>

              <div className="mt-6 p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-primary">
                  <Lock className="w-4 h-4 inline mr-1" />
                  Register to unlock detailed aging insights and personalized action plan
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Detailed Pillar Analysis */}
        <div className="mb-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Detailed Pillar Analysis</h2>
            <p className="text-muted-foreground">
              Deep dive into each of the 6 longevity pillars with personalized insights and recommendations
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {generatePillarAnalysis(results.pillarScores).map((pillar) => (
              <LISPillarAnalysisCard
                key={pillar.name}
                pillarName={pillar.name}
                pillarDisplayName={pillar.displayName}
                pillarAnalysisName={pillar.analysisName}
                pillarScore={pillar.score}
                icon={pillar.icon}
                color={pillar.color}
                overallLIS={results.finalScore}
                userAge={assessmentData?.baselineData?.age}
              />
            ))}
          </div>
        </div>

        {/* Pillar Scores */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Top Strengths */}
          <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <h3 className="text-xl font-semibold">Top Strengths</h3>
            </div>
            <div className="space-y-3">
              {getTopStrengths().map(([pillar, score]) => (
                <div key={pillar} className="flex items-center justify-between">
                  <span className="font-medium">{pillar}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={score} className="w-24 h-2" />
                    <span className="text-sm font-semibold w-12 text-right">{score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Areas for Improvement */}
          <Card className="p-6 border-2 border-orange-500/20 bg-orange-500/5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingDown className="w-5 h-5 text-orange-600" />
              <h3 className="text-xl font-semibold">Improvement Opportunities</h3>
            </div>
            <div className="space-y-3">
              {getTopImprovements().map(([pillar, score]) => (
                <div key={pillar} className="flex items-center justify-between">
                  <span className="font-medium">{pillar}</span>
                  <div className="flex items-center gap-2">
                    <Progress value={score} className="w-24 h-2" />
                    <span className="text-sm font-semibold w-12 text-right">{score}/100</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Registration CTA */}
        <Card className="p-8 border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-3">Unlock Your Complete Analysis</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Register now to access your detailed longevity insights and start your transformation
            </p>

            <div className="grid md:grid-cols-3 gap-4 mb-8 text-left">
              <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Full Pillar Breakdown</div>
                  <div className="text-sm text-muted-foreground">
                    Detailed analysis of all 4 longevity pillars with evidence-based insights
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Biological Age Impact</div>
                  <div className="text-sm text-muted-foreground">
                    See how your lifestyle is affecting your biological aging rate
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <div className="font-semibold mb-1">Personalized Action Plan</div>
                  <div className="text-sm text-muted-foreground">
                    Science-backed recommendations tailored to your specific results
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                size="lg"
                onClick={() => navigate(`/auth?session=${sessionId}`)}
                className="text-lg px-8 py-6 h-auto"
              >
                Register for Your Free Detailed Analysis
              </Button>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="w-4 h-4" />
                <span>Includes FREE 7-Day Premium Trial with daily tracking & AI insights</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <Button variant="ghost" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
