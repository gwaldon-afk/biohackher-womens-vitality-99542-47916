import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, Activity, ArrowRight, PartyPopper } from 'lucide-react';
import Navigation from '@/components/Navigation';
import { format } from 'date-fns';

const DailyScoreResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const score = parseFloat(searchParams.get('score') || '0');
  const dateStr = searchParams.get('date') || '';
  const version = searchParams.get('version') || 'LIS 1.0';
  const isFirstTime = searchParams.get('firstTime') === 'true';

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-orange-600';
  };

  const getScoreCategory = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Focus';
  };

  const getEncouragement = (score: number) => {
    if (score >= 80) return "Outstanding! You're making choices that significantly support your longevity.";
    if (score >= 60) return "Great work! You're on the right track with solid healthy habits.";
    if (score >= 40) return "Good start! There's room to improve your daily habits for better health outcomes.";
    return "Every journey starts somewhere! Small improvements each day add up to big results.";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-3xl mx-auto py-8 px-4">
        {/* Success Header */}
        {isFirstTime && (
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <PartyPopper className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              Congratulations! 🎉
            </h1>
            <p className="text-lg text-muted-foreground">
              You've completed your first daily score
            </p>
          </div>
        )}

        {/* Score Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Badge variant="secondary">{version}</Badge>
              <Badge variant="outline">{dateStr ? format(new Date(dateStr), 'dd MMM yyyy') : 'Today'}</Badge>
            </div>
            <div className="mb-4">
              <div className={`text-7xl font-bold ${getScoreColor(score)} mb-2`}>
                {score.toFixed(1)}
              </div>
              <div className="text-sm text-muted-foreground">out of 100</div>
            </div>
            <CardTitle className="text-2xl">
              {getScoreCategory(score)} Score
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Progress value={score} className="h-3" />
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <p className="text-center text-sm">
                {getEncouragement(score)}
              </p>
            </div>

            {/* Quick Insights */}
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                What This Means
              </h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Daily Tracking</p>
                    <p className="text-xs text-muted-foreground">
                      Continue tracking daily to see trends and patterns in your health journey
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">Personalized Insights</p>
                    <p className="text-xs text-muted-foreground">
                      After a few days, you'll unlock detailed analysis and recommendations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What's Next?</CardTitle>
            <CardDescription>
              Your health journey continues on your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-primary font-bold">•</span>
                View your complete health dashboard
              </p>
              <p className="flex items-center gap-2">
                <span className="text-primary font-bold">•</span>
                Track your progress over time
              </p>
              <p className="flex items-center gap-2">
                <span className="text-primary font-bold">•</span>
                Get personalized recommendations
              </p>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              Go to My Dashboard
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DailyScoreResults;
