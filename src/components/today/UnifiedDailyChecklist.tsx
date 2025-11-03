import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Sunset, Moon, Clock, Lock, ShoppingCart } from "lucide-react";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useGoals } from "@/hooks/useGoals";
import { toast } from "sonner";
import { SAMPLE_DAILY_ACTIONS, SAMPLE_GOALS } from "@/data/sampleDailyPlan";
import { useState } from "react";
import { getTodaysQuote } from "@/data/femaleLongevityQuotes";
import ScienceBackedIcon from "@/components/ScienceBackedIcon";
import { useCart } from "@/hooks/useCart";

export const UnifiedDailyChecklist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { goals } = useGoals();
  const { addToCart } = useCart();
  const { actions: userActions, loading, completedCount: userCompletedCount, totalCount: userTotalCount, refetch } = useDailyPlan();
  
  const isUsingSampleData = !loading && userActions.length === 0;
  const actions = isUsingSampleData ? SAMPLE_DAILY_ACTIONS : userActions;
  const [sampleCompletedIds, setSampleCompletedIds] = useState<Set<string>>(new Set());
  
  const totalCount = isUsingSampleData ? SAMPLE_DAILY_ACTIONS.length : userTotalCount;
  const completedCount = isUsingSampleData ? sampleCompletedIds.size : userCompletedCount;
  
  const todaysQuote = getTodaysQuote();
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  const handleToggle = async (actionId: string) => {
    if (isUsingSampleData) {
      setSampleCompletedIds(prev => {
        const next = new Set(prev);
        if (next.has(actionId)) {
          next.delete(actionId);
        } else {
          next.add(actionId);
        }
        return next;
      });
      return;
    }

    const action = userActions.find(a => a.id === actionId);
    if (!action || !user) return;

    try {
      if (action.type === 'protocol' && 'protocolItemId' in action && action.protocolItemId) {
        const today = new Date().toISOString().split('T')[0];
        
        if (action.completed) {
          await supabase
            .from('protocol_item_completions')
            .delete()
            .eq('user_id', user.id)
            .eq('protocol_item_id', action.protocolItemId)
            .eq('completed_date', today);
        } else {
          await supabase
            .from('protocol_item_completions')
            .insert({
              user_id: user.id,
              protocol_item_id: action.protocolItemId,
              completed_date: today
            });
          toast.success("Great work!");
        }
        
        refetch();
      }
    } catch (error) {
      console.error('Error toggling action:', error);
      toast.error("Failed to update");
    }
  };

  const handleBuySupplements = (action: any) => {
    // Mock supplement product for cart
    addToCart({
      id: `supplement-${action.id}`,
      name: action.title,
      price: 45.00,
      originalPrice: 65.00,
      image: '/placeholder.svg',
      brand: 'Longevity Labs',
      dosage: 'Daily',
      quantity: 1
    });
    toast.success("Added to cart!");
  };

  const morningActions = actions.filter((a: any) => a.timeOfDay?.includes('morning'));
  const afternoonActions = actions.filter((a: any) => a.timeOfDay?.includes('afternoon') || a.timeOfDay?.includes('midday'));
  const eveningActions = actions.filter((a: any) => a.timeOfDay?.includes('evening') || a.timeOfDay?.includes('night'));

  const getItemCompleted = (actionId: string) => {
    if (isUsingSampleData) {
      return sampleCompletedIds.has(actionId);
    }
    return actions.find(a => a.id === actionId)?.completed || false;
  };

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingMinutes = actions
    .filter((a: any) => !getItemCompleted(a.id))
    .reduce((sum: number, a: any) => sum + a.estimatedMinutes, 0);

  const activeGoals = goals?.filter(g => g.status === 'active') || [];
  const displayGoals = isUsingSampleData ? SAMPLE_GOALS : activeGoals;

  if (loading) {
    return (
      <div className="py-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          <p>Loading your daily plan...</p>
        </div>
      </div>
    );
  }

  const TimeSection = ({ title, icon: Icon, items }: any) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground uppercase tracking-wider border-b border-border pb-2">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </div>
        {items.map((action: any) => {
          const isCompleted = getItemCompleted(action.id);
          const isSupplementCategory = action.category === 'supplement';
          
          return (
            <div
              key={action.id}
              className="group relative flex items-start gap-3 p-3 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all"
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => handleToggle(action.id)}
                className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                disabled={isUsingSampleData && !user}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className={`font-medium ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {action.title}
                    </p>
                    <ScienceBackedIcon className="w-3.5 h-3.5" showTooltip={true} />
                  </div>
                  {action.pillar && (
                    <Badge variant="outline" className="text-xs capitalize shrink-0 bg-primary/5 text-primary border-primary/20">
                      {action.pillar}
                    </Badge>
                  )}
                </div>
                {action.description && (
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {action.estimatedMinutes} min
                  </div>
                  {isSupplementCategory && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleBuySupplements(action)}
                      className="h-7 text-xs gap-1 text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      Buy
                    </Button>
                  )}
                </div>
              </div>
              
              {isUsingSampleData && !user && (
                <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    onClick={() => navigate('/auth')}
                    className="shadow-lg"
                  >
                    <Lock className="w-3 h-3 mr-1" />
                    Sign Up to Track
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Date & Quote Header */}
      <div className="space-y-4 pb-6 border-b-2 border-primary/20">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          TODAY - {dateString}
        </h1>
        <div className="flex items-start gap-3 p-4 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-lg border border-primary/10">
          <span className="text-2xl">💫</span>
          <div>
            <p className="text-foreground italic leading-relaxed">
              "{todaysQuote.quote}"
            </p>
            <p className="text-sm text-muted-foreground mt-1">— {todaysQuote.author}</p>
          </div>
        </div>
      </div>

      {/* Goals Section */}
      {displayGoals.length > 0 && (
        <div className="space-y-3 pb-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide">
            YOUR GOALS TODAY
          </h2>
          {displayGoals.map(goal => {
            const daysSinceStart = isUsingSampleData 
              ? goal.days_active 
              : Math.floor((Date.now() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24));
            const progress = isUsingSampleData 
              ? goal.progress_percentage 
              : Math.min(Math.round((daysSinceStart / 90) * 100), 100);
            
            return (
              <div key={goal.id} className="flex items-start gap-2">
                <Checkbox checked={progress >= 50} className="mt-1" disabled />
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {goal.title} - Day {daysSinceStart}/90 ({progress}% complete)
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Progress Summary */}
      <div className="space-y-2 pb-6 border-b-2 border-primary/20">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-foreground">
            Progress: {completedCount}/{totalCount} actions complete • {remainingMinutes} min remaining
          </span>
        </div>
        <Progress value={progressPercent} className="h-2 bg-muted" />
      </div>

      {/* Time-Based Sections */}
      <div className="space-y-8">
        <TimeSection title="MORNING ESSENTIALS (Before 10 AM)" icon={Sun} items={morningActions} />
        <TimeSection title="AFTERNOON FOCUS" icon={Sunset} items={afternoonActions} />
        <TimeSection title="EVENING ROUTINE" icon={Moon} items={eveningActions} />
      </div>

      {/* Guest CTA */}
      {!user && (
        <div className="mt-8 p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-primary/20 text-center space-y-3">
          <h3 className="text-xl font-bold text-foreground">Ready to Unlock Your Personalized Plan?</h3>
          <p className="text-muted-foreground">
            Create a free account to save progress, get AI insights, and access personalized protocols
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Button size="lg" onClick={() => navigate('/auth')}>
              Create Free Account
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/guest-lis-assessment')}>
              Take Assessment First
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};