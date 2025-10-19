import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Droplet, Sun, Moon, Wind } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DailyEssential {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ESSENTIALS: DailyEssential[] = [
  {
    id: "morning_sunlight",
    label: "Morning Sunlight",
    icon: <Sun className="w-4 h-4" />,
    description: "10-30 minutes within 2 hours of waking"
  },
  {
    id: "hydration",
    label: "Hydration",
    icon: <Droplet className="w-4 h-4" />,
    description: "2L water throughout the day"
  },
  {
    id: "deep_breathing",
    label: "Deep Breathing",
    icon: <Wind className="w-4 h-4" />,
    description: "5 minutes of breathwork"
  },
  {
    id: "sleep_log",
    label: "Log Last Night's Sleep",
    icon: <Moon className="w-4 h-4" />,
    description: "Track sleep quality"
  }
];

export const DailyEssentialsCard = () => {
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (user) {
      loadCompletions();
    }
  }, [user]);

  const loadCompletions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('daily_essentials_completions')
        .select('essential_id')
        .eq('user_id', user.id)
        .eq('date', today);

      if (error) throw error;
      
      setCompletions(new Set(data?.map(d => d.essential_id) || []));
    } catch (error) {
      console.error('Error loading daily essentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCompletion = async (essentialId: string) => {
    if (!user) return;

    const isCompleted = completions.has(essentialId);
    
    try {
      if (isCompleted) {
        await supabase
          .from('daily_essentials_completions')
          .delete()
          .eq('user_id', user.id)
          .eq('essential_id', essentialId)
          .eq('date', today);
        
        setCompletions(prev => {
          const next = new Set(prev);
          next.delete(essentialId);
          return next;
        });
      } else {
        await supabase
          .from('daily_essentials_completions')
          .insert({
            user_id: user.id,
            essential_id: essentialId,
            date: today
          });
        
        setCompletions(prev => new Set(prev).add(essentialId));
        toast.success("Essential completed!");
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error("Failed to update");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daily Essentials</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Daily Essentials</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {ESSENTIALS.map(essential => (
          <div key={essential.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
            <Checkbox
              checked={completions.has(essential.id)}
              onCheckedChange={() => toggleCompletion(essential.id)}
            />
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                {essential.icon}
                <span className={completions.has(essential.id) ? "line-through text-muted-foreground" : ""}>
                  {essential.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{essential.description}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
