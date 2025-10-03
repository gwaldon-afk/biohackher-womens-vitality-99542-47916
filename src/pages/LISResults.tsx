import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Lock, TrendingUp, Activity, Brain, Heart, Users, Moon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LISInputForm from '@/components/LISInputForm';
import FirstTimeDailyScoreWelcome from '@/components/FirstTimeDailyScoreWelcome';
import { useLISData } from '@/hooks/useLISData';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/Navigation';

const LISResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isGuest = !user;
  const score = parseFloat(searchParams.get('score') || '0');
  const lisData = useLISData();
  const { toast } = useToast();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreCategory = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Attention';
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
              {score.toFixed(1)}
            </div>
          </div>
          <CardTitle className="text-2xl">Your Longevity Impact Score</CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mt-2">
              {getScoreCategory(score)}
            </Badge>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={score} className="h-3 mb-6" />
          
          {/* Brief Analysis - Available to Everyone */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Overview
            </h3>
            <p className="text-muted-foreground">
              Your LIS 2.0 score of <strong>{score.toFixed(1)}</strong> indicates {getScoreCategory(score).toLowerCase()} longevity habits. 
              This score is calculated across 6 key pillars of health and longevity.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm">
                <Heart className="h-4 w-4 text-primary" />
                <span>Stress Management</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="h-4 w-4 text-primary" />
                <span>Physical Activity</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Moon className="h-4 w-4 text-primary" />
                <span>Sleep Quality</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span>Nutrition</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-primary" />
                <span>Social Connection</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Brain className="h-4 w-4 text-primary" />
                <span>Cognitive Engagement</span>
              </div>
            </div>
          </div>

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

          {/* Registered User - Show Detailed Analysis */}
          {!isGuest && (
            <div className="mt-6 space-y-4">
              <div className="border-t pt-4">
                <h3 className="font-semibold text-lg flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Detailed Pillar Analysis
                </h3>
                
                <div className="space-y-4">
                  {/* Placeholder for detailed pillar scores */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Stress & Subjective Age
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={75} className="mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Your stress management and subjective age perception are in good range. Continue mindfulness practices.
                      </p>
                    </CardContent>
                  </Card>

                  <Alert className="bg-primary/5 border-primary/20">
                    <Activity className="h-5 w-5 text-primary" />
                    <AlertTitle>Next Step: Track Your First Day</AlertTitle>
                    <AlertDescription className="mt-2">
                      <p className="text-sm mb-3">
                        Now that you've established your baseline, it's time to start your daily tracking journey. 
                        Submit your first daily score to see how your habits impact your longevity.
                      </p>
                      <ul className="space-y-2 text-sm mb-4">
                        <li className="flex gap-2">
                          <span className="text-primary">→</span>
                          <span>Takes just 2 minutes per day</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">→</span>
                          <span>Track across 6 key longevity pillars</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-primary">→</span>
                          <span>See your progress and trends over time</span>
                        </li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>
              </div>

              <div className="space-y-3">
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
