import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from '@/components/Navigation';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { TimeBasedGreeting } from '@/components/today/TimeBasedGreeting';
import { DailyProgressRing } from '@/components/today/DailyProgressRing';
import { SwipeableActionCard } from '@/components/today/SwipeableActionCard';
import { EnergyPrediction } from '@/components/today/EnergyPrediction';
import { LISImpactPreview } from '@/components/today/LISImpactPreview';
import { TomorrowPrep } from '@/components/today/TomorrowPrep';
import { InsightCard } from '@/components/today/InsightCard';
import { useDailyPlan } from '@/hooks/useDailyPlan';
import { useProtocolCompletions, useToggleProtocolCompletion } from '@/queries/protocolQueries';
import { useAuth } from '@/hooks/useAuth';
import { useEnergyLoop } from '@/hooks/useEnergyLoop';
import { useStreaks } from '@/hooks/useStreaks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, Zap, Brain, ArrowRight } from 'lucide-react';
import { triggerCelebration, getEncouragingMessage } from '@/utils/celebrationEffects';
import { useToast } from '@/hooks/use-toast';
import { getTimeOfDay } from '@/utils/timeContext';

const TodayHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const today = new Date().toISOString().split('T')[0];
  
  const {
    actions,
    loading,
    completedCount,
    totalCount,
    completionPercentage,
    quickWins,
    energyBoosters,
    deepPractices,
    top3,
    dailyStreak,
    refetch
  } = useDailyPlan();

  const { completeAction, currentScore, recentScores } = useEnergyLoop();
  const { updateStreak } = useStreaks();
  const toggleProtocolCompletion = useToggleProtocolCompletion(user?.id || '');

  const [lastCompletedCount, setLastCompletedCount] = useState(completedCount);
  const [dismissedInsights, setDismissedInsights] = useState<string[]>([]);
  
  const timeOfDay = getTimeOfDay();
  const showTomorrowPrep = timeOfDay === 'evening' || timeOfDay === 'night';

  // Generate intelligent insights
  const insights = [
    {
      id: '1',
      title: 'Morning Sunlight Boosts Sleep',
      description: 'When you complete morning sunlight, your sleep score improves by avg 12 points.',
      actionSuggestion: 'Get outside within 30 min of waking'
    },
    {
      id: '2',
      title: 'Energy Pattern Detected',
      description: 'Your energy peaks between 9-11am. Schedule demanding tasks then.',
      actionSuggestion: 'Block calendar for deep work during peak hours'
    }
  ].filter(i => !dismissedInsights.includes(i.id));

  useEffect(() => {
    if (completedCount > lastCompletedCount) {
      triggerCelebration();
      toast({
        title: getEncouragingMessage(completedCount, totalCount),
        duration: 3000
      });

      // Update streak if completed enough for the day (≥75%)
      if (completionPercentage >= 75 && completionPercentage < 100) {
        updateStreak('daily_completion');
      }
    }
    setLastCompletedCount(completedCount);
  }, [completedCount]);

  const handleToggleAction = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || !user) return;

    try {
      if (action.type === 'protocol' && action.protocolItemId) {
        await toggleProtocolCompletion.mutateAsync({
          protocolItemId: action.protocolItemId
        });
      } else if (action.type === 'energy' && action.energyActionId) {
        await completeAction(action.energyActionId);
      }

      await refetch();
    } catch (error) {
      console.error('Error toggling action:', error);
      toast({
        title: 'Error',
        description: 'Failed to update action',
        variant: 'destructive'
      });
    }
  };

  const handleSkipAction = (actionId: string) => {
    toast({
      title: 'Action skipped',
      description: 'You can always come back to it later',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your daily plan...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Navigation />
      <MobileBottomNav />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <TimeBasedGreeting />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <DailyProgressRing
              completed={completedCount}
              total={totalCount}
              streak={dailyStreak?.current_streak}
            />
            
            <LISImpactPreview 
              completedCount={completedCount}
              totalCount={totalCount}
            />
          </div>

          <div className="lg:col-span-2 space-y-6">
            {/* Insights */}
            {insights.length > 0 && (
              <div className="space-y-3">
                {insights.map(insight => (
                  <InsightCard
                    key={insight.id}
                    insight={insight}
                    onDismiss={() => setDismissedInsights([...dismissedInsights, insight.id])}
                  />
                ))}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Top 3 Priority Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {top3.length > 0 ? (
                  top3.map((action, index) => (
                    <SwipeableActionCard
                      key={action.id}
                      action={action}
                      onToggle={handleToggleAction}
                      onSkip={handleSkipAction}
                      rank={index + 1}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No actions scheduled for now.</p>
                    <Button
                      variant="link"
                      onClick={() => navigate('/my-protocol')}
                      className="mt-2"
                    >
                      Set up your protocol <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <EnergyPrediction 
              currentScore={currentScore?.composite_score}
              recentScores={recentScores}
            />

            {showTomorrowPrep && <TomorrowPrep />}
          </div>
        </div>

        {/* Categorized Actions */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({actions.length})
            </TabsTrigger>
            <TabsTrigger value="quick">
              <Zap className="w-4 h-4 mr-1" />
              Quick Wins ({quickWins.length})
            </TabsTrigger>
            <TabsTrigger value="energy">
              ⚡ Energy ({energyBoosters.length})
            </TabsTrigger>
            <TabsTrigger value="deep">
              <Brain className="w-4 h-4 mr-1" />
              Deep ({deepPractices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3 mt-6">
            {actions.map(action => (
              <SwipeableActionCard
                key={action.id}
                action={action}
                onToggle={handleToggleAction}
                onSkip={handleSkipAction}
              />
            ))}
          </TabsContent>

          <TabsContent value="quick" className="space-y-3 mt-6">
            {quickWins.map(action => (
              <SwipeableActionCard
                key={action.id}
                action={action}
                onToggle={handleToggleAction}
                onSkip={handleSkipAction}
              />
            ))}
          </TabsContent>

          <TabsContent value="energy" className="space-y-3 mt-6">
            {energyBoosters.map(action => (
              <SwipeableActionCard
                key={action.id}
                action={action}
                onToggle={handleToggleAction}
                onSkip={handleSkipAction}
              />
            ))}
          </TabsContent>

          <TabsContent value="deep" className="space-y-3 mt-6">
            {deepPractices.map(action => (
              <SwipeableActionCard
                key={action.id}
                action={action}
                onToggle={handleToggleAction}
                onSkip={handleSkipAction}
              />
            ))}
          </TabsContent>
        </Tabs>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Button
            variant="outline"
            className="h-auto p-4"
            onClick={() => navigate('/my-protocol')}
          >
            <div className="text-left w-full">
              <p className="font-semibold">View Full Protocol</p>
              <p className="text-xs text-muted-foreground">See all your health activities</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4"
            onClick={() => navigate('/my-goals')}
          >
            <div className="text-left w-full">
              <p className="font-semibold">My Goals</p>
              <p className="text-xs text-muted-foreground">Track your progress</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="h-auto p-4"
            onClick={() => navigate('/energy-loop/check-in')}
          >
            <div className="text-left w-full">
              <p className="font-semibold">Energy Check-In</p>
              <p className="text-xs text-muted-foreground">How are you feeling?</p>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TodayHub;
