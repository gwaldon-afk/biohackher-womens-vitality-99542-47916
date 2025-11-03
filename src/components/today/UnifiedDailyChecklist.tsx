import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Sun, Sunset, Moon, Clock } from "lucide-react";
import { useDailyPlan } from "@/hooks/useDailyPlan";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const UnifiedDailyChecklist = () => {
  const { user } = useAuth();
  const { actions, loading, completedCount, totalCount, refetch } = useDailyPlan();

  console.log('[UnifiedDailyChecklist] User:', user?.id);
  console.log('[UnifiedDailyChecklist] Actions:', actions.length);
  console.log('[UnifiedDailyChecklist] Loading:', loading);

  const handleToggle = async (actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action || !user) return;

    try {
      if (action.type === 'protocol' && action.protocolItemId) {
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

  const morningActions = actions.filter(a => 
    a.timeOfDay?.includes('morning') || a.category === 'quick_win'
  );
  const afternoonActions = actions.filter(a => 
    a.timeOfDay?.includes('afternoon') || a.timeOfDay?.includes('midday')
  );
  const eveningActions = actions.filter(a => 
    a.timeOfDay?.includes('evening') || a.timeOfDay?.includes('night')
  );

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
        <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <Icon className="w-4 h-4" />
          {title}
        </div>
        {items.map((action: any) => (
          <div
            key={action.id}
            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              checked={action.completed}
              onCheckedChange={() => handleToggle(action.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className={`font-medium ${action.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {action.title}
              </p>
              {action.description && (
                <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {action.estimatedMinutes} min
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Today's Checklist</span>
          <span className="text-sm font-normal text-muted-foreground">
            {completedCount} of {totalCount}
          </span>
        </CardTitle>
        <div className="space-y-2">
          <Progress value={progressPercent} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercent}% complete</span>
            <span>{remainingMinutes} min remaining</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <TimeSection title="MORNING" icon={Sun} items={morningActions} />
        <TimeSection title="AFTERNOON" icon={Sunset} items={afternoonActions} />
        <TimeSection title="EVENING" icon={Moon} items={eveningActions} />
        
        {actions.length === 0 && (
          <div className="text-center py-12 space-y-4">
            <div className="text-4xl">📋</div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">No Daily Plan Yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Complete your assessments and generate a personalized protocol to see your daily actions here.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <Button
                variant="default"
                onClick={() => window.location.href = '/assessment-hub'}
              >
                Start Assessments
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/protocol-library'}
              >
                Browse Library
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
