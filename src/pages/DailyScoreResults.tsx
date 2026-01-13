import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, Activity, ArrowRight, PartyPopper, Home } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

const DailyScoreResults = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t } = useTranslation();
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
    if (score >= 80) return t('dailyScore.categories.excellent');
    if (score >= 60) return t('dailyScore.categories.good');
    if (score >= 40) return t('dailyScore.categories.fair');
    return t('dailyScore.categories.needsFocus');
  };

  const getEncouragement = (score: number) => {
    if (score >= 80) return t('dailyScore.encouragement.excellent');
    if (score >= 60) return t('dailyScore.encouragement.good');
    if (score >= 40) return t('dailyScore.encouragement.fair');
    return t('dailyScore.encouragement.needsFocus');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl mx-auto py-8 px-4">
        {/* Top Return Button */}
        <div className="flex justify-start mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate(user ? '/today' : '/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            {user ? t('dailyScore.returnToToday') : t('dailyScore.backToHome')}
          </Button>
        </div>
        
        {/* Success Header */}
        {isFirstTime && (
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-primary/10">
                <PartyPopper className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">
              {t('dailyScore.congratulations')}
            </h1>
            <p className="text-lg text-muted-foreground">
              {t('dailyScore.firstScoreComplete')}
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
              <div className="text-sm text-muted-foreground">{t('dailyScore.outOf100')}</div>
            </div>
            <CardTitle className="text-2xl">
              {t('dailyScore.scoreTitle', { category: getScoreCategory(score) })}
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
                {t('dailyScore.whatThisMeans')}
              </h3>
              <div className="grid gap-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Activity className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('dailyScore.dailyTracking')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('dailyScore.dailyTrackingDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-sm">{t('dailyScore.personalisedInsights')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('dailyScore.personalisedInsightsDesc')}
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
            <CardTitle className="text-lg">{t('dailyScore.whatsNext')}</CardTitle>
            <CardDescription>
              {t('dailyScore.journeyContinues')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="text-primary font-bold">•</span>
                {t('dailyScore.viewDashboard')}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-primary font-bold">•</span>
                {t('dailyScore.trackProgress')}
              </p>
              <p className="flex items-center gap-2">
                <span className="text-primary font-bold">•</span>
                {t('dailyScore.getRecommendations')}
              </p>
            </div>
            
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/dashboard')}
            >
              {t('dailyScore.goToDashboard')}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </CardContent>
        </Card>
        
        {/* Bottom Return Button */}
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            onClick={() => navigate(user ? '/today' : '/')} 
            size="lg"
          >
            {user ? t('dailyScore.returnToToday') : t('dailyScore.backToHome')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DailyScoreResults;
