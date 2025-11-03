import { Card } from "@/components/ui/card";
import { getTimeContext } from "@/utils/timeContext";
import { getTodaysQuote } from "@/data/femaleLongevityQuotes";
import { useAuth } from "@/hooks/useAuth";
import { useGoals } from "@/hooks/useGoals";
import { Progress } from "@/components/ui/progress";
import { Target, Sparkles } from "lucide-react";

export const DailyMotivationHeader = () => {
  const { user } = useAuth();
  const context = getTimeContext();
  const todaysQuote = getTodaysQuote();
  const { goals } = useGoals();
  
  const activeGoal = goals?.find(g => g.status === 'active');
  const daysSinceStart = activeGoal 
    ? Math.floor((Date.now() - new Date(activeGoal.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const progress = Math.min(Math.round((daysSinceStart / 90) * 100), 100);
  
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className={`bg-gradient-to-r ${context.color} p-6 text-white`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-4xl">{context.emoji}</span>
          <div>
            <h2 className="text-2xl font-bold">
              {context.greeting}
              {user?.email && `, ${user.email.split('@')[0]}`}!
            </h2>
            <p className="text-white/90 text-sm">{context.message}</p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
          <div>
            <p className="text-foreground italic leading-relaxed">
              "{todaysQuote.quote}"
            </p>
            <p className="text-sm text-muted-foreground mt-1">— {todaysQuote.author}</p>
          </div>
        </div>
        
        {activeGoal && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold">Your Active Goal</p>
            </div>
            <p className="text-foreground font-medium mb-2">{activeGoal.title}</p>
            <div className="flex items-center gap-3">
              <Progress value={progress} className="flex-1" />
              <span className="text-sm text-muted-foreground whitespace-nowrap">
                Day {daysSinceStart} of 90
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
