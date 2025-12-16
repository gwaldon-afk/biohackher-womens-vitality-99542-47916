import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Droplet, Sun, Moon, Wind } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTranslation } from 'react-i18next';

interface DailyEssential {
  id: string;
  labelKey: string;
  icon: React.ReactNode;
  descriptionKey: string;
}

export const DailyEssentialsCard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [completions, setCompletions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  const ESSENTIALS: DailyEssential[] = [
    {
      id: "morning_sunlight",
      labelKey: "today.essentials.morningSunlight",
      icon: <Sun className="w-4 h-4" />,
      descriptionKey: "today.essentials.morningSunlightDesc"
    },
    {
      id: "hydration",
      labelKey: "today.essentials.hydration",
      icon: <Droplet className="w-4 h-4" />,
      descriptionKey: "today.essentials.hydrationDesc"
    },
    {
      id: "deep_breathing",
      labelKey: "today.essentials.deepBreathing",
      icon: <Wind className="w-4 h-4" />,
      descriptionKey: "today.essentials.deepBreathingDesc"
    },
    {
      id: "sleep_log",
      labelKey: "today.essentials.sleepLog",
      icon: <Moon className="w-4 h-4" />,
      descriptionKey: "today.essentials.sleepLogDesc"
    }
  ];

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
        toast.success(t('today.essentials.completed'));
      }
    } catch (error) {
      console.error('Error toggling completion:', error);
      toast.error(t('today.essentials.updateFailed'));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('today.essentials.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('common.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('today.essentials.title')}</CardTitle>
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
                  {t(essential.labelKey)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{t(essential.descriptionKey)}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
