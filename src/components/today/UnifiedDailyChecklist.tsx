import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sun, Sunset, Moon, Clock, Lock, Target } from "lucide-react";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { SAMPLE_DAILY_ACTIONS } from "@/data/sampleDailyPlan";
import { useState } from "react";

export const UnifiedDailyChecklist = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { actions: userActions, loading, completedCount: userCompletedCount, totalCount: userTotalCount, refetch } = useDailyPlan();
  
  // Use sample data if no user data exists
  const isUsingSampleData = !loading && userActions.length === 0;
  const actions = isUsingSampleData ? SAMPLE_DAILY_ACTIONS : userActions;
  const [sampleCompletedIds, setSampleCompletedIds] = useState<Set<string>>(new Set());
  
  const totalCount = isUsingSampleData ? SAMPLE_DAILY_ACTIONS.length : userTotalCount;
  const completedCount = isUsingSampleData ? sampleCompletedIds.size : userCompletedCount;

  const handleToggle = async (actionId: string) => {
    // If using sample data, just toggle in local state
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

    // Otherwise, handle real user data
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

  const morningActions = actions.filter((a: any) => 
    a.timeOfDay?.includes('morning')
  );
  const afternoonActions = actions.filter((a: any) => 
    a.timeOfDay?.includes('afternoon') || a.timeOfDay?.includes('midday')
  );
  const eveningActions = actions.filter((a: any) => 
    a.timeOfDay?.includes('evening') || a.timeOfDay?.includes('night')
  );

  // Map completed state for sample data
  const getItemCompleted = (actionId: string) => {
    if (isUsingSampleData) {
      return sampleCompletedIds.has(actionId);
    }
    return actions.find(a => a.id === actionId)?.completed || false;
  };

  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const remainingMinutes = actions
    .filter(a => !a.completed)
    .reduce((sum, a) => sum + a.estimatedMinutes, 0);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Checklist</CardTitle>
        </CardHeader>
        <CardContent className="py-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <p>Loading your daily plan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const TimeSection = ({ title, icon: Icon, items }: any) => {
    if (items.length === 0) return null;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground/70 uppercase tracking-wider">
          <Icon className="w-5 h-5 text-primary" />
          {title}
        </div>
        {items.map((action: any) => {
          const isCompleted = getItemCompleted(action.id);
          const isPillar = action.pillar;
          
          return (
            <div
              key={action.id}
              className="group relative flex items-start gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-md transition-all"
            >
              <Checkbox
                checked={isCompleted}
                onCheckedChange={() => handleToggle(action.id)}
                className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                disabled={isUsingSampleData && !user}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className={`font-semibold ${isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {action.title}
                  </p>
                  {isPillar && (
                    <Badge variant="outline" className="text-xs capitalize shrink-0 bg-primary/5 text-primary border-primary/20">
                      {isPillar}
                    </Badge>
                  )}
                </div>
                {action.description && (
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{action.description}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {action.estimatedMinutes} min
                  </div>
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
                    Unlock
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
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-br from-primary/5 to-secondary/5 border-b border-primary/10">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            <span>Your Daily Protocol</span>
          </CardTitle>
          <Badge variant="outline" className="bg-background text-base px-3 py-1">
            {completedCount} / {totalCount}
          </Badge>
        </div>
        
        {isUsingSampleData && !user && (
          <div className="mb-3 p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground/80 flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span><strong>Preview Mode:</strong> Sign up to save progress and unlock your personalized plan</span>
            </p>
          </div>
        )}
        
        <div className="space-y-3">
          <Progress 
            value={progressPercent} 
            className="h-3 bg-muted" 
          />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground font-medium">{progressPercent}% Complete</span>
            <span className="text-muted-foreground">{remainingMinutes} min remaining</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8 pt-6">
        <TimeSection title="Morning Routine" icon={Sun} items={morningActions} />
        <TimeSection title="Afternoon Actions" icon={Sunset} items={afternoonActions} />
        <TimeSection title="Evening Protocol" icon={Moon} items={eveningActions} />
      </CardContent>
    </Card>
  );
};
